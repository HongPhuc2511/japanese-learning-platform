from datetime import date

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import (
    Course, Lesson, Vocabulary, Kanji, Grammar,
    Quiz, Question, Answer, FlashcardReview
)
from api.models.enums import QuestionType

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed dữ liệu mẫu phong phú cho toàn bộ app'

    def handle(self, *args, **kwargs):
        self.stdout.write('Đang xoá dữ liệu cũ...')
        FlashcardReview.objects.all().delete()
        Answer.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()
        Grammar.objects.all().delete()
        Vocabulary.objects.all().delete()
        Kanji.objects.all().delete()
        Lesson.objects.all().delete()
        Course.objects.all().delete()

        self.stdout.write('Đang tạo Courses...')
        course_n5 = Course.objects.create(
            title='Tiếng Nhật N5', level='N5',
            description='Khoá học dành cho người mới bắt đầu, nắm vững nền tảng cơ bản.',
            order=1,
        )
        course_n4 = Course.objects.create(
            title='Tiếng Nhật N4', level='N4',
            description='Khoá học nâng cao, dành cho người đã có nền tảng N5.',
            order=2,
        )
        course_n3 = Course.objects.create(
            title='Tiếng Nhật N3', level='N3',
            description='Khoá học trung cấp, hướng tới giao tiếp lưu loát hơn.',
            order=3,
        )

        self.stdout.write('Đang tạo Lessons...')
        lesson_data = [
            (course_n5, 'Bài 1: Chào hỏi cơ bản', 1),
            (course_n5, 'Bài 2: Giới thiệu bản thân', 2),
            (course_n5, 'Bài 3: Số đếm và thời gian', 3),
            (course_n5, 'Bài 4: Mua sắm', 4),
            (course_n4, 'Bài 1: Thể て và ứng dụng', 1),
            (course_n4, 'Bài 2: Diễn đạt mong muốn', 2),
            (course_n3, 'Bài 1: Kính ngữ cơ bản', 1),
        ]
        lessons = {}
        for course, title, order in lesson_data:
            l = Lesson.objects.create(course=course, title=title, order=order)
            lessons[title] = l

        self.stdout.write('Đang tạo Vocabulary...')
        vocab_data = [
            # (word, kana, romaji, meaning, level, lesson_key)
            ('食べる', 'たべる', 'taberu', 'ăn', 'N5', 'Bài 1: Chào hỏi cơ bản'),
            ('飲む', 'のむ', 'nomu', 'uống', 'N5', 'Bài 1: Chào hỏi cơ bản'),
            ('見る', 'みる', 'miru', 'xem, nhìn', 'N5', 'Bài 1: Chào hỏi cơ bản'),
            ('行く', 'いく', 'iku', 'đi', 'N5', 'Bài 2: Giới thiệu bản thân'),
            ('来る', 'くる', 'kuru', 'đến', 'N5', 'Bài 2: Giới thiệu bản thân'),
            ('する', 'する', 'suru', 'làm', 'N5', 'Bài 2: Giới thiệu bản thân'),
            ('名前', 'なまえ', 'namae', 'tên', 'N5', 'Bài 2: Giới thiệu bản thân'),
            ('学生', 'がくせい', 'gakusei', 'học sinh, sinh viên', 'N5', 'Bài 2: Giới thiệu bản thân'),
            ('先生', 'せんせい', 'sensei', 'giáo viên', 'N5', 'Bài 2: Giới thiệu bản thân'),
            ('一', 'いち', 'ichi', 'một', 'N5', 'Bài 3: Số đếm và thời gian'),
            ('二', 'に', 'ni', 'hai', 'N5', 'Bài 3: Số đếm và thời gian'),
            ('三', 'さん', 'san', 'ba', 'N5', 'Bài 3: Số đếm và thời gian'),
            ('時間', 'じかん', 'jikan', 'thời gian', 'N5', 'Bài 3: Số đếm và thời gian'),
            ('今日', 'きょう', 'kyou', 'hôm nay', 'N5', 'Bài 3: Số đếm và thời gian'),
            ('買う', 'かう', 'kau', 'mua', 'N5', 'Bài 4: Mua sắm'),
            ('高い', 'たかい', 'takai', 'đắt, cao', 'N5', 'Bài 4: Mua sắm'),
            ('安い', 'やすい', 'yasui', 'rẻ', 'N5', 'Bài 4: Mua sắm'),
            ('店', 'みせ', 'mise', 'cửa hàng', 'N5', 'Bài 4: Mua sắm'),
            ('働く', 'はたらく', 'hataraku', 'làm việc', 'N4', 'Bài 1: Thể て và ứng dụng'),
            ('待つ', 'まつ', 'matsu', 'chờ đợi', 'N4', 'Bài 1: Thể て và ứng dụng'),
            ('欲しい', 'ほしい', 'hoshii', 'muốn có', 'N4', 'Bài 2: Diễn đạt mong muốn'),
            ('旅行', 'りょこう', 'ryokou', 'du lịch', 'N4', 'Bài 2: Diễn đạt mong muốn'),
            ('尊敬', 'そんけい', 'sonkei', 'tôn kính', 'N3', 'Bài 1: Kính ngữ cơ bản'),
            ('申し上げる', 'もうしあげる', 'moushiageru', 'kính thưa (khiêm nhường ngữ)', 'N3',
             'Bài 1: Kính ngữ cơ bản'),
        ]
        for word, kana, romaji, meaning, level, lesson_key in vocab_data:
            Vocabulary.objects.create(
                word=word, kana=kana, romaji=romaji, meaning=meaning,
                level=level, lesson=lessons[lesson_key],
            )

        self.stdout.write('Đang tạo Kanji...')
        kanji_data = [
            # (character, meaning, onyomi, kunyomi, strokes, level)
            ('食', 'ăn, thức ăn', 'ショク', 'た.べる', 9, 'N5'),
            ('飲', 'uống', 'イン', 'の.む', 12, 'N5'),
            ('見', 'xem, nhìn', 'ケン', 'み.る', 7, 'N5'),
            ('行', 'đi', 'コウ', 'い.く', 6, 'N5'),
            ('来', 'đến', 'ライ', 'く.る', 7, 'N5'),
            ('名', 'tên', 'メイ', 'な', 6, 'N5'),
            ('前', 'trước', 'ゼン', 'まえ', 9, 'N5'),
            ('学', 'học', 'ガク', 'まな.ぶ', 8, 'N5'),
            ('生', 'sinh, sống', 'セイ', 'い.きる', 5, 'N5'),
            ('先', 'trước, trước tiên', 'セン', 'さき', 6, 'N5'),
            ('一', 'một', 'イチ', 'ひと.つ', 1, 'N5'),
            ('二', 'hai', 'ニ', 'ふた.つ', 2, 'N5'),
            ('三', 'ba', 'サン', 'みっ.つ', 3, 'N5'),
            ('時', 'giờ, thời gian', 'ジ', 'とき', 10, 'N5'),
            ('間', 'khoảng, giữa', 'カン', 'あいだ', 12, 'N5'),
            ('今', 'bây giờ', 'コン', 'いま', 4, 'N5'),
            ('日', 'ngày, mặt trời', 'ニチ', 'ひ', 4, 'N5'),
            ('買', 'mua', 'バイ', 'か.う', 12, 'N5'),
            ('高', 'cao, đắt', 'コウ', 'たか.い', 10, 'N5'),
            ('安', 'rẻ, an toàn', 'アン', 'やす.い', 6, 'N5'),
            ('店', 'cửa hàng', 'テン', 'みせ', 8, 'N5'),
            ('働', 'làm việc', 'ドウ', 'はたら.く', 13, 'N4'),
            ('待', 'chờ đợi', 'タイ', 'ま.つ', 9, 'N4'),
            ('旅', 'du lịch', 'リョ', 'たび', 10, 'N4'),
            ('尊', 'tôn kính', 'ソン', 'とうと.い', 12, 'N3'),
        ]
        for char, meaning, on, kun, strokes, level in kanji_data:
            Kanji.objects.create(
                character=char, meaning=meaning, onyomi=on, kunyomi=kun,
                stroke_count=strokes, jlpt_level=level,
            )

        self.stdout.write('Đang tạo Grammar...')
        grammar_data = [
            ('～は～です', 'N5', 'Cấu trúc câu khẳng định cơ bản: A là B.', '私は学生です。(Tôi là học sinh.)',
             'Bài 1: Chào hỏi cơ bản'),
            ('～ます / ～ません', 'N5', 'Thể lịch sự của động từ ở hiện tại/tương lai, phủ định.',
             '毎日食べます。(Tôi ăn mỗi ngày.)', 'Bài 1: Chào hỏi cơ bản'),
            ('～が好きです', 'N5', 'Diễn tả sở thích đối với một sự vật, sự việc.',
             '日本語が好きです。(Tôi thích tiếng Nhật.)', 'Bài 2: Giới thiệu bản thân'),
            ('～時に', 'N5', 'Diễn tả thời điểm xảy ra hành động.', '七時に起きます。(Tôi dậy lúc 7 giờ.)',
             'Bài 3: Số đếm và thời gian'),
            ('～ている', 'N4', 'Diễn tả hành động đang diễn ra hoặc trạng thái kéo dài.',
             '今、食べています。(Tôi đang ăn.)', 'Bài 1: Thể て và ứng dụng'),
            ('～たい', 'N4', 'Diễn tả mong muốn làm gì đó của người nói.', '日本へ行きたいです。(Tôi muốn đi Nhật Bản.)',
             'Bài 2: Diễn đạt mong muốn'),
            ('尊敬語・謙譲語', 'N3', 'Kính ngữ dùng khi nói về người trên, khiêm nhường ngữ dùng khi nói về bản thân.',
             '先生がおっしゃいました。(Thầy đã nói.)', 'Bài 1: Kính ngữ cơ bản'),
        ]
        for title, level, explanation, example, lesson_key in grammar_data:
            Grammar.objects.create(
                title=title, level=level, explanation=explanation,
                example_sentence=example, lesson=lessons[lesson_key],
            )

        self.stdout.write('Đang tạo Quiz + Question + Answer...')
        quiz1 = Quiz.objects.create(lesson=lessons['Bài 1: Chào hỏi cơ bản'], title='Kiểm tra bài 1: Chào hỏi')
        q1 = Question.objects.create(
            quiz=quiz1, question_text='食べる nghĩa là gì?',
            question_type=QuestionType.MULTIPLE_CHOICE,
        )
        Answer.objects.create(question=q1, answer_text='Ăn', is_correct=True)
        Answer.objects.create(question=q1, answer_text='Uống', is_correct=False)
        Answer.objects.create(question=q1, answer_text='Ngủ', is_correct=False)

        q2 = Question.objects.create(
            quiz=quiz1, question_text='Cách đọc của chữ 見 là gì?',
            question_type=QuestionType.MULTIPLE_CHOICE,
        )
        Answer.objects.create(question=q2, answer_text='みる', is_correct=True)
        Answer.objects.create(question=q2, answer_text='きく', is_correct=False)
        Answer.objects.create(question=q2, answer_text='はなす', is_correct=False)

        quiz2 = Quiz.objects.create(lesson=lessons['Bài 2: Giới thiệu bản thân'], title='Kiểm tra bài 2: Giới thiệu')
        q3 = Question.objects.create(
            quiz=quiz2, question_text='"学生" nghĩa là gì?',
            question_type=QuestionType.MULTIPLE_CHOICE,
        )
        Answer.objects.create(question=q3, answer_text='Học sinh, sinh viên', is_correct=True)
        Answer.objects.create(question=q3, answer_text='Giáo viên', is_correct=False)
        Answer.objects.create(question=q3, answer_text='Bác sĩ', is_correct=False)

        quiz3 = Quiz.objects.create(lesson=lessons['Bài 4: Mua sắm'], title='Kiểm tra bài 4: Mua sắm')
        q4 = Question.objects.create(
            quiz=quiz3, question_text='"安い" nghĩa là gì?',
            question_type=QuestionType.MULTIPLE_CHOICE,
        )
        Answer.objects.create(question=q4, answer_text='Rẻ', is_correct=True)
        Answer.objects.create(question=q4, answer_text='Đắt', is_correct=False)
        Answer.objects.create(question=q4, answer_text='Mới', is_correct=False)

        self.stdout.write('Đang tạo FlashcardReview...')
        user = User.objects.filter(username='phuc1').first()
        if not user:
            self.stdout.write(self.style.WARNING('Không tìm thấy user "phuc1", bỏ qua flashcard.'))
        else:
            for v in Vocabulary.objects.all():
                FlashcardReview.objects.create(
                    user=user, content_type='vocabulary', object_id=v.id,
                    next_review_date=date.today(),
                )
            for k in Kanji.objects.all():
                FlashcardReview.objects.create(
                    user=user, content_type='kanji', object_id=k.id,
                    next_review_date=date.today(),
                )

        self.stdout.write(self.style.SUCCESS(
            f'Hoàn tất: {Course.objects.count()} khoá học, {Lesson.objects.count()} bài học, '
            f'{Vocabulary.objects.count()} từ vựng, {Kanji.objects.count()} kanji, '
            f'{Grammar.objects.count()} ngữ pháp, {Quiz.objects.count()} quiz, '
            f'{Question.objects.count()} câu hỏi, {Answer.objects.count()} đáp án.'
        ))
