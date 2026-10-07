from api.models import Grammar
from api.serializers import GrammarSerializer
from .base import BaseReadOnlyViewSet


class GrammarViewSet(BaseReadOnlyViewSet):
    queryset = Grammar.objects.all()
    serializer_class = GrammarSerializer
