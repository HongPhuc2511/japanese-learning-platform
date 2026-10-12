import json
from datetime import date
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.exceptions import MultipleObjectsReturned
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from api.models import (
    Course, Lesson, Vocabulary, Kanji, Grammar,
    Quiz, Question, Answer, FlashcardReview,
)
from api.models.enums import QuestionType

User = get_user_model()
SEED_DIR = Path(__file__).resolve().parents[2] / 'seed'
LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']


class Command(BaseCommand):
    help = 'Nạp dữ liệu học tập từ các file JSON trong api/seed/ (n5.json ... n1.json)'

    def add_arguments(self, parser):
        parser.add_argument('--level', nargs='+', choices=LEVELS,
                            help='Chỉ nạp các cấp độ này (mặc định: tất cả)')
        parser.add_argument('--reset', action='store_true',
                            help='Xoá nội dung của các cấp được chọn trước khi nạp '
                                 '(kéo theo tiến độ học và lịch sử quiz gắn với các bài đó)')
        parser.add_argument('--flashcards', metavar='USERNAME',
                            help='Tạo thẻ ôn tập cho user này (mọi từ vựng và kanji của các cấp được chọn)')

    def handle(self, *args, **options):
        levels = options['level'] or LEVELS

        if options['reset']:
            self._reset(levels)

        for level in levels:
            path = SEED_DIR / f'{level.lower()}.json'
            if not path.exists():
                self.stdout.write(self.style.WARNING(f'{level}: chưa có file {path.name}, bỏ qua'))
                continue

            try:
                data = json.loads(path.read_text(encoding='utf-8-sig'))
            except json.JSONDecodeError as e:
                raise CommandError(f'{path.name}: JSON sai cú pháp ({e})')

            try:
                with transaction.atomic():
                    stats = self._load_level(level, data)
            except KeyError as e:
                raise CommandError(f'{path.name}: thiếu trường {e}')
            except MultipleObjectsReturned:
                raise CommandError(
                    f'{path.name}: trong DB có nhiều bản ghi trùng nhau, '
                    'hãy xoá bản sao trong Django Admin rồi chạy lại'
                )

            summary = ', '.join(f'{count} {name}' for name, count in stats.items())
            self.stdout.write(self.style.SUCCESS(f'{level}: {summary}'))

        if options['flashcards']:
            created = self._make_flashcards(options['flashcards'], levels)
            self.stdout.write(self.style.SUCCESS(f'Đã tạo {created} thẻ ôn tập mới'))

    def _load_level(self, level, data):
        stats = {'khoá học': 0, 'bài học': 0, 'từ vựng': 0, 'ngữ pháp': 0, 'quiz': 0, 'kanji': 0}

        for c in data.get('courses', []):
            course, _ = Course.objects.update_or_create(
                title=c['title'], level=level,
                defaults={'description': c.get('description', ''), 'order': c.get('order', 0)},
            )
            stats['khoá học'] += 1

            for l in c.get('lessons', []):
                lesson, _ = Lesson.objects.update_or_create(
                    course=course, title=l['title'],
                    defaults={'order': l.get('order', 0), 'content': l.get('content', '')},
                )
                stats['bài học'] += 1

                for v in l.get('vocabulary', []):
                    values = {
                        'romaji': v.get('romaji', ''),
                        'meaning': v['meaning'],
                        'example_sentence': v.get('example_sentence', ''),
                        'example_meaning': v.get('example_meaning', ''),
                        'lesson': lesson,
                    }
                    self._check(Vocabulary, {'word': v['word'], 'kana': v['kana'], **values}, v['word'])
                    Vocabulary.objects.update_or_create(
                        word=v['word'], kana=v['kana'], level=level, defaults=values,
                    )
                    stats['từ vựng'] += 1

                for g in l.get('grammar', []):
                    values = {
                        'explanation': g['explanation'],
                        'example_sentence': g.get('example_sentence', ''),
                        'lesson': lesson,
                    }
                    self._check(Grammar, {'title': g['title'], **values}, g['title'])
                    Grammar.objects.update_or_create(title=g['title'], level=level, defaults=values)
                    stats['ngữ pháp'] += 1

                for qz in l.get('quizzes', []):
                    quiz, _ = Quiz.objects.update_or_create(lesson=lesson, title=qz['title'])
                    quiz.questions.all().delete()  # tạo lại câu hỏi, giữ nguyên id của quiz
                    for q in qz['questions']:
                        answers, correct = q['answers'], q['correct']
                        if len(answers) < 2 or not 0 <= correct < len(answers):
                            raise CommandError(
                                f'Quiz "{qz["title"]}", câu "{q["text"]}": '
                                'cần ít nhất 2 đáp án và "correct" là vị trí hợp lệ (bắt đầu từ 0)'
                            )
                        question = Question.objects.create(
                            quiz=quiz, question_text=q['text'],
                            question_type=QuestionType.MULTIPLE_CHOICE,
                        )
                        Answer.objects.bulk_create([
                            Answer(question=question, answer_text=a, is_correct=(i == correct))
                            for i, a in enumerate(answers)
                        ])
                    stats['quiz'] += 1

        for k in data.get('kanji', []):
            values = {
                'meaning': k['meaning'],
                'onyomi': k.get('onyomi', ''),
                'kunyomi': k.get('kunyomi', ''),
                'stroke_count': k['stroke_count'],
                'jlpt_level': level,
                'radical': k.get('radical', ''),
            }
            self._check(Kanji, {'character': k['character'], **values}, k['character'])
            Kanji.objects.update_or_create(character=k['character'], defaults=values)
            stats['kanji'] += 1

        return stats

    @staticmethod
    def _check(model, values, label):
        """Báo lỗi rõ ràng nếu chuỗi dài hơn giới hạn của trường trong model."""
        for name, value in values.items():
            max_len = getattr(model._meta.get_field(name), 'max_length', None)
            if isinstance(value, str) and max_len and len(value) > max_len:
                raise CommandError(
                    f'"{label}": trường {name} dài {len(value)} ký tự, tối đa {max_len}'
                )

    def _reset(self, levels):
        Quiz.objects.filter(lesson__course__level__in=levels).delete()
        Grammar.objects.filter(level__in=levels).delete()
        Vocabulary.objects.filter(level__in=levels).delete()
        Kanji.objects.filter(jlpt_level__in=levels).delete()
        Course.objects.filter(level__in=levels).delete()  # xoá luôn các bài học
        self.stdout.write(self.style.WARNING(f'Đã xoá nội dung cấp {", ".join(levels)}'))

    def _make_flashcards(self, username, levels):
        user = User.objects.filter(username=username).first()
        if not user:
            raise CommandError(f'Không tìm thấy user "{username}"')

        existing = set(
            FlashcardReview.objects.filter(user=user).values_list('content_type', 'object_id')
        )
        new_cards = []
        for pk in Vocabulary.objects.filter(level__in=levels).values_list('id', flat=True):
            if ('vocabulary', pk) not in existing:
                new_cards.append(FlashcardReview(
                    user=user, content_type='vocabulary', object_id=pk,
                    next_review_date=date.today(),
                ))
        for pk in Kanji.objects.filter(jlpt_level__in=levels).values_list('id', flat=True):
            if ('kanji', pk) not in existing:
                new_cards.append(FlashcardReview(
                    user=user, content_type='kanji', object_id=pk,
                    next_review_date=date.today(),
                ))
        FlashcardReview.objects.bulk_create(new_cards)
        return len(new_cards)