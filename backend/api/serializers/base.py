from rest_framework import serializers


class BaseSerializer(serializers.ModelSerializer):
    """Base serializer - tự động thêm created_at, updated_at"""
    created_at=serializers.DateTimeField(read_only=True)
    updated_at=serializers.DateTimeField(read_only=True)

    class Meta:
        abstract = True