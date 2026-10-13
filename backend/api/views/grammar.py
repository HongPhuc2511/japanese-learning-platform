from rest_framework import filters

from api.models import Grammar
from api.pagination import StandardPagination
from api.serializers import GrammarSerializer
from .base import BaseReadOnlyViewSet, LevelFilterMixin


class GrammarViewSet(LevelFilterMixin, BaseReadOnlyViewSet):
    queryset = Grammar.objects.order_by('id')
    serializer_class = GrammarSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'explanation', 'example_sentence']
    level_field = 'level'