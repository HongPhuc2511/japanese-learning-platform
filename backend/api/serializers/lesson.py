from api.models import Course, Lesson
from .base import BaseSerializer


class CourseSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Course
        fields = '__all__'


class LessonSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Lesson
        fields = '__all__'