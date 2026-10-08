from rest_framework import serializers
from api.models import Bookmark, Vocabulary, Kanji
from .base import BaseSerializer


class BookmarkSerializer(BaseSerializer):
    content = serializers.SerializerMethodField()

    class Meta(BaseSerializer.Meta):
        model = Bookmark
        fields = ['id', 'content_type', 'object_id', 'content']

    def get_content(self, obj):
        if obj.content_type == 'vocabulary':
            item = Vocabulary.objects.filter(id=obj.object_id).first()
            if not item:
                return None
            return {
                'front': item.word,
                'reading': item.kana,
                'back': item.meaning,
                'level': item.level,
            }
        elif obj.content_type == 'kanji':
            item = Kanji.objects.filter(id=obj.object_id).first()
            if not item:
                return None
            return {
                'front': item.character,
                'reading': f"{item.onyomi} | {item.kunyomi}",
                'back': item.meaning,
                'level': item.jlpt_level,
            }
        return None