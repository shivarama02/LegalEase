from rest_framework import serializers
from .models import LawInfo, Client, Lawyer


class LawInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawInfo
        fields = '__all__'


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        exclude = ['password']  # don't expose password hash in API list/detail

    def create(self, validated_data):
        # Placeholder: in a real app you'd hash the password.
        return super().create(validated_data)


class LawyerSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lawyer
        exclude = ['password']

    def get_full_name(self, obj):
        # If model later adds first/last name, adapt this.
        return obj.lname

    def validate_experience_years(self, value):
        if value < 0:
            raise serializers.ValidationError("experience_years cannot be negative")
        return value