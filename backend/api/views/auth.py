from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.serializers.auth import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer, \
    ChangePasswordSerializer, GoogleLoginSerializer,FacebookLoginSerializer

import logging
import re
import requests

from django.conf import settings
from django.contrib.auth import get_user_model
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

logger = logging.getLogger(__name__)
User = get_user_model()

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


class MeView(generics.RetrieveUpdateAPIView):
    """Lấy và cập nhật thông tin profile người dùng hiện tại"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({'detail': 'Đổi mật khẩu thành công'}, status=status.HTTP_200_OK)

class GoogleLoginView(generics.GenericAPIView):
    """Đăng nhập hoặc đăng ký bằng Google, trả JWT giống đăng nhập thường"""
    serializer_class = GoogleLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not settings.GOOGLE_CLIENT_ID:
            return Response(
                {'error': 'Máy chủ chưa cấu hình đăng nhập Google'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            idinfo = google_id_token.verify_oauth2_token(
                serializer.validated_data['credential'],
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return Response(
                {'error': 'Token Google không hợp lệ'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception:
            logger.exception('Lỗi khi kiểm tra token Google')
            return Response(
                {'error': 'Không kiểm tra được token Google, thử lại sau'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        email = idinfo.get('email')
        if not email or not idinfo.get('email_verified'):
            return Response(
                {'error': 'Email Google chưa được xác minh'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).order_by('id').first()
        if user is None:
            user = User.objects.create_user(
                username=self._make_username(email),
                email=email,
            )
        elif not user.is_active:
            return Response(
                {'error': 'Tài khoản đã bị vô hiệu hoá'},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        })

    @staticmethod
    def _make_username(email):
        base = re.sub(r'[^\w.@+-]', '', email.split('@')[0])[:30] or 'user'
        username, n = base, 1
        while User.objects.filter(username__iexact=username).exists():
            n += 1
            username = f'{base}{n}'
        return username

GRAPH_API = 'https://graph.facebook.com/v25.0'
class FacebookLoginView(generics.GenericAPIView):
    """Đăng nhập hoặc đăng ký bằng Facebook, trả JWT giống đăng nhập thường"""
    serializer_class = FacebookLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not settings.FACEBOOK_APP_ID or not settings.FACEBOOK_APP_SECRET:
            return Response(
                {'error': 'Máy chủ chưa cấu hình đăng nhập Facebook'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['access_token']

        try:
            debug = requests.get(
                f'{GRAPH_API}/debug_token',
                params={
                    'input_token': token,
                    'access_token': f'{settings.FACEBOOK_APP_ID}|{settings.FACEBOOK_APP_SECRET}',
                },
                timeout=10,
            ).json().get('data', {})

            if not debug.get('is_valid') or str(debug.get('app_id')) != settings.FACEBOOK_APP_ID:
                return Response(
                    {'error': 'Token Facebook không hợp lệ'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            profile = requests.get(
                f'{GRAPH_API}/me',
                params={'fields': 'id,name,email', 'access_token': token},
                timeout=10,
            ).json()
        except (requests.RequestException, ValueError):
            logger.exception('Lỗi khi gọi Facebook')
            return Response(
                {'error': 'Không kết nối được Facebook, thử lại sau'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        fb_id = str(profile.get('id', ''))
        if not fb_id or fb_id != str(debug.get('user_id')):
            return Response(
                {'error': 'Không lấy được thông tin Facebook'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        username = f'fb_{fb_id}'
        user = User.objects.filter(username=username).first()

        if user is None:
            user = User.objects.create_user(
                username=username,
                email=profile.get('email') or '',
                first_name=(profile.get('name') or '')[:150],
            )
        elif user.has_usable_password():
            # Tài khoản trùng username nhưng do người dùng tự đăng ký bằng mật khẩu
            return Response(
                {'error': 'Không thể đăng nhập bằng tài khoản này'},
                status=status.HTTP_403_FORBIDDEN,
            )
        elif not user.is_active:
            return Response(
                {'error': 'Tài khoản đã bị vô hiệu hoá'},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        })