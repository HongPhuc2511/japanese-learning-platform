import random
from datetime import timedelta

from django.utils import timezone

from api.models import ExamAttempt, Grammar, Kanji, Question, Vocabulary
from api.models.enums import QuestionType

SECONDS_PER_QUESTION = 45  # thời gian cho mỗi câu
GRACE_SECONDS = 60  # độ trễ cho phép khi nộp bài (do mạng)
MIN_QUESTIONS = 5

SECTIONS = [
    ('vocab', 'Từ vựng'),
    ('kanji', 'Hán tự'),
    ('grammar', 'Ngữ pháp'),
    ('quiz', 'Câu hỏi tuyển chọn'),
]
SECTION_LABELS = dict(SECTIONS)
SECTION_ORDER = [key for key, _ in SECTIONS]


class NotEnoughQuestions(Exception):
    pass


# ---------- Tạo câu hỏi ----------

def _make_choices(correct, pool):
    """Trả về (4 đáp án đã xáo, vị trí đáp án đúng), hoặc None nếu không đủ đáp án nhiễu."""
    if not correct:
        return None
    others = list({p for p in pool if p and p != correct})
    if len(others) < 3:
        return None
    choices = random.sample(others, 3) + [correct]
    random.shuffle(choices)
    return choices, choices.index(correct)


def _vocab_questions(level, limit):
    rows = list(Vocabulary.objects.filter(level=level).values('word', 'kana', 'meaning'))
    meanings = [r['meaning'] for r in rows]
    readings = [r['kana'] for r in rows]
    random.shuffle(rows)

    questions = []
    for i, r in enumerate(rows):
        if len(questions) >= limit:
            break
        kinds = ['meaning']
        if i % 2 == 1 and r['word'] != r['kana']:
            kinds = ['reading', 'meaning']  # xen kẽ câu hỏi cách đọc và nghĩa

        for kind in kinds:
            correct = r['kana'] if kind == 'reading' else r['meaning']
            made = _make_choices(correct, readings if kind == 'reading' else meanings)
            if not made:
                continue
            choices, answer = made
            ask = 'Cách đọc' if kind == 'reading' else 'Nghĩa'
            questions.append({
                'prompt': f'{ask} của từ 「{r["word"]}」 là gì?',
                'choices': choices,
                'correct': answer,
                'explanation': f'{r["word"]} đọc là {r["kana"]}, nghĩa là: {r["meaning"]}.',
            })
            break
    return questions


def _kanji_questions(level, limit):
    rows = list(
        Kanji.objects.filter(jlpt_level=level).values('character', 'meaning', 'onyomi', 'kunyomi')
    )
    pools = {
        'meaning': [r['meaning'] for r in rows],
        'kunyomi': [r['kunyomi'] for r in rows if r['kunyomi']],
        'onyomi': [r['onyomi'] for r in rows if r['onyomi']],
    }
    random.shuffle(rows)

    questions = []
    for i, r in enumerate(rows):
        if len(questions) >= limit:
            break
        fields = ['meaning']
        if i % 2 == 1:
            reading = 'kunyomi' if r['kunyomi'] else ('onyomi' if r['onyomi'] else None)
            if reading:
                fields = [reading, 'meaning']

        for field in fields:
            made = _make_choices(r[field], pools[field])
            if not made:
                continue
            choices, answer = made
            ask = {'meaning': 'Nghĩa', 'kunyomi': 'Âm Kun', 'onyomi': 'Âm On'}[field]
            questions.append({
                'prompt': f'{ask} của chữ Hán 「{r["character"]}」 là gì?',
                'choices': choices,
                'correct': answer,
                'explanation': (
                    f'{r["character"]}: nghĩa là {r["meaning"]}; '
                    f'On: {r["onyomi"] or "—"}; Kun: {r["kunyomi"] or "—"}.'
                ),
            })
            break
    return questions


def _grammar_questions(level, limit):
    rows = [
        r for r in Grammar.objects.filter(level=level).values('title', 'explanation')
        if r['explanation'].strip()
    ]
    titles = [r['title'] for r in rows]
    random.shuffle(rows)

    questions = []
    for r in rows:
        if len(questions) >= limit:
            break
        bare = r['title'].replace('～', '').replace('〜', '').strip()
        if bare and bare in r['explanation']:
            continue  # phần giải thích đã chứa sẵn đáp án
        made = _make_choices(r['title'], titles)
        if not made:
            continue
        choices, answer = made
        text = r['explanation'].strip()
        questions.append({
            'prompt': f'Mẫu ngữ pháp nào có ý nghĩa: “{text}”?',
            'choices': choices,
            'correct': answer,
            'explanation': f'{r["title"]}: {text}',
        })
    return questions


def _quiz_questions(level, limit):
    items = list(
        Question.objects
        .filter(quiz__lesson__course__level=level, question_type=QuestionType.MULTIPLE_CHOICE)
        .prefetch_related('answers')
    )
    random.shuffle(items)

    questions = []
    for q in items:
        if len(questions) >= limit:
            break
        answers = list(q.answers.all())
        correct = [a for a in answers if a.is_correct]
        if len(answers) < 2 or len(correct) != 1:
            continue
        random.shuffle(answers)
        questions.append({
            'prompt': q.question_text,
            'choices': [a.answer_text for a in answers],
            'correct': answers.index(correct[0]),
            'explanation': f'Đáp án đúng: {correct[0].answer_text}.',
        })
    return questions


PLAN = [
    ('vocab', _vocab_questions, 45),
    ('kanji', _kanji_questions, 20),
    ('grammar', _grammar_questions, 25),
    ('quiz', _quiz_questions, 10),
]


