
from django.conf import settings
from django.db import models


class Post(models.Model):
    class ContentType(models.TextChoices):
        POST = "post", "Text Post"
        CASE = "case", "Clinical Case"
        VIDEO = "video", "Short Video"

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    content_type = models.CharField(
        max_length=10,
        choices=ContentType.choices,
        default=ContentType.POST,
        db_index=True,
    )
    caption = models.TextField()
    media_url = models.URLField(max_length=1000, blank=True)
    thumbnail_url = models.URLField(max_length=1000, blank=True)
    is_published = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["author", "content_type", "-created_at"],
                name="post_author_type_date_idx",
            ),
        ]

    def __str__(self):
        return f"{self.author_id}: {self.content_type} #{self.pk}"


class ClinicalCase(models.Model):
    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name="clinical_case",
    )
    case_title = models.CharField(max_length=200)
    case_summary = models.TextField()
    findings = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    consent_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return self.case_title


class PostLike(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="post_likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["post", "user"],
                name="unique_user_post_like",
            )
        ]


class PostComment(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="post_comments",
    )
    content = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]


class PostShare(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="shares",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="post_shares",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["post", "user"],
                name="unique_user_post_share",
            )
        ]
