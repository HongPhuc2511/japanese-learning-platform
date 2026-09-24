from api.models import Course, Lesson
from api.serializers import CourseSerializer, LessonSerializer
from .base import BaseReadOnlyViewSet
from rest_framework import permissions


class CourseViewSet(BaseReadOnlyViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class LessonViewSet(BaseReadOnlyViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer