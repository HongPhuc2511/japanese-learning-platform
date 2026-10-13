from rest_framework import filters

from api.models import Vocabulary, Kanji
from api.pagination import StandardPagination
from api.serializers import VocabularySerializer, KanjiSerializer
from .base import BaseReadOnlyViewSet, LevelFilterMixin


class VocabularyViewSet(LevelFilterMixin, BaseReadOnlyViewSet):
    queryset = Vocabulary.objects.order_by('id')
    serializer_class = VocabularySerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['word', 'kana', 'romaji', 'meaning']
    level_field = 'level'


class KanjiViewSet(LevelFilterMixin, BaseReadOnlyViewSet):
    queryset = Kanji.objects.order_by('id')
    serializer_class = KanjiSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['character', 'meaning', 'onyomi', 'kunyomi']
    level_field = 'jlpt_level'