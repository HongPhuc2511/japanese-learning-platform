from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from api.services.leaderboard import build_leaderboard


class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
        except ValueError:
            limit = 10
        limit = max(1, min(limit, 50))
        return Response(build_leaderboard(request.user, limit))