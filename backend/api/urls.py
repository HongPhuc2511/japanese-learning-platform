from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (RegisterView, LoginView, RefreshTokenView, MeView, CourseViewSet,
                    LessonViewSet, VocabularyViewSet, KanjiViewSet, GrammarViewSet, QuizViewSet,
                    UserProgressViewSet, BookmarkViewSet, FlashcardReviewViewSet, ChangePasswordView,
                    QuizResultViewSet,AssistantChatView)

router = DefaultRouter()
router.register('courses', CourseViewSet)
router.register('lessons', LessonViewSet)
router.register('vocabulary', VocabularyViewSet)
router.register('kanji', KanjiViewSet)
router.register('grammar', GrammarViewSet)
router.register('quizzes', QuizViewSet)
router.register('progress', UserProgressViewSet, basename='progress')
router.register('bookmarks', BookmarkViewSet, basename='bookmarks')
router.register('flashcards', FlashcardReviewViewSet, basename='flashcards')
router.register('quiz-results', QuizResultViewSet, basename='quiz-results')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='user_me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
    path('assistant/chat/', AssistantChatView.as_view(), name='assistant-chat'),
]
