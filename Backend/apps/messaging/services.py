from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models import Count, Max, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from apps.connections.services import are_connected
from .models import Conversation, ConversationParticipant, Message, MessageReceipt, OutboxEvent
from apps.connections.models import Connection
from apps.notifications.models import Notification

def direct_key(a_id, b_id):
    low, high = sorted((a_id, b_id))
    return f'{low}:{high}'


def get_or_create_direct(user, other_id):
    if other_id == user.id:
        raise ValidationError({'recipientId': ['You cannot message yourself.']})
    other = get_user_model().objects.filter(pk=other_id, is_active=True).first()
    if other is None:
        raise NotFound('Doctor not found.')
    key = direct_key(user.id, other.id)
    existing = Conversation.objects.filter(direct_key=key).first()
    if existing:
        return existing, False
    if settings.MESSAGING_REQUIRES_CONNECTION and not are_connected(user, other):
        raise PermissionDenied('Connect with this doctor before sending a message.')
    try:
        with transaction.atomic():
            conversation = Conversation.objects.create(direct_key=key, conversation_type=Conversation.Type.DIRECT, created_by=user)
            ConversationParticipant.objects.bulk_create([
                ConversationParticipant(conversation=conversation, user=user, role=ConversationParticipant.Role.OWNER),
                ConversationParticipant(conversation=conversation, user=other, role=ConversationParticipant.Role.MEMBER)])
        return conversation, True
    except IntegrityError:
        return Conversation.objects.get(direct_key=key), False


def get_member_conversation(user, pk):
    conversation = Conversation.objects.filter(pk=pk, participants__user=user, participants__left_at__isnull=True).first()
    if conversation is None:
        raise NotFound('Conversation not found.')
    return conversation


def other_user_id(conversation, user):
    return (ConversationParticipant.objects.filter(conversation=conversation, left_at__isnull=True)
            .exclude(user=user).values_list('user_id', flat=True).first())


def participant_user_ids(conversation, exclude_user_id=None):
    qs = ConversationParticipant.objects.filter(conversation=conversation, left_at__isnull=True)
    if exclude_user_id is not None:
        qs = qs.exclude(user_id=exclude_user_id)
    return list(qs.values_list('user_id', flat=True))


def create_group(user, title, participant_ids):
    title = (title or '').strip()
    if not title or len(title) > 120:
        raise ValidationError({'title': ['Group title is required and must be at most 120 characters']})
    try:
        ids = [int(value) for value in participant_ids]
    except (TypeError, ValueError):
        raise ValidationError({'participantIds': ['Every participant id must be an integer']})
    ids = list(dict.fromkeys(ids))
    ids = [uid for uid in ids if uid != user.id]
    if not ids:
        raise ValidationError({'participantIds': ['Add at least one other doctor']})
    if len(ids) > 99:
        raise ValidationError({'participantIds': ['A group can have at most 100 participants including you']})
    User = get_user_model()
    users = list(User.objects.filter(pk__in=ids, is_active=True))
    if len(users) != len(ids):
        raise NotFound('One or more doctors were not found')
    if settings.MESSAGING_REQUIRES_CONNECTION:
        blocked = [u.id for u in users if not are_connected(user, u)]
        if blocked:
            raise PermissionDenied('You must be connected to every doctor you add to a group')
    with transaction.atomic():
        conversation = Conversation.objects.create(conversation_type=Conversation.Type.GROUP, title=title, created_by=user)
        ConversationParticipant.objects.bulk_create([
            ConversationParticipant(conversation=conversation, user=user, role=ConversationParticipant.Role.OWNER),
            *[ConversationParticipant(conversation=conversation, user=other) for other in users],
        ])
    return conversation


def add_group_participants(actor, conversation, participant_ids):
    membership = ConversationParticipant.objects.filter(conversation=conversation, user=actor, left_at__isnull=True).first()
    if conversation.conversation_type != Conversation.Type.GROUP or not membership or membership.role not in (ConversationParticipant.Role.OWNER, ConversationParticipant.Role.ADMIN):
        raise PermissionDenied('Only group administrators can add participants')
    try:
        ids = list(dict.fromkeys(int(value) for value in participant_ids))
    except (TypeError, ValueError):
        raise ValidationError({'participantIds': ['Every participant id must be an integer']})
    ids = [uid for uid in ids if uid != actor.id]
    User = get_user_model()
    users = list(User.objects.filter(pk__in=ids, is_active=True))
    if len(users) != len(ids):
        raise NotFound('One or more doctors were not found')
    if settings.MESSAGING_REQUIRES_CONNECTION and any(not are_connected(actor, u) for u in users):
        raise PermissionDenied('You must be connected to every doctor you add to a group')
    with transaction.atomic():
        locked_conversation = Conversation.objects.select_for_update().get(pk=conversation.pk)
        existing = set(ConversationParticipant.objects.filter(
            conversation=locked_conversation, user_id__in=ids, left_at__isnull=True
        ).values_list('user_id', flat=True))
        to_add = [u for u in users if u.id not in existing]
        active_count = ConversationParticipant.objects.filter(
            conversation=locked_conversation, left_at__isnull=True).count()
        if active_count + len(to_add) > 100:
            raise ValidationError({'participantIds': ['A group can have at most 100 active participants']})
        for other in to_add:
            ConversationParticipant.objects.update_or_create(
                conversation=locked_conversation, user=other,
                defaults={'left_at': None, 'joined_at': timezone.now(), 'role': ConversationParticipant.Role.MEMBER})
    return to_add


