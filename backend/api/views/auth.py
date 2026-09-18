from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from serializers.auth import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class=RegisterSerializer
    permission_classes=[permissions.AllowAny]

    def create(self,request,*args,**kwargs):
        serializers=self.get_serializer(data=request.data)
        serializers.is_valid(raise_exception=True)
        user=serializers.save()

        refresh=RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(TokenObtainPairView):
    """API Đăng nhập trả về access, refresh token và user info"""
    serializer_class = CustomTokenObtainPairSerializer


class RefreshTokenView(TokenRefreshView):
    """API cấp lại access token mới khi access token cũ hết hạn"""
    pass


class MeView(generics.RetrieveAPIView):
    """Lấy thông tin profile người dùng hiện tại từ JWT Token"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user