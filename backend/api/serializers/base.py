from rest_framework import serializers


class BaseSerializer(serializers.ModelSerializer):
    """Base ModelSerializer chuẩn cho toàn bộ dự án.
    Tự động đọc các trường thời gian created_at, updated_at dưới dạng read-only"""
    created_at=serializers.DateTimeField(read_only=True)
    updated_at=serializers.DateTimeField(read_only=True)

    class Meta:
        fields=[]
        read_only_fields=['id','created_at','updated_at']