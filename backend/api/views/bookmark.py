from api.models import Bookmark
from api.serializers import BookmarkSerializer
from .base import BaseViewSet


class BookmarkViewSet(BaseViewSet):
    serializer_class = BookmarkSerializer

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user)