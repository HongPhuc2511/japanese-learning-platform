from django.contrib.auth.models import AbstractUser
from django.db import models

from backend.api.models import choices


class User(AbstractUser):
    level=models.CharField(max_length=2, choices=choices.JLPT_LEVELS)
    avatar=models.ImageField(upload_to="avatar",blank=True)
    streak_count=models.IntegerField(default=0)
    last_study_date=models.DateField(null=True,blank=True)
    points=models.IntegerField(default=0)


