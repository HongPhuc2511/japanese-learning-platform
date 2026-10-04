from rest_framework import viewsets, permissions, filters

class BaseReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """Chỉ có GET dùng cho các model mà việc tạo/sửa/xoá được quản lý qua Django Admin"""
    permission_classes = [permissions.AllowAny]

class BaseViewSet(viewsets.ModelViewSet):
    """CRUD đầy đủ, dùng cho các model mà user tự tạo/sửa/xoá dữ liệu của mình
    qua API"""
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if hasattr(serializer.Meta.model, 'user_id'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()