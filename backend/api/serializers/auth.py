from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model=User
        fields=['username','email','password']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )

class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    has_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'first_name', 'email',
                  'level', 'points', 'streak_count', 'has_password']
        read_only_fields = ['id', 'username', 'display_name', 'points',
                            'streak_count', 'has_password']

    def get_display_name(self, obj):
        return obj.first_name.strip() or obj.username

    def get_has_password(self, obj):
        return obj.has_usable_password()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT Serializer - Trả về Token + User Profile"""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.has_usable_password():
            raise serializers.ValidationError(
                'Tài khoản đăng nhập bằng Google hoặc Facebook không có mật khẩu để đổi'
            )
        if not user.check_password(value):
            raise serializers.ValidationError('Mật khẩu cũ không đúng')
        return value

class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField()

class FacebookLoginSerializer(serializers.Serializer):
    access_token = serializers.CharField()
