from api.models import Course, Lesson
from .base import BaseSerializer
from .vocabulary import VocabularySerializer, KanjiSerializer
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
    class Meta(BaseSerializer.Meta):
        model = Course
        fields = '__all__'


class CourseDetailSerializer(BaseSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta(BaseSerializer.Meta):
        model = Course
        fields = ['id', 'title', 'level', 'description', 'order', 'lessons']