import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from api.serializers import ChatRequestSerializer
from api.services.assistant import ask_assistant

logger = logging.getLogger(__name__)


class AssistantChatView(generics.GenericAPIView):
    serializer_class = ChatRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'assistant'

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reply = ask_assistant(
                serializer.validated_data['messages'],
                level=request.user.level,
            )
        except Exception:
            logger.exception('Lỗi khi gọi Gemini')
            return Response(
                {'error': 'Trợ lý đang bận, bạn thử lại sau nhé'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not reply:
            return Response(
                {'error': 'Trợ lý không trả lời được câu này, bạn thử hỏi cách khác'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({'reply': reply})