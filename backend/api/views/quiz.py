from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import Quiz, QuizResult
from api.serializers import QuizSerializer, QuizDetailSerializer, QuizSubmitSerializer
from api.services.gamification import record_activity
from .base import BaseReadOnlyViewSet


class QuizViewSet(BaseReadOnlyViewSet):
    queryset = Quiz.objects.prefetch_related('questions__answers')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        if self.action == 'submit':
            return QuizSubmitSerializer
        return QuizSerializer

    @action(methods=['post'], detail=True, permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        quiz = self.get_object()
        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submitted_answers = serializer.validated_data['answers']

        total = quiz.questions.count()
        correct_count = 0
        results = []

        for item in submitted_answers:
            question_id = item['question']
            answer_id = item['answer']

            question = quiz.questions.filter(id=question_id).first()
            if not question:
                continue

            answer = question.answers.filter(id=answer_id).first()
            is_correct = bool(answer and answer.is_correct)
            if is_correct:
                correct_count += 1

            results.append({
                'question': question_id,
                'answer': answer_id,
                'is_correct': is_correct,
            })

        score = round((correct_count / total) * 10, 2) if total > 0 else 0

        QuizResult.objects.create(user=request.user, quiz=quiz, score=score)

        points_earned = correct_count * 5
        record_activity(request.user, points=points_earned)

        return Response({
            'score': score,
            'correct_count': correct_count,
            'total': total,
            'points_earned': points_earned,
            'results': results,
        }, status=status.HTTP_200_OK)