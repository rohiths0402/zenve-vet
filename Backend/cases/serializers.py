from rest_framework import serializers
from .models import VeterinaryCase
from accounts.serializers import UserSerializer

class VeterinaryCaseSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)

    class Meta:
        model = VeterinaryCase
        fields = [
            'id', 'author', 'author_details', 'title', 'description',
            'animal_category', 'clinical_image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
