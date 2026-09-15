from django.db import models

from backend.api.models.base import BaseModel
from backend.api.models.choices import JLPT_LEVELS


class Course(BaseModel):
    title=models.CharField(max_length=200)
    level=models.CharField(max_length=2,choices=JLPT_LEVELS)
    description = models.TextField(blank=True)
    order=models.IntegerField(default=0)

    def __str__(self):
        return f"{self.title} ({self.level})"

class Lesson(BaseModel):
    course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name='lessons')
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    content = models.TextField(blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title