from api.models import Grammar
from .base import BaseSerializer


class GrammarSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Grammar
        fields = '__all__'