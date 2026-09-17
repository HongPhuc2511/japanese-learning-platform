from django.db import models

from .base import BaseModel
from .enums import JLPTLevel

from .lesson import Lesson


class Grammar(BaseModel):
    title=models.CharField(max_length=200)
    level=models.CharField(max_length=2,default=JLPTLevel.N5)
    explanation=models.TextField()
    example_sentence=models.TextField()
    lesson=models.ForeignKey(Lesson,on_delete=models.SET_NULL,null=True,related_name='grammars')
