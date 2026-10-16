
from rest_framework import serializers

from .models import Post, ClinicalCase, PostComment


class ClinicalCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalCase
        fields = [
            "id",
            "case_title",
            "case_summary",
            "findings",
            "treatment",
            "consent_confirmed",
        ]
        read_only_fields = ["id"]


class PostCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(
        source="author.username",
        read_only=True,
    )

    class Meta:
        model = PostComment
        fields = [
            "id",
            "author",
            "author_username",
            "content",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "author",
            "author_username",
            "created_at",
        ]


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(
        source="author.username",
        read_only=True,
    )
    author_full_name = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    shares_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    clinical_case = ClinicalCaseSerializer(required=False)

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "author_username",
            "author_full_name",
            "content_type",
            "caption",
            "media_url",
            "thumbnail_url",
            "is_published",
            "clinical_case",
            "likes_count",
            "comments_count",
            "shares_count",
            "is_liked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "author",
            "author_username",
            "author_full_name",
            "is_published",
            "likes_count",
            "comments_count",
            "shares_count",
            "is_liked",
            "created_at",
            "updated_at",
        ]

    def get_author_full_name(self, obj):
        user = obj.author
        return (
            " ".join(
                part for part in [user.first_name, user.last_name] if part
            )
            or user.username
        )

    def get_is_liked(self, obj):
        if hasattr(obj, "is_liked_by_user"):
            return obj.is_liked_by_user

        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        return obj.likes.filter(user=request.user).exists()

    def validate(self, attrs):
        content_type = attrs.get(
            "content_type",
            getattr(self.instance, "content_type", Post.ContentType.POST),
        )
        media_url = attrs.get(
            "media_url",
            getattr(self.instance, "media_url", ""),
        )
        case_data = attrs.get("clinical_case")

        if content_type == Post.ContentType.VIDEO and not media_url:
            raise serializers.ValidationError({
                "media_url": "A video URL is required for video posts."
            })

        if content_type == Post.ContentType.CASE and not case_data:
            if not self.instance or not hasattr(
                self.instance, "clinical_case"
            ):
                raise serializers.ValidationError({
                    "clinical_case": "Clinical case details are required."
                })

        return attrs

    def create(self, validated_data):
        case_data = validated_data.pop("clinical_case", None)
        post = Post.objects.create(**validated_data)

        if post.content_type == Post.ContentType.CASE and case_data:
            ClinicalCase.objects.create(post=post, **case_data)

        return post

    def update(self, instance, validated_data):
        case_data = validated_data.pop("clinical_case", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        if case_data is not None:
            case, _ = ClinicalCase.objects.get_or_create(post=instance)
            for field, value in case_data.items():
                setattr(case, field, value)
            case.save()

        return instance
