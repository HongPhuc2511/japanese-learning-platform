from rest_framework import viewsets, permissions


class BaseViewSet(viewsets.ModelViewSet):
    """ViewSet - mặc định yêu cầu đăng nhập"""
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if hasattr(serializer.Meta.model, 'user_id'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()