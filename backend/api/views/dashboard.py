from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from api.services.dashboard import build_dashboard


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(build_dashboard(request.user))