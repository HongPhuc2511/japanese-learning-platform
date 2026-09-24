from rest_framework import viewsets, permissions, filters

class BaseReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """Chỉ có GET dùng cho các model mà việc tạo/sửa/xoá được quản lý qua Django Admin"""
    permission_classes = [permissions.AllowAny]