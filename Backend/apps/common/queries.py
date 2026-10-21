
from django.contrib.auth import get_user_model
from django.db.models import Count, Exists, OuterRef, Q
from django.utils import timezone

from apps.accounts.models import DoctorProfile, Clinic
from apps.connections.models import Connection
from apps.messaging.models import (
    Conversation,
    ConversationParticipant,
    Message,
    MessageReceipt,
)
from apps.notifications.models import Notification
from apps.posts.models import (
    Post,
    ClinicalCase,
    PostLike,
    PostComment,
    PostShare,
)
from apps.stories.models import Story


User = get_user_model()


# ============================================================
# ACCOUNTS AND DOCTOR PROFILES
# ============================================================

def get_user_by_id(user_id):
    return User.objects.filter(pk=user_id).first()


def get_doctor_profile(user_id):
    return (
        DoctorProfile.objects
        .select_related("user")
        .filter(user_id=user_id)
        .first()
    )


def search_doctors(query="", limit=20):
    profiles = DoctorProfile.objects.select_related("user").all()

    if query and query.strip():
        term = query.strip()
        profiles = profiles.filter(
            Q(user__username__icontains=term)
            | Q(user__first_name__icontains=term)
            | Q(user__last_name__icontains=term)
            | Q(specialty__icontains=term)
            | Q(city__icontains=term)
            | Q(state__icontains=term)
        )

    return profiles.order_by("user__username")[:max(1, min(limit, 100))]


def get_clinics(user_id):
    return Clinic.objects.filter(
        profile__user_id=user_id
    ).order_by("-created_at")


# ============================================================
# FEED AND POSTS
# ============================================================

def get_feed_queryset(user=None):
    """
    Shared feed query.

    Includes the counts expected by the feed serializer.
    Adds is_liked_by_user when an authenticated user is supplied.
    """
    queryset = (
        Post.objects
        .filter(is_published=True)
        .select_related("author")
        .annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", distinct=True),
            shares_count=Count("shares", distinct=True),
        )
    )

    if user is not None and user.is_authenticated:
        queryset = queryset.annotate(
            is_liked_by_user=Exists(
                PostLike.objects.filter(
                    post_id=OuterRef("pk"),
                    user_id=user.pk,
                )
            )
        )

    return queryset


def get_feed_posts(limit=50, user=None):
    limit = max(1, min(limit, 100))

    return get_feed_queryset(user).order_by("-created_at")[:limit]


def get_post(post_id):
    return (
        Post.objects
        .filter(pk=post_id, is_published=True)
        .select_related("author")
        .first()
    )


def get_user_posts(user_id, limit=50):
    limit = max(1, min(limit, 100))

    return (
        Post.objects
        .filter(author_id=user_id, is_published=True)
        .select_related("author")
        .order_by("-created_at")[:limit]
    )


def get_clinical_case(post_id):
    return (
        ClinicalCase.objects
        .select_related("post", "post__author")
        .filter(post_id=post_id)
        .first()
    )


def get_post_comments(post_id, limit=100):
    limit = max(1, min(limit, 100))

    return (
        PostComment.objects
        .filter(post_id=post_id, post__is_published=True)
        .select_related("author")
        .order_by("created_at")[:limit]
    )


def get_post_likes(post_id):
    return PostLike.objects.filter(
        post_id=post_id
    ).select_related("user")


def get_post_shares(post_id):
    return PostShare.objects.filter(
        post_id=post_id
    ).select_related("user")


# ============================================================
# STORIES
# ============================================================

def get_user_stories(user_id=None):
    queryset = Story.objects.filter(
        is_active=True,
        expires_at__gt=timezone.now(),
    ).select_related("author")

    if user_id is not None:
        queryset = queryset.filter(author_id=user_id)

    return queryset.order_by("-created_at")


# ============================================================
# CONNECTIONS
# ============================================================

def get_user_connections(user_id):
    return (
        Connection.objects
        .filter(
            Q(user_a_id=user_id) | Q(user_b_id=user_id),
            status="accepted",
        )
        .select_related("user_a", "user_b", "requested_by")
        .order_by("-updated_at")
    )


def get_incoming_connection_requests(user_id):
    return (
        Connection.objects
        .filter(
            Q(user_a_id=user_id) | Q(user_b_id=user_id),
            status="pending",
        )
        .exclude(requested_by_id=user_id)
        .select_related("user_a", "user_b", "requested_by")
        .order_by("-created_at")
    )


def get_outgoing_connection_requests(user_id):
    return (
        Connection.objects
        .filter(
            requested_by_id=user_id,
            status="pending",
        )
        .select_related("user_a", "user_b", "requested_by")
        .order_by("-created_at")
    )


# ============================================================
# MESSAGING
# ============================================================

def get_user_conversations(user_id):
    conversation_ids = (
        ConversationParticipant.objects
        .filter(user_id=user_id, left_at__isnull=True)
        .values_list("conversation_id", flat=True)
    )

    return (
        Conversation.objects
        .filter(pk__in=conversation_ids)
        .select_related("created_by", "last_message")
        .order_by("-last_message_at", "-created_at")
    )


def get_conversation_participants(conversation_id):
    return (
        ConversationParticipant.objects
        .filter(
            conversation_id=conversation_id,
            left_at__isnull=True,
        )
        .select_related("user")
        .order_by("joined_at")
    )


def get_conversation_messages(conversation_id, user_id, limit=50):
    is_participant = ConversationParticipant.objects.filter(
        conversation_id=conversation_id,
        user_id=user_id,
        left_at__isnull=True,
    ).exists()

    if not is_participant:
        return Message.objects.none()

    limit = max(1, min(limit, 100))

    return (
        Message.objects
        .filter(conversation_id=conversation_id)
        .select_related("sender", "conversation")
        .order_by("-created_at", "-pk")[:limit]
    )


def get_message_receipts(message_id):
    return MessageReceipt.objects.filter(
        message_id=message_id
    ).select_related("recipient")


# ============================================================
# NOTIFICATIONS
# ============================================================

def get_user_notifications(user_id, unread_only=False, limit=50):
    queryset = (
        Notification.objects
        .filter(recipient_id=user_id)
        .select_related("actor", "recipient")
        .order_by("-created_at")
    )

    if unread_only:
        queryset = queryset.filter(is_read=False)

    limit = max(1, min(limit, 100))
    return queryset[:limit]


def get_unread_notification_count(user_id):
    return Notification.objects.filter(
        recipient_id=user_id,
        is_read=False,
    ).count()
