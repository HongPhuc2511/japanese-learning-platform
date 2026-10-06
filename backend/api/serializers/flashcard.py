from api.models import FlashcardReview
from .base import BaseSerializer


class FlashcardReviewSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = FlashcardReview
        fields = [
            'id', 'content_type', 'object_id',
            'ease_factor', 'interval_days', 'next_review_date', 'review_count',
        ]
        read_only_fields = [
            'ease_factor', 'interval_days', 'next_review_date', 'review_count',
        ]