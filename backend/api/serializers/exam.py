from rest_framework import serializers


class ExamStartSerializer(serializers.Serializer):
    level = serializers.ChoiceField(choices=['N5', 'N4', 'N3', 'N2', 'N1'])
    count = serializers.ChoiceField(choices=[10, 20, 30], default=20)


class ExamSubmitSerializer(serializers.Serializer):
    # {"0": 2, "5": 1}: số câu mapping tới vị trí đáp án đã chọn
    answers = serializers.DictField(child=serializers.IntegerField(min_value=0), allow_empty=True)