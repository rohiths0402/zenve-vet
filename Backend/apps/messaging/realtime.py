import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

log = logging.getLogger(__name__)

def user_group(user_id):
    return f'user_{user_id}'


def push_to_user(user_id, payload):
    try:
        async_to_sync(get_channel_layer().group_send)(
            user_group(user_id), {'type': 'chat.event', 'payload': payload})
    except Exception: 
        log.exception('push_to_user failed')


def push_to_user_strict(user_id, payload):
    layer = get_channel_layer()
    if layer is None:
        raise RuntimeError('No Channels layer is configured.')
    async_to_sync(layer.group_send)(user_group(user_id), {'type': 'chat.event', 'payload': payload})


def publish_message_created(message_id, conversation_id):
    from .models import ConversationParticipant, Message
    from .serializers import MessageSerializer

    try:
        message = (Message.objects.select_related('sender', 'conversation').prefetch_related('receipts').filter(pk=message_id, conversation_id=conversation_id).first())
        if message is None:
            return
        payload = {'type': 'message.new', 'conversationId': conversation_id, 'message': MessageSerializer(message).data}
        user_ids = ConversationParticipant.objects.filter(
            conversation_id=conversation_id, left_at__isnull=True
        ).values_list('user_id', flat=True)
        for user_id in user_ids:
            push_to_user(user_id, payload)
    except Exception:
        log.exception('Could not publish message.new for message %s', message_id)
