from datetime import date
from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import FlashcardReview
from api.serializers import FlashcardReviewSerializer
from api.services.srs import calculate_sm2
from api.services.gamification import record_activity

class FlashcardReviewViewSet(viewsets.GenericViewSet,
                              mixins.ListModelMixin,
                              mixins.CreateModelMixin):
    serializer_class = FlashcardReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FlashcardReview.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            next_review_date=date.today(),
        )

    @action(methods=['get'], detail=False, url_path='due')
    def due(self, request):
        today = date.today()
        cards = self.get_queryset().filter(next_review_date__lte=today)
        serializer = self.get_serializer(cards, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=True)
    def review(self, request, pk=None):
        card = self.get_object()
        quality = request.data.get('quality')

        if quality is None or not (0 <= int(quality) <= 5):
            return Response(
                {'error': 'quality phải là số từ 0 đến 5'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ease_factor, interval_days, review_count, next_review_date = calculate_sm2(
            quality=int(quality),
            ease_factor=card.ease_factor,
            interval_days=card.interval_days,
            review_count=card.review_count,
        )

        card.ease_factor = ease_factor
        card.interval_days = interval_days
        card.review_count = review_count
        card.next_review_date = next_review_date
        card.save()

        record_activity(request.user, points=2 if int(quality) >= 3 else 0)
        serializer = self.get_serializer(card)
        return Response(serializer.data)