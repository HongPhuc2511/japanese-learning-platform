from rest_framework import serializers
from api.models import Quiz, Question, Answer
from .base import BaseSerializer


class AnswerSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Answer
        fields = ['id', 'answer_text']


class QuestionSerializer(BaseSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta(BaseSerializer.Meta):
        model = Question
        fields = ['id', 'question_text', 'question_type', 'audio', 'answers']


class QuizSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Quiz
        fields = '__all__'


class QuizDetailSerializer(BaseSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta(BaseSerializer.Meta):
        model = Quiz
        fields = ['id', 'title', 'lesson', 'questions']

class SubmitAnswerSerializer(serializers.Serializer):
    question = serializers.IntegerField()
    answer = serializers.IntegerField()


class QuizSubmitSerializer(serializers.Serializer):
    answers = SubmitAnswerSerializer(many=True)