def remove_group_participant(actor, conversation, user_id):
    actor_membership = ConversationParticipant.objects.filter(conversation=conversation, user=actor, left_at__isnull=True).first()
    target = ConversationParticipant.objects.filter(conversation=conversation, user_id=user_id, left_at__isnull=True).first()
    if conversation.conversation_type != Conversation.Type.GROUP or not actor_membership or not target:
        raise NotFound('Group participant not found')
    if actor.id != target.user_id and actor_membership.role not in (ConversationParticipant.Role.OWNER, ConversationParticipant.Role.ADMIN):
        raise PermissionDenied('Only group administrators can remove participants')
    if target.role == ConversationParticipant.Role.OWNER:
        raise PermissionDenied('The group owner cannot leave or be removed until ownership is transferred')
    target.left_at = timezone.now()
    target.save(update_fields=['left_at'])
    return target


def send_message(conversation, sender, body, client_msg_id):
    if not isinstance(body, str):
        raise ValidationError({'body': ['Message must be text']})
    body = body.strip()
    if not body or len(body) > 4000:
        raise ValidationError({'body': ['Message must contain 1–4000 characters']})
    if not ConversationParticipant.objects.filter(conversation=conversation, user=sender, left_at__isnull=True).exists():
        raise NotFound('Conversation not found')
    try:
        with transaction.atomic():
            message = Message.objects.create(conversation=conversation, sender=sender, body=body, client_msg_id=client_msg_id)
            Conversation.objects.filter(pk=conversation.pk).update(
                last_message=message, last_message_at=message.created_at)
            recipient_ids = participant_user_ids(conversation, sender.id)
            MessageReceipt.objects.bulk_create([MessageReceipt(message=message, recipient_id=uid) for uid in recipient_ids])
            Notification.objects.bulk_create([
                Notification(
                    recipient_id=uid,
                    actor=sender,
                    type=Notification.Type.NEW_MESSAGE,
                    payload={
                        "conversationId": conversation.id,
                        "messageId": message.id,
                    },
                )
                for uid in recipient_ids
            ])
            OutboxEvent.objects.create(event_type='MESSAGE_CREATED', payload={
                'messageId': message.id, 'conversationId': conversation.id, 'senderId': sender.id,
            })
            from .realtime import publish_message_created
            transaction.on_commit(lambda mid=message.id, cid=conversation.id: publish_message_created(mid, cid))
        return message, True
    except IntegrityError:
        existing = Message.objects.filter(conversation=conversation, sender=sender, client_msg_id=client_msg_id).first()
        if existing is None:
            raise
        if existing.body != body:
            raise ValidationError({'clientMsgId': ['This idempotency key was already used for a different message.']})
        return existing, False


def mark_delivered(user, conversation, up_to_id=None):
    qs = MessageReceipt.objects.filter(message__conversation=conversation, recipient=user, delivered_at__isnull=True)
    if up_to_id:
        qs = qs.filter(message_id__lte=up_to_id)
    ids = list(qs.values_list('message_id', flat=True))
    if not ids:
        legacy = Message.objects.filter(conversation=conversation, status__lt=Message.Status.DELIVERED, receipts__isnull=True).exclude(sender=user)
        if up_to_id:
            legacy = legacy.filter(id__lte=up_to_id)
        legacy_ids = list(legacy.values_list('id', flat=True))
        if not legacy_ids:
            return None
        legacy.update(status=Message.Status.DELIVERED, delivered_at=timezone.now())
        return max(legacy_ids)
    now = timezone.now()
    MessageReceipt.objects.filter(message_id__in=ids, recipient=user, delivered_at__isnull=True).update(delivered_at=now)
    for message_id in ids:
        receipts = MessageReceipt.objects.filter(message_id=message_id)
        if receipts.exists() and not receipts.filter(delivered_at__isnull=True).exists():
            Message.objects.filter(pk=message_id, status__lt=Message.Status.DELIVERED).update(
                status=Message.Status.DELIVERED, delivered_at=now)
    return max(ids)


