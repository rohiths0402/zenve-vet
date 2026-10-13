from .models import Notification

T = Notification.Type


def notify(recipient, type, actor=None, payload=None):
    """Create a notification. Never notifies a user about their own action. Returns the row or None.

    NEW_MESSAGE is collapsed: one unread notification per conversation whose count grows.
    POST_LIKE is created once per (liker, post) so like/unlike/like does not spam.
    """
    if actor is not None and actor.id == recipient.id:
        return None
    payload = dict(payload or {})

    if type == T.NEW_MESSAGE:
        existing = Notification.objects.filter(
            recipient=recipient, type=type, is_read=False,
            payload__conversationId=payload['conversationId']).first()
        payload['count'] = (existing.payload.get('count', 1) + 1) if existing else 1
        if existing:
            existing.delete()
    elif type == T.POST_LIKE:
        if Notification.objects.filter(recipient=recipient, type=type, actor=actor,
                                       payload__postId=payload['postId']).exists():
            return None

    return Notification.objects.create(recipient=recipient, actor=actor, type=type, payload=payload)
