from django.conf import settings
from django.db import models

from .base import BaseModel


class ExamAttempt(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exam_attempts'
    )
    level = models.CharField(max_length=2)
    duration_seconds = models.PositiveIntegerField()
    total = models.PositiveIntegerField()
    questions = models.JSONField()  # đề đã tạo, kèm đáp án đúng, chỉ nằm ở server
    answers = models.JSONField(default=dict, blank=True)
    correct_count = models.PositiveIntegerField(default=0)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} - {self.level} - {self.correct_count}/{self.total}'