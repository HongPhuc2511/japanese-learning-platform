from rest_framework import viewsets, mixins, permissions
from api.models import UserProgress
from api.serializers import UserProgressSerializer
from api.services.gamification import record_activity


class UserProgressViewSet(viewsets.GenericViewSet,
                           mixins.ListModelMixin,
                           mixins.CreateModelMixin,
                           mixins.UpdateModelMixin):
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        if instance.is_completed:
            record_activity(self.request.user, points=10)

    def perform_update(self, serializer):
        first_time = serializer.instance.completed_at is None
        instance = serializer.save()
        if instance.is_completed and first_time:
            record_activity(self.request.user, points=10)