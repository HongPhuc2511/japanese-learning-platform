from django.db import models

from backend.api.models.base import BaseModel
from backend.api.models.enums import QuestionType
from backend.api.models.lesson import Lesson
from backend.api.models.user import User


class Quiz(BaseModel):
    lesson=models.ForeignKey(Lesson,on_delete=models.SET_NULL,null=True,related_name='quizzes')
    title=models.CharField(max_length=200)

class Question(BaseModel):
    quiz=models.ForeignKey(Quiz,on_delete=models.CASCADE,related_name='questions')
    question_text=models.CharField(max_length=500)
    question_Type=models.CharField(max_length=20,default=QuestionType.MULTIPLE_CHOICE)
    audio=models.FileField(upload_to='audio/questions',blank=True)

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)

class QuizResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField()
    completed_at = models.DateTimeField(auto_now_add=True)