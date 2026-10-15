import random
from datetime import date

from django.db.models import Exists, OuterRef

from api.models import FlashcardReview, Vocabulary, Kanji

LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1']

# Loại nội dung được ôn: tên -> (model, tên trường cấp độ).
# Chỉ muốn ôn từ vựng thì xoá dòng 'kanji'.
CARD_SOURCES = {
    'vocabulary': (Vocabulary, 'level'),
    'kanji': (Kanji, 'jlpt_level'),
}


def _level_of(content_type, obj):
    return getattr(obj, CARD_SOURCES[content_type][1])


def _rank(level):
    return LEVEL_ORDER.index(level) if level in LEVEL_ORDER else len(LEVEL_ORDER)


def build_content(content_type, obj):
    if content_type == 'vocabulary':
        return {'front': obj.word, 'kana': obj.kana, 'back': obj.meaning, 'level': obj.level}
    return {'front': obj.character, 'kana': None, 'back': obj.meaning, 'level': obj.jlpt_level}


def _load_objects(cards):
    ids_by_type = {}
    for card in cards:
        if card.content_type in CARD_SOURCES:
            ids_by_type.setdefault(card.content_type, set()).add(card.object_id)
    objects = {}
    for content_type, ids in ids_by_type.items():
        model = CARD_SOURCES[content_type][0]
        for pk, obj in model.objects.in_bulk(ids).items():
            objects[(content_type, pk)] = obj
    return objects


def _usable_cards(cards, levels):
    """Ghép thẻ với nội dung thật; bỏ thẻ trùng, thẻ trỏ vào từ đã bị xoá và thẻ sai cấp độ."""
    objects = _load_objects(cards)
    pairs, seen = [], set()
    for card in cards:
        key = (card.content_type, card.object_id)
        obj = objects.get(key)
        if obj is None or key in seen or _level_of(card.content_type, obj) not in levels:
            continue
        seen.add(key)
        pairs.append((card, obj))
    pairs.sort(key=lambda pair: _rank(_level_of(pair[0].content_type, pair[1])))
    return pairs


class DistractorPicker:
    """Chọn 3 nghĩa sai cho câu trắc nghiệm, ưu tiên cùng cấp độ."""

    def __init__(self):
        self._by_level = {}
        self._any = {}

    def _level_pool(self, content_type, level):
        key = (content_type, level)
        if key not in self._by_level:
            model, field = CARD_SOURCES[content_type]
            self._by_level[key] = list(
                model.objects.filter(**{field: level})
                .order_by('?').values_list('meaning', flat=True)[:60]
            )
        return self._by_level[key]

    def _any_pool(self, content_type):
        if content_type not in self._any:
            model = CARD_SOURCES[content_type][0]
            self._any[content_type] = list(
                model.objects.order_by('?').values_list('meaning', flat=True)[:60]
            )
        return self._any[content_type]

    def pick(self, content_type, level, correct, n=3):
        candidates = {m for m in self._level_pool(content_type, level) if m != correct}
        if len(candidates) < n:  # cấp độ ít từ thì bù thêm từ các cấp khác
            candidates |= {m for m in self._any_pool(content_type) if m != correct}
        return random.sample(sorted(candidates), min(n, len(candidates)))


def _item(content_type, obj, picker, card=None):
    content = build_content(content_type, obj)
    item = {
        'card_id': card.id if card else None,
        'content_type': content_type,
        'object_id': obj.pk,
        'is_new': card is None,
        'content': content,
        'distractors': picker.pick(content_type, content['level'], content['back']),
    }
    if card:
        item['next_review_date'] = card.next_review_date
        item['review_count'] = card.review_count
    return item


def _new_words(user, content_type, model):
    """Các từ mà user này chưa có thẻ."""
    has_card = FlashcardReview.objects.filter(
        user=user, content_type=content_type, object_id=OuterRef('pk')
    )
    return model.objects.annotate(has_card=Exists(has_card)).filter(has_card=False)


def build_queue(user, level=None, limit=20):
    levels = [level] if level in LEVEL_ORDER else LEVEL_ORDER
    picker = DistractorPicker()

    # 1. Thẻ đến hạn ôn lại, luôn đứng trước từ mới để không bị quên
    due_cards = FlashcardReview.objects.filter(
        user=user, next_review_date__lte=date.today()
    ).order_by('next_review_date', 'id')
    due_pairs = _usable_cards(list(due_cards), levels)
    items = [_item(card.content_type, obj, picker, card) for card, obj in due_pairs[:limit]]

    # 2. Từ mới chưa học, từ cấp thấp đến cao
    remaining = limit - len(items)
    for lvl in levels:
        for content_type, (model, field) in CARD_SOURCES.items():
            if remaining <= 0:
                break
            rows = list(
                _new_words(user, content_type, model)
                .filter(**{field: lvl}).order_by('id')[:remaining]
            )
            items += [_item(content_type, obj, picker) for obj in rows]
            remaining -= len(rows)

    new_count = sum(
        _new_words(user, content_type, model).filter(**{f'{field}__in': levels}).count()
        for content_type, (model, field) in CARD_SOURCES.items()
    )
    return {'items': items, 'due_count': len(due_pairs), 'new_count': new_count}


def build_reviewed(user, level=None, limit=200):
    """Các từ đã ôn xong: lịch ôn lại nằm ở tương lai."""
    levels = [level] if level in LEVEL_ORDER else LEVEL_ORDER
    cards = FlashcardReview.objects.filter(
        user=user, next_review_date__gt=date.today()
    ).order_by('id')
    pairs = _usable_cards(list(cards), levels)
    picker = DistractorPicker()
    return {
        'count': len(pairs),
        'items': [_item(card.content_type, obj, picker, card) for card, obj in pairs[:limit]],
    }