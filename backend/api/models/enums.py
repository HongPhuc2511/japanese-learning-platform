from django.db import models


class JLPTLevel(models.TextChoices):
    N5 = 'N5', 'N5'
    N4 = 'N4', 'N4'
    N3 = 'N3', 'N3'
    N2 = 'N2', 'N2'
    N1 = 'N1', 'N1'


class QuestionType(models.TextChoices):
    MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
    FILL_BLANK = 'fill_blank', 'Fill in Blank'
    LISTENING = 'listening', 'Listening'