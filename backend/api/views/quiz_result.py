from rest_framework import viewsets, mixins, permissions
from api.models import QuizResult
from api.serializers import QuizResultSerializer


class QuizResultViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    serializer_class = QuizResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            QuizResult.objects.filter(user=self.request.user)
            .select_related('quiz')
            .order_by('-completed_at')
        )