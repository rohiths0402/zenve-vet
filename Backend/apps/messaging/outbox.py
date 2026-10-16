import logging
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from apps.notifications.models import Notification
from apps.notifications.services import notify
from .models import ConversationParticipant, Message, OutboxEvent

log = logging.getLogger(__name__)
MAX_ATTEMPTS = 8
LOCK_SECONDS = 60


def process_one(event_id):
    now = timezone.now()
    with transaction.atomic():
        event = OutboxEvent.objects.select_for_update().filter(event_id=event_id).first()
        if event is None:
            return 'failed'
        if event.status == OutboxEvent.Status.PROCESSED:
            return 'processed'
        if event.status == OutboxEvent.Status.FAILED:
            return 'failed'
        if event.status == OutboxEvent.Status.PROCESSING and event.locked_until and event.locked_until > now:
            return 'deferred'
        if event.status == OutboxEvent.Status.PENDING and event.next_attempt_at > now:
            return 'deferred'
        event.status = OutboxEvent.Status.PROCESSING
        event.attempts += 1
        event.locked_until = now + timedelta(seconds=LOCK_SECONDS)
        event.save(update_fields=['status', 'attempts', 'locked_until'])

    try:
        with transaction.atomic():
            event = OutboxEvent.objects.select_for_update().get(event_id=event_id)
            if event.status == OutboxEvent.Status.PROCESSED:
                return 'processed'
            if event.event_type != 'MESSAGE_CREATED':
                raise ValueError(f'Unsupported outbox event type: {event.event_type}')
            message = Message.objects.select_related('sender', 'conversation').get(pk=event.payload['messageId'])
            recipient_ids = (ConversationParticipant.objects.filter(
                conversation=message.conversation, left_at__isnull=True)
                .exclude(user_id=message.sender_id).values_list('user_id', flat=True))
            User = get_user_model()
            recipients = list(User.objects.select_for_update().filter(pk__in=recipient_ids, is_active=True).order_by('pk'))
            for recipient in recipients:
                notify(recipient, Notification.Type.NEW_MESSAGE, actor=message.sender,
                       payload={'conversationId': message.conversation_id, 'messageId': message.id, 'preview': message.body[:80]})
            event.status = OutboxEvent.Status.PROCESSED
            event.processed_at = timezone.now()
            event.locked_until = None
            event.last_error = ''
            event.save(update_fields=['status', 'processed_at', 'locked_until', 'last_error'])
        return 'processed'
    except Exception as exc:
        log.exception('Outbox event failed: %s', event_id)
        with transaction.atomic():
            event = OutboxEvent.objects.select_for_update().filter(event_id=event_id).first()
            if event is None or event.status == OutboxEvent.Status.PROCESSED:
                return 'processed'
            delay = min(300, 2 ** min(max(event.attempts, 1), 8))
            event.last_error = f'{type(exc).__name__}: {exc}'[:500]
            event.locked_until = None
            if event.attempts >= MAX_ATTEMPTS:
                event.status = OutboxEvent.Status.FAILED
            else:
                event.status = OutboxEvent.Status.PENDING
                event.next_attempt_at = timezone.now() + timedelta(seconds=delay)
            event.save(update_fields=['status', 'next_attempt_at', 'locked_until', 'last_error'])
        return 'failed' if event.attempts >= MAX_ATTEMPTS else 'retry'


def process_batch(limit=100):
    now = timezone.now()
    ids = list(OutboxEvent.objects.filter(
        status__in=[OutboxEvent.Status.PENDING, OutboxEvent.Status.PROCESSING],
        next_attempt_at__lte=now,
    ).filter(locked_until__isnull=True).order_by('id').values_list('event_id', flat=True)[:limit])
    ids += list(OutboxEvent.objects.filter(
        status=OutboxEvent.Status.PROCESSING, locked_until__lt=now,
    ).order_by('id').values_list('event_id', flat=True)[:max(0, limit - len(ids))])
    results = {'processed': 0, 'retry': 0, 'failed': 0, 'deferred': 0}
    for event_id in dict.fromkeys(ids):
        result = process_one(event_id)
        results[result] = results.get(result, 0) + 1
    return results