def _quotas(count):
    """Chia count câu cho các nhóm theo tỉ lệ; tổng luôn đúng bằng count."""
    quotas = {key: count * pct // 100 for key, _gen, pct in PLAN}
    remainders = {key: (count * pct) % 100 for key, _gen, pct in PLAN}
    missing = count - sum(quotas.values())
    # Phần còn thiếu chia cho các nhóm có phần lẻ lớn nhất
    for key in sorted(remainders, key=remainders.get, reverse=True)[:missing]:
        quotas[key] += 1
    return quotas


def generate_questions(level, count):
    quotas = _quotas(count)
    pools = {key: generate(level, count) for key, generate, _pct in PLAN}

    chosen = []
    for key, _generate, _pct in PLAN:
        take = min(len(pools[key]), quotas[key])
        chosen += [{**q, 'section': key} for q in pools[key][:take]]
        pools[key] = pools[key][take:]

    # Nhóm nào thiếu câu thì lấy bù từ phần còn lại của các nhóm khác
    need = max(0, count - len(chosen))
    leftovers = [{**q, 'section': key} for key, qs in pools.items() for q in qs]
    random.shuffle(leftovers)
    chosen += leftovers[:need]
    chosen = chosen[:count]

    if len(chosen) < MIN_QUESTIONS:
        raise NotEnoughQuestions()

    chosen.sort(key=lambda q: SECTION_ORDER.index(q['section']))
    for i, q in enumerate(chosen):
        q['id'] = i
        q['section_label'] = SECTION_LABELS[q['section']]
    return chosen


# ---------- Vòng đời một lần thi ----------

def deadline_of(attempt):
    return attempt.created_at + timedelta(seconds=attempt.duration_seconds)


def _is_stale(attempt, now=None):
    """Chưa nộp và đã quá hạn cả thời gian bù trễ."""
    now = now or timezone.now()
    return attempt.submitted_at is None and now > deadline_of(attempt) + timedelta(seconds=GRACE_SECONDS)


def close_if_stale(attempt):
    if _is_stale(attempt):
        attempt.submitted_at = deadline_of(attempt)  # tính là hết giờ, không có câu trả lời nào
        attempt.save()


def close_stale(user):
    for attempt in ExamAttempt.objects.filter(user=user, submitted_at__isnull=True):
        close_if_stale(attempt)


def active_attempt(user):
    return (
        ExamAttempt.objects.filter(user=user, submitted_at__isnull=True)
        .order_by('-created_at').first()
    )


def finalize(attempt, raw_answers):
    by_id = {str(q['id']): q for q in attempt.questions}
    valid = {}
    for key, value in raw_answers.items():
        q = by_id.get(str(key))
        if q is not None and value < len(q['choices']):
            valid[str(key)] = value

    attempt.answers = valid
    attempt.correct_count = sum(1 for k, v in valid.items() if by_id[k]['correct'] == v)
    attempt.submitted_at = timezone.now()
    attempt.save()


# ---------- Dữ liệu trả về cho giao diện ----------

def _time_used(attempt):
    return int((attempt.submitted_at - attempt.created_at).total_seconds())


def _percent(attempt):
    return round(100 * attempt.correct_count / attempt.total) if attempt.total else 0


def public_attempt(attempt):
    """Bài đang làm: KHÔNG có đáp án đúng."""
    remaining = max(0, int((deadline_of(attempt) - timezone.now()).total_seconds()))
    return {
        'status': 'in_progress',
        'id': attempt.id,
        'level': attempt.level,
        'total': attempt.total,
        'duration_seconds': attempt.duration_seconds,
        'remaining_seconds': remaining,
        'questions': [
            {
                'id': q['id'],
                'section': q['section'],
                'section_label': q['section_label'],
                'prompt': q['prompt'],
                'choices': q['choices'],
            }
            for q in attempt.questions
        ],
    }


def result_attempt(attempt):
    """Bài đã nộp: có đáp án đúng, đáp án đã chọn và lời giải thích."""
    answers = attempt.answers or {}
    used = _time_used(attempt)

    sections, questions = {}, []
    for q in attempt.questions:
        mine = answers.get(str(q['id']))
        ok = mine == q['correct']
        s = sections.setdefault(
            q['section'], {'key': q['section'], 'label': q['section_label'], 'correct': 0, 'total': 0}
        )
        s['total'] += 1
        s['correct'] += int(ok)
        questions.append({
            'id': q['id'],
            'section': q['section'],
            'section_label': q['section_label'],
            'prompt': q['prompt'],
            'choices': q['choices'],
            'correct': q['correct'],
            'your_answer': mine,
            'is_correct': ok,
            'explanation': q.get('explanation', ''),
        })

    return {
        'status': 'finished',
        'id': attempt.id,
        'level': attempt.level,
        'total': attempt.total,
        'correct_count': attempt.correct_count,
        'percent': _percent(attempt),
        'duration_seconds': attempt.duration_seconds,
        'time_used_seconds': used,
        'late': used > attempt.duration_seconds + GRACE_SECONDS,
        'created_at': attempt.created_at,
        'sections': sorted(sections.values(), key=lambda s: SECTION_ORDER.index(s['key'])),
        'questions': questions,
    }


def history_item(attempt):
    used = _time_used(attempt)
    return {
        'id': attempt.id,
        'level': attempt.level,
        'total': attempt.total,
        'correct_count': attempt.correct_count,
        'percent': _percent(attempt),
        'time_used_seconds': used,
        'late': used > attempt.duration_seconds + GRACE_SECONDS,
        'created_at': attempt.created_at,
    }