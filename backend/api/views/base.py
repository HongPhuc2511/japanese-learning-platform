from rest_framework import viewsets, permissions, filters
from api.models.enums import JLPTLevel

class BaseReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """Chỉ có GET dùng cho các model mà việc tạo/sửa/xoá được quản lý qua Django Admin"""
    permission_classes = [permissions.AllowAny]

class LevelFilterMixin:
    """Cho phép lọc danh sách theo ?level=N5. Mỗi viewset khai báo tên trường cấp độ."""
    level_field = 'level'

    def get_queryset(self):
        queryset = super().get_queryset()
        level = self.request.query_params.get('level')
        if level in JLPTLevel.values:
            queryset = queryset.filter(**{self.level_field: level})
        return queryset