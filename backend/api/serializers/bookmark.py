from api.models import Bookmark
from .base import BaseSerializer


class BookmarkSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Bookmark
        fields = ['id', 'content_type', 'object_id']