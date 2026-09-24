from api.models import Course, Lesson
from api.serializers import CourseSerializer, LessonSerializer
from .base import BaseViewSet
from rest_framework import permissions


class CourseViewSet(BaseViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


class LessonViewSet(BaseViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.AllowAny]