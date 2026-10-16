
import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q


class Conversation(models.Model):
    class Type(models.TextChoices):
        DIRECT = "DIRECT", "Direct"
        GROUP = "GROUP", "Group"

    direct_key = models.CharField(
        max_length=80, unique=True, null=True, blank=True
    )
    conversation_type = models.CharField(
        max_length=10, choices=Type.choices, default=Type.DIRECT
    )
    title = models.CharField(max_length=120, blank=True, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_conversations",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_message = models.ForeignKey(
        "messaging.Message",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    last_message_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(
                fields=["conversation_type", "-last_message_at", "-id"],
                name="msg_conv_type_last_idx",
            )
        ]


class ConversationParticipant(models.Model):
    class Role(models.TextChoices):
        OWNER = "OWNER", "Owner"
        ADMIN = "ADMIN", "Admin"
        MEMBER = "MEMBER", "Member"

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="participants"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversation_memberships",
    )
    role = models.CharField(
        max_length=10, choices=Role.choices, default=Role.MEMBER
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    last_read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["conversation", "user"],
                name="participant_unique",
            )
        ]
        indexes = [
            models.Index(fields=["user", "conversation"]),
            models.Index(
                fields=["conversation", "left_at"],
                name="msg_part_conv_left_idx",
            ),
        ]


class Message(models.Model):
    class Status(models.IntegerChoices):
        SENT = 1, "Sent"
        DELIVERED = 2, "Delivered"
        SEEN = 3, "Seen"

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+"
    )
    body = models.TextField(max_length=4000)
    client_msg_id = models.UUIDField(default=uuid.uuid4)
    status = models.PositiveSmallIntegerField(
        choices=Status.choices, default=Status.SENT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    seen_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["conversation", "sender", "client_msg_id"],
                name="message_unique_client_id",
            )
        ]
        indexes = [
            models.Index(fields=["conversation", "id"]),
            models.Index(
                fields=["conversation", "created_at", "id"],
                name="msg_message_history_idx",
            ),
            # MySQL does not support conditional indexes.
            # Use a regular composite index instead.
            models.Index(
                fields=["conversation", "status", "sender"],
                name="message_unread_idx",
            ),
        ]


class MessageReceipt(models.Model):
    message = models.ForeignKey(
        Message, on_delete=models.CASCADE, related_name="receipts"
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="message_receipts",
    )
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["message", "recipient"],
                name="message_receipt_unique",
            )
        ]
        indexes = [
            models.Index(
                fields=["recipient", "read_at"],
                name="msg_receipt_unread_idx",
            )
        ]


class OutboxEvent(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        PROCESSED = "PROCESSED", "Processed"
        FAILED = "FAILED", "Failed"

    event_id = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False
    )
    event_type = models.CharField(max_length=60)
    payload = models.JSONField(default=dict)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING
    )
    attempts = models.PositiveSmallIntegerField(default=0)
    next_attempt_at = models.DateTimeField(auto_now_add=True)
    locked_until = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    last_error = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(
                fields=["status", "next_attempt_at", "id"],
                name="msg_outbox_poll_idx",
            )
        ]