def mark_seen(user, conversation, up_to_id):
    target = Message.objects.filter(conversation=conversation, pk=up_to_id).first()
    if target is None:
        return None
    membership = ConversationParticipant.objects.filter(
        conversation=conversation, user=user, left_at__isnull=True).first()
    if membership is None:
        return None
    if membership.last_read_at is None or target.created_at > membership.last_read_at:
        ConversationParticipant.objects.filter(pk=membership.pk).update(last_read_at=target.created_at)
    qs = MessageReceipt.objects.filter(message__conversation=conversation, message_id__lte=up_to_id, recipient=user, read_at__isnull=True)
    ids = list(qs.values_list('message_id', flat=True))
    if not ids:
        legacy = Message.objects.filter(conversation=conversation, id__lte=up_to_id, status__lt=Message.Status.SEEN, receipts__isnull=True).exclude(sender=user)
        legacy_ids = list(legacy.values_list('id', flat=True))
        if legacy_ids:
            now = timezone.now()
            legacy.update(status=Message.Status.SEEN, seen_at=now, delivered_at=Coalesce('delivered_at', Value(now)))
            return max(legacy_ids)
        return None
    now = timezone.now()
    MessageReceipt.objects.filter(message_id__in=ids, recipient=user, read_at__isnull=True).update(
        read_at=now, delivered_at=Coalesce('delivered_at', Value(now)))
    for message_id in ids:
        receipts = MessageReceipt.objects.filter(message_id=message_id)
        if receipts.exists() and not receipts.filter(read_at__isnull=True).exists():
            Message.objects.filter(pk=message_id, status__lt=Message.Status.SEEN).update(
                status=Message.Status.SEEN, seen_at=now, delivered_at=Coalesce('delivered_at', Value(now)))
    return max(ids)


def mark_all_delivered(user):
    pending = list(MessageReceipt.objects.filter(recipient=user, delivered_at__isnull=True, message__conversation__participants__user=user, message__conversation__participants__left_at__isnull=True).select_related('message').values('message_id', 'message__conversation_id', 'message__sender_id'))
    legacy = list(Message.objects.filter(conversation__participants__user=user, conversation__participants__left_at__isnull=True, status=Message.Status.SENT, receipts__isnull=True).exclude(sender=user).values('id', 'conversation_id', 'sender_id'))
    if not pending and not legacy:
        return []
    now = timezone.now()
    ids = [row['message_id'] for row in pending]
    if ids:
        MessageReceipt.objects.filter(message_id__in=ids, recipient=user, delivered_at__isnull=True).update(delivered_at=now)
    grouped = {}
    for row in pending:
        message_id = row['message_id']
        receipts = MessageReceipt.objects.filter(message_id=message_id)
        if not receipts.filter(delivered_at__isnull=True).exists():
            Message.objects.filter(pk=message_id, status__lt=Message.Status.DELIVERED).update(
                status=Message.Status.DELIVERED, delivered_at=now)
        key = (row['message__conversation_id'], row['message__sender_id'])
        grouped[key] = max(grouped.get(key, 0), message_id)
    for row in legacy:
        Message.objects.filter(pk=row['id'], status=Message.Status.SENT).update(
            status=Message.Status.DELIVERED, delivered_at=now)
        key = (row['conversation_id'], row['sender_id'])
        grouped[key] = max(grouped.get(key, 0), row['id'])
    return [{'conversation_id': c, 'sender_id': s, 'recipient_id': user.id, 'up_to_id': i}
            for (c, s), i in grouped.items()]


def unread_counts(user, conversation_ids):
    """Return unread message counts per conversation for this user."""
    ids = list(conversation_ids)
    if not ids:
        return {}

    rows = (
        MessageReceipt.objects
        .filter(
            recipient=user,
            message__conversation_id__in=ids,
            read_at__isnull=True,
        )
        .values("message__conversation_id")
        .annotate(n=Count("id"))
    )

    result = {
        row["message__conversation_id"]: row["n"]
        for row in rows
    }

    # Legacy messages without individual receipts.
    # Exclude messages already marked as seen.
    legacy = (
        Message.objects
        .filter(
            conversation_id__in=ids,
            receipts__isnull=True,
            status__lt=Message.Status.SEEN,
        )
        .exclude(sender=user)
        .values("conversation_id")
        .annotate(n=Count("id"))
    )

    for row in legacy:
        conversation_id = row["conversation_id"]
        result[conversation_id] = (
            result.get(conversation_id, 0) + row["n"]
        )

    return result


def total_unread(user):
    """Return the total unread message count for this user."""
    unread = MessageReceipt.objects.filter(
        recipient=user,
        read_at__isnull=True,
        message__conversation__participants__user=user,
        message__conversation__participants__left_at__isnull=True,
    ).count()

    legacy = (
        Message.objects
        .filter(
            conversation__participants__user=user,
            conversation__participants__left_at__isnull=True,
            receipts__isnull=True,
            status__lt=Message.Status.SEEN,
        )
        .exclude(sender=user)
        .count()
    )

    return unread + legacy


def latest_message_id(conversation):
    return conversation.messages.aggregate(m=Max('id'))['m'] or 0
