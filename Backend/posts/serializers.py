from rest_framework import serializers

from .models import Post, Like, Comment


class PostSerializer(serializers.ModelSerializer):

    author_id = serializers.IntegerField(
        source="author.id",
        read_only=True,
    )

    like_count = serializers.IntegerField(
        source="likes.count",
        read_only=True,
    )

    comment_count = serializers.IntegerField(
        source="comments.count",
        read_only=True,
    )

    class Meta:
        model = Post

        fields = [
            "id",
            "author_id",
            "post_type",
            "content",
            "image",
            "diagnosis",
            "treatment",
            "outcome",
            "like_count",
            "comment_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "author_id",
            "like_count",
            "comment_count",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        post_type = attrs.get(
            "post_type",
            getattr(self.instance, "post_type", Post.PostType.GENERAL),
        )

        if post_type == Post.PostType.CLINICAL_CASE:
            content = attrs.get(
                "content",
                getattr(self.instance, "content", ""),
            )

            if not content.strip():
                raise serializers.ValidationError({
                    "content": "A clinical case must include a description."
                })

        return attrs


class CommentSerializer(serializers.ModelSerializer):

    user_id = serializers.IntegerField(
        source="user.id",
        read_only=True,
    )

    class Meta:
        model = Comment

        fields = [
            "id",
            "post",
            "user_id",
            "content",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user_id",
            "created_at",
            "updated_at",
        ]

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Comment cannot be empty."
            )

        return value


class LikeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Like

        fields = [
            "id",
            "post",
            "user",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "created_at",
        ]