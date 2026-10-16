import uuid

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.messaging.models import (
    Conversation,
    ConversationParticipant,
    Message,
    MessageReceipt,
)
from apps.messaging.services import (
    get_member_conversation,
    unread_counts,
    total_unread,
)
from rest_framework.exceptions import NotFound


User = get_user_model()


class MessagingServiceTests(TestCase):
    def setUp(self):
        self.sender = User.objects.create_user(
            username="doctor_sender",
            password="TestPassword123!",
        )
        self.recipient = User.objects.create_user(
            username="doctor_recipient",
            password="TestPassword123!",
        )
        self.conversation = Conversation.objects.create(
            conversation_type=Conversation.Type.DIRECT,
            created_by=self.sender,
        )
        ConversationParticipant.objects.create(
            conversation=self.conversation,
            user=self.sender,
            role=ConversationParticipant.Role.OWNER,
        )
        ConversationParticipant.objects.create(
            conversation=self.conversation,
            user=self.recipient,
        )

    def create_message(self, sender, status=Message.Status.SENT):
        return Message.objects.create(
            conversation=self.conversation,
            sender=sender,
            body="Test message",
            client_msg_id=uuid.uuid4(),
            status=status,
        )

    def test_empty_conversation_ids_returns_empty_counts(self):
        self.assertEqual(unread_counts(self.recipient, []), {})

    def test_legacy_seen_message_is_not_unread(self):
        self.create_message(self.sender, status=Message.Status.SEEN)

        self.assertEqual(
            unread_counts(self.recipient, [self.conversation.id]),
            {},
        )
        self.assertEqual(total_unread(self.recipient), 0)

    def test_legacy_sent_message_counts_as_unread(self):
        self.create_message(self.sender, status=Message.Status.SENT)

        self.assertEqual(
            unread_counts(self.recipient, [self.conversation.id]),
            {self.conversation.id: 1},
        )
        self.assertEqual(total_unread(self.recipient), 1)

    def test_sender_own_message_is_not_unread(self):
        self.create_message(self.sender, status=Message.Status.SENT)

        self.assertEqual(
            unread_counts(self.sender, [self.conversation.id]),
            {},
        )
        self.assertEqual(total_unread(self.sender), 0)

    def test_non_member_cannot_access_conversation(self):
        outsider = User.objects.create_user(
            username="doctor_outsider",
            password="TestPassword123!",
        )

        with self.assertRaises(NotFound):
            get_member_conversation(outsider, self.conversation.id)