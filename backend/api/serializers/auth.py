from rest_framework import serializers
from django.contrib.auth import get_user_model
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
            email=serializers.EmailField(
                required=True,
                validators=[UniqueValidator(queryset=User.objects.all())]
            ),
            password=validated_data['password']
        )

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'level','points','streak_count']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT Serializer - Trả về Token + User Profile"""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
