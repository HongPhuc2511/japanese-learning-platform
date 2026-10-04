from api.models import UserProgress
from api.serializers import UserProgressSerializer
from .base import BaseViewSet


class UserProgressViewSet(BaseViewSet):
    serializer_class = UserProgressSerializer

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)