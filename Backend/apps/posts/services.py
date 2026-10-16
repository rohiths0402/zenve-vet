
from django.db import transaction

from .models import Post, PostLike, PostShare


@transaction.atomic
def create_post(*, author, validated_data):
    """Create a post for the authenticated author."""
    return Post.objects.create(
        author=author,
        **validated_data,
    )


@transaction.atomic
def like_post(*, post, user):
    """Like a post once; repeated requests do not duplicate likes."""
    _, created = PostLike.objects.get_or_create(
        post=post,
        user=user,
    )

    return {
        "liked": True,
        "created": created,
        "likes_count": PostLike.objects.filter(post=post).count(),
    }


@transaction.atomic
def unlike_post(*, post, user):
    """Remove the current user's like, if one exists."""
    deleted, _ = PostLike.objects.filter(
        post=post,
        user=user,
    ).delete()

    return {
        "liked": False,
        "removed": deleted > 0,
        "likes_count": PostLike.objects.filter(post=post).count(),
    }


@transaction.atomic
def share_post(*, post, user):
    """Record one share per user per post."""
    _, created = PostShare.objects.get_or_create(
        post=post,
        user=user,
    )

    return {
        "shared": True,
        "created": created,
        "shares_count": PostShare.objects.filter(post=post).count(),
    }
