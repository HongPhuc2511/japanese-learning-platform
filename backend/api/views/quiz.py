from api.models import Quiz
from api.serializers import QuizSerializer, QuizDetailSerializer
from .base import BaseReadOnlyViewSet


class QuizViewSet(BaseReadOnlyViewSet):
    queryset = Quiz.objects.prefetch_related('questions__answers')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizSerializer