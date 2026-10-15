from datetime import date

from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import FlashcardReview
from api.serializers import FlashcardReviewSerializer
from api.services.flashcards import CARD_SOURCES, build_queue, build_reviewed
from api.services.gamification import record_activity
from api.services.srs import calculate_sm2


def parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def apply_review(card, quality):
    ease_factor, interval_days, review_count, next_review_date = calculate_sm2(
        quality=quality,
        ease_factor=card.ease_factor,
        interval_days=card.interval_days,
        review_count=card.review_count,
    )
    card.ease_factor = ease_factor
    card.interval_days = interval_days
    card.review_count = review_count
    card.next_review_date = next_review_date
    card.save()


class FlashcardReviewViewSet(viewsets.GenericViewSet,
                              mixins.ListModelMixin,
                              mixins.CreateModelMixin):
    serializer_class = FlashcardReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FlashcardReview.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, next_review_date=date.today())

    @action(methods=['get'], detail=False, url_path='due')
    def due(self, request):
        cards = self.get_queryset().filter(next_review_date__lte=date.today())
        return Response(self.get_serializer(cards, many=True).data)

    @action(methods=['get'], detail=False, url_path='queue')
    def queue(self, request):
        limit = max(1, min(parse_int(request.query_params.get('limit')) or 20, 50))
        return Response(build_queue(request.user, request.query_params.get('level'), limit))

    @action(methods=['get'], detail=False, url_path='reviewed')
    def reviewed(self, request):
        return Response(build_reviewed(request.user, request.query_params.get('level')))

    @action(methods=['post'], detail=False, url_path='answer')
    def answer(self, request):
        content_type = request.data.get('content_type')
        object_id = parse_int(request.data.get('object_id'))
        quality = parse_int(request.data.get('quality'))

        if content_type not in CARD_SOURCES or object_id is None:
            return Response({'error': 'content_type hoặc object_id không hợp lệ'},
                            status=status.HTTP_400_BAD_REQUEST)
        if quality is None or not 0 <= quality <= 5:
            return Response({'error': 'quality phải là số từ 0 đến 5'},
                            status=status.HTTP_400_BAD_REQUEST)
        if not CARD_SOURCES[content_type][0].objects.filter(pk=object_id).exists():
            return Response({'error': 'Không tìm thấy nội dung này'},
                            status=status.HTTP_404_NOT_FOUND)

        today = date.today()
        card = FlashcardReview.objects.filter(
            user=request.user, content_type=content_type, object_id=object_id
        ).order_by('id').first()
        is_new = card is None
        if is_new:
            card = FlashcardReview(
                user=request.user, content_type=content_type,
                object_id=object_id, next_review_date=today,
            )

        is_due = is_new or card.next_review_date <= today
        correct = quality >= 3

        # Ôn sớm mà trả lời đúng: chỉ luyện thêm, không đổi lịch và không cộng điểm
        if is_due or not correct:
            apply_review(card, quality)
            record_activity(request.user, points=2 if (correct and is_due) else 0)

        return Response(self.get_serializer(card).data)

    @action(methods=['post'], detail=True)
    def review(self, request, pk=None):
        card = self.get_object()
        quality = parse_int(request.data.get('quality'))
        if quality is None or not 0 <= quality <= 5:
            return Response({'error': 'quality phải là số từ 0 đến 5'},
                            status=status.HTTP_400_BAD_REQUEST)
        apply_review(card, quality)
        record_activity(request.user, points=2 if quality >= 3 else 0)
        return Response(self.get_serializer(card).data)