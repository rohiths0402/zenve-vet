from rest_framework import serializers

from .models import Story


class StorySerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(
        source="author.username",
        read_only=True,
    )
    author_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            "id",
            "author",
            "author_username",
            "author_full_name",
            "media_url",
            "caption",
            "created_at",
            "expires_at",
        ]
        read_only_fields = [
            "id",
            "author",
            "author_username",
            "author_full_name",
            "created_at",
            "expires_at",
        ]

    def get_author_full_name(self, obj):
        user = obj.author
        return (
            " ".join(
                part
                for part in [user.first_name, user.last_name]
                if part
            )
            or user.username
        )