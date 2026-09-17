from django.db import models

from backend.api.models.base import BaseModel
from backend.api.models.enums import JLPTLevel

from backend.api.models.lesson import Lesson


class Grammar(BaseModel):
    title=models.CharField(max_length=200)
    level=models.CharField(max_length=2,default=JLPTLevel.N5)
    explanation=models.TextField()
    example_sentence=models.TextField()
    lesson=models.ForeignKey(Lesson,on_delete=models.SET_NULL,null=True,related_name='grammars')
