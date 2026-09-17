from django.db import models

from .base import BaseModel
from .enums import JLPTLevel


class Course(BaseModel):
    title=models.CharField(max_length=200)
    level=models.CharField(max_length=2,default=JLPTLevel.N5)
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