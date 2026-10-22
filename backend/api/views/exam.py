from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import ExamAttempt
from api.serializers import ExamStartSerializer, ExamSubmitSerializer
from api.services import exams as exam_service
from api.services.gamification import record_activity


class ExamViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExamStartSerializer

    def get_queryset(self):
        return ExamAttempt.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        return ExamSubmitSerializer if self.action == 'submit' else ExamStartSerializer

    def list(self, request, *args, **kwargs):
        """Lịch sử các lần thi đã nộp."""
        attempts = self.get_queryset().filter(submitted_at__isnull=False)[:50]
        return Response([exam_service.history_item(a) for a in attempts])

    def retrieve(self, request, *args, **kwargs):
        attempt = self.get_object()
        exam_service.close_if_stale(attempt)
        if attempt.submitted_at is None:
            return Response(exam_service.public_attempt(attempt))
        return Response(exam_service.result_attempt(attempt))

    def create(self, request, *args, **kwargs):
        serializer = ExamStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exam_service.close_stale(request.user)
        existing = exam_service.active_attempt(request.user)
        if existing:  # đang làm dở một bài thì tiếp tục bài đó
            return Response(exam_service.public_attempt(existing))

        level = serializer.validated_data['level']
        count = serializer.validated_data['count']
        try:
            questions = exam_service.generate_questions(level, count)
        except exam_service.NotEnoughQuestions:
            return Response(
                {'error': f'Cấp độ {level} chưa đủ dữ liệu để tạo đề thi'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attempt = ExamAttempt.objects.create(
            user=request.user,
            level=level,
            questions=questions,
            total=len(questions),
            duration_seconds=len(questions) * exam_service.SECONDS_PER_QUESTION,
        )
        return Response(exam_service.public_attempt(attempt), status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=False, url_path='active')
    def active(self, request):
        exam_service.close_stale(request.user)
        attempt = exam_service.active_attempt(request.user)
        return Response({
            'attempt': exam_service.public_attempt(attempt) if attempt else None,
            'seconds_per_question': exam_service.SECONDS_PER_QUESTION,
        })

    @action(methods=['post'], detail=True)
    def submit(self, request, *args, **kwargs):
        attempt = self.get_object()
        if attempt.submitted_at is not None:
            return Response(exam_service.result_attempt(attempt))  # nộp lại thì trả kết quả cũ

        serializer = ExamSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        exam_service.finalize(attempt, serializer.validated_data['answers'])

        result = exam_service.result_attempt(attempt)
        if not result['late']:
            record_activity(request.user, points=attempt.correct_count)
        return Response(result)