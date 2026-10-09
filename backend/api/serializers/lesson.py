from rest_framework import serializers
from api.models import Course, Lesson, UserProgress
from .base import BaseSerializer
from .vocabulary import VocabularySerializer
from .grammar import GrammarSerializer
from .quiz import QuizSerializer


class LessonSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Lesson
        fields = '__all__'


class LessonDetailSerializer(BaseSerializer):
    vocabularies = VocabularySerializer(many=True, read_only=True)
    grammars = GrammarSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)

    class Meta(BaseSerializer.Meta):
        model = Lesson
        fields = ['id', 'title', 'order', 'content', 'vocabularies', 'grammars', 'quizzes']


class CourseSerializer(BaseSerializer):
    progress = serializers.SerializerMethodField()

    class Meta(BaseSerializer.Meta):
        model = Course
        fields = '__all__'

    def get_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        total = obj.lessons.count()
        completed = UserProgress.objects.filter(
            user=request.user, lesson__course=obj, is_completed=True
        ).count()
        return {'completed': completed, 'total': total}


class CourseDetailSerializer(BaseSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta(BaseSerializer.Meta):
        model = Course
        fields = ['id', 'title', 'level', 'description', 'order', 'lessons']