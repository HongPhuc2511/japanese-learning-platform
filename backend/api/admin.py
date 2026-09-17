from django.contrib import admin

from .models import Course, Lesson, Vocabulary, Kanji, Grammar, Quiz, Question, Answer, QuizResult, UserProgress

admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Vocabulary)
admin.site.register(Kanji)
admin.site.register(Grammar)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(QuizResult)
admin.site.register(UserProgress)
# Register your models here.
