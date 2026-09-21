from rest_framework import viewsets, permissions, filters

class BaseViewSet(viewsets.ModelViewSet):
    """Base ViewSet chuẩn cung cấp đầy đủ các thao tác CRUD."""
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if hasattr(serializer.Meta.model, 'user_id'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()