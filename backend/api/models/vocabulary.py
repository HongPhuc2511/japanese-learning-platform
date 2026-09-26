from .base import BaseModel
from django.db import models

from . import JLPTLevel
from .lesson import Lesson


class Vocabulary(BaseModel):
    word=models.CharField(max_length=50)
    kana=models.CharField(max_length=50)
    romaji=models.CharField(max_length=50)
    meaning=models.CharField(max_length=50)
    example_sentence=models.TextField(blank=True)
    example_meaning=models.TextField(blank=True)
    audio=models.FileField(upload_to='audio/vocab/',blank=True)
    level=models.CharField(max_length=2,default=JLPTLevel.N5)
    lesson=models.ForeignKey(Lesson,on_delete=models.SET_NULL,null=True,related_name='vocabularies',blank=True)

class Kanji(BaseModel):
    character=models.CharField(max_length=5)
    meaning=models.CharField(max_length=200)
    onyomi=models.CharField(max_length=100,blank=True)
    kunyomi=models.CharField(max_length=100,blank=True)
    stroke_count=models.IntegerField()
    jlpt_level=models.CharField(max_length=2,default=JLPTLevel.N5)
    radical=models.CharField(max_length=10,blank=True)
