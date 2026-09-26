from api.models import Vocabulary, Kanji
from api.serializers import VocabularySerializer, KanjiSerializer
from .base import BaseReadOnlyViewSet


class VocabularyViewSet(BaseReadOnlyViewSet):
    queryset = Vocabulary.objects.all()
    serializer_class = VocabularySerializer


class KanjiViewSet(BaseReadOnlyViewSet):
    queryset = Kanji.objects.all()
    serializer_class = KanjiSerializer