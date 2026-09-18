from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views.auth import RegisterView, LoginView, RefreshTokenView, MeView

router = DefaultRouter()

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='user_me'),

    path('', include(router.urls)),
]