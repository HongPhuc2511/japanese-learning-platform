from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (RegisterView, LoginView, RefreshTokenView, MeView, CourseViewSet,
                    LessonViewSet, VocabularyViewSet, KanjiViewSet)

router = DefaultRouter()
router.register('courses', CourseViewSet)
router.register('lessons', LessonViewSet)
router.register('vocabulary', VocabularyViewSet)
router.register('kanji', KanjiViewSet)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='user_me'),

    path('', include(router.urls)),
]
