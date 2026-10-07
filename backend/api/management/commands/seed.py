from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Course, Lesson, Vocabulary, Kanji, FlashcardReview
from datetime import date

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed dữ liệu mẫu cho Course, Lesson, Vocabulary, Kanji, FlashcardReview'

    def handle(self, *args, **kwargs):
        self.stdout.write('Đang xoá dữ liệu cũ...')
        FlashcardReview.objects.all().delete()
        Vocabulary.objects.all().delete()
        Kanji.objects.all().delete()
        Lesson.objects.all().delete()
        Course.objects.all().delete()

        self.stdout.write('Đang tạo Course/Lesson...')
        course_n5 = Course.objects.create(
            title='Tiếng Nhật N5', level='N5',
            description='Khoá học dành cho người mới bắt đầu.', order=1,
        )
        lesson1 = Lesson.objects.create(
            course=course_n5, title='Bài 1: Chào hỏi cơ bản', order=1,
        )

        self.stdout.write('Đang tạo Vocabulary...')
        vocab_data = [
            ('食べる', 'たべる', 'taberu', 'ăn', 'N5'),
            ('飲む', 'のむ', 'nomu', 'uống', 'N5'),
            ('見る', 'みる', 'miru', 'xem, nhìn', 'N5'),
            ('行く', 'いく', 'iku', 'đi', 'N5'),
            ('来る', 'くる', 'kuru', 'đến', 'N5'),
        ]
        vocabularies = []
        for word, kana, romaji, meaning, level in vocab_data:
            v = Vocabulary.objects.create(
                word=word, kana=kana, romaji=romaji, meaning=meaning,
                level=level, lesson=lesson1,
            )
            vocabularies.append(v)

        self.stdout.write('Đang tạo Kanji...')
        kanji_data = [
            ('食', 'ăn, thức ăn', 'ショク', 'た.べる', 9, 'N5'),
            ('飲', 'uống', 'イン', 'の.む', 12, 'N5'),
            ('見', 'xem, nhìn', 'ケン', 'み.る', 7, 'N5'),
            ('行', 'đi', 'コウ', 'い.く', 6, 'N5'),
            ('来', 'đến', 'ライ', 'く.る', 7, 'N5'),
        ]
        kanjis = []
        for char, meaning, on, kun, strokes, level in kanji_data:
            k = Kanji.objects.create(
                character=char, meaning=meaning, onyomi=on, kunyomi=kun,
                stroke_count=strokes, jlpt_level=level,
            )
            kanjis.append(k)

        self.stdout.write('Đang tạo FlashcardReview...')
        user = User.objects.first()
        if not user:
            self.stdout.write(self.style.WARNING('Chưa có user nào, bỏ qua tạo FlashcardReview.'))
        else:
            for v in vocabularies:
                FlashcardReview.objects.create(
                    user=user, content_type='vocabulary', object_id=v.id,
                    next_review_date=date.today(),
                )
            for k in kanjis:
                FlashcardReview.objects.create(
                    user=user, content_type='kanji', object_id=k.id,
                    next_review_date=date.today(),
                )

        self.stdout.write(self.style.SUCCESS(
            f'Đã tạo {len(vocabularies)} vocab, {len(kanjis)} kanji, '
            f'{FlashcardReview.objects.count()} flashcard cho user "{user}".'
        ))