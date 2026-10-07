from api.models import Course, Lesson
from api.serializers import (
    CourseSerializer, CourseDetailSerializer,
    LessonSerializer, LessonDetailSerializer,
)
from .base import BaseReadOnlyViewSet


class CourseViewSet(BaseReadOnlyViewSet):
    queryset = Course.objects.prefetch_related('lessons')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer


class LessonViewSet(BaseReadOnlyViewSet):
    queryset = Lesson.objects.prefetch_related('vocabularies', 'grammars', 'quizzes')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return LessonDetailSerializer
        return LessonSerializer