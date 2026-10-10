from rest_framework import serializers


class ChatMessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['user', 'assistant'])
    content = serializers.CharField(max_length=2000)


class ChatRequestSerializer(serializers.Serializer):
    messages = ChatMessageSerializer(many=True)

    def validate_messages(self, value):
        if not value:
            raise serializers.ValidationError('Cần ít nhất 1 tin nhắn')
        if len(value) > 20:
            raise serializers.ValidationError('Tối đa 20 tin nhắn mỗi lần gửi')
        if value[0]['role'] != 'user' or value[-1]['role'] != 'user':
            raise serializers.ValidationError('Tin nhắn đầu và cuối phải là của người dùng')
        return value