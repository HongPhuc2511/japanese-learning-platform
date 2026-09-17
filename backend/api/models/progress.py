from django.db import models

from backend.api.models.lesson import Lesson
from backend.api.models.user import User


class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

class FlashcardReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.CharField(max_length=20)
    object_id = models.IntegerField()
    ease_factor = models.FloatField(default=2.5)
    interval_days = models.IntegerField(default=1)
    next_review_date = models.DateField()
    review_count = models.IntegerField(default=0)

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.CharField(max_length=20)
    object_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)