from api.models import Vocabulary, Kanji
from .base import BaseSerializer


class VocabularySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Vocabulary
        fields = '__all__'


class KanjiSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Kanji
        fields = '__all__'