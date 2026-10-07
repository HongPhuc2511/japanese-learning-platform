from rest_framework import serializers
from api.models import FlashcardReview, Vocabulary, Kanji
from .base import BaseSerializer


class FlashcardReviewSerializer(BaseSerializer):
    content = serializers.SerializerMethodField()

    class Meta(BaseSerializer.Meta):
        model = FlashcardReview
        fields = [
            'id', 'content_type', 'object_id', 'content',
            'ease_factor', 'interval_days', 'next_review_date', 'review_count',
        ]
        read_only_fields = [
            'ease_factor', 'interval_days', 'next_review_date', 'review_count',
        ]

    def get_content(self, obj):
        if obj.content_type == 'vocabulary':
            item = Vocabulary.objects.filter(id=obj.object_id).first()
            if not item:
                return None
            return {
                'front': item.word,
                'kana': item.kana,
                'back': item.meaning,
            }
        elif obj.content_type == 'kanji':
            item = Kanji.objects.filter(id=obj.object_id).first()
            if not item:
                return None
            return {
                'front': item.character,
                'kana': None,
                'back': item.meaning,
            }
        return None