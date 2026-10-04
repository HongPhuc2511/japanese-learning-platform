from django.utils import timezone
from api.models import UserProgress
from .base import BaseSerializer


class UserProgressSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = UserProgress
        fields = ['id', 'lesson', 'is_completed', 'completed_at']
        read_only_fields = ['completed_at']

    def update(self, instance, validated_data):
        if validated_data.get('is_completed') and not instance.is_completed:
            validated_data['completed_at'] = timezone.now()
        return super().update(instance, validated_data)

    def create(self, validated_data):
        if validated_data.get('is_completed'):
            validated_data['completed_at'] = timezone.now()
        return super().create(validated_data)