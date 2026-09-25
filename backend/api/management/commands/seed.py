from django.core.management.base import BaseCommand
from api.models import Course, Lesson


class Command(BaseCommand):
    help = 'Seed dữ liệu mẫu cho Course và Lesson'

    def handle(self, *args, **kwargs):
        self.stdout.write('Đang xoá dữ liệu cũ...')
        Lesson.objects.all().delete()
        Course.objects.all().delete()

        self.stdout.write('Đang tạo dữ liệu mẫu...')

        course_n5 = Course.objects.create(
            title='Tiếng Nhật N5',
            level='N5',
            description='Khoá học dành cho người mới bắt đầu học tiếng Nhật.',
            order=1,
        )
        Lesson.objects.create(
            course=course_n5,
            title='Bài 1: Chào hỏi cơ bản',
            order=1,
            content='Học các mẫu câu chào hỏi: おはよう, こんにちは, こんばんは',
        )
        Lesson.objects.create(
            course=course_n5,
            title='Bài 2: Giới thiệu bản thân',
            order=2,
            content='Học cách giới thiệu tên, nghề nghiệp bằng tiếng Nhật',
        )

        course_n4 = Course.objects.create(
            title='Tiếng Nhật N4',
            level='N4',
            description='Khoá học nâng cao dành cho người đã có nền tảng N5.',
            order=2,
        )
        Lesson.objects.create(
            course=course_n4,
            title='Bài 1: Ngữ pháp thể て',
            order=1,
            content='Học cách chia động từ thể て và ứng dụng',
        )

        self.stdout.write(self.style.SUCCESS(
            f'Đã tạo {Course.objects.count()} khoá học, {Lesson.objects.count()} bài học.'
        ))