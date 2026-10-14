
from rest_framework import serializers

from .models import Notification

T = Notification.Type


class UserBriefSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    fullName = serializers.SerializerMethodField()

    def get_fullName(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile:
            fullName = getattr(profile, 'full_name', '')
            if fullName:
                return fullName

        return obj.get_full_name() or obj.username


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserBriefSerializer(read_only=True)
    isRead = serializers.BooleanField(source='is_read', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    text = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'type', 'actor', 'payload', 'text', 'isRead', 'createdAt']

    def get_text(self, obj):
        actor = obj.actor
        profile = getattr(actor, 'profile', None) if actor else None

        name = getattr(profile, 'full_name', '') if profile else ''

        if not name:
            name = (
                actor.get_full_name() or actor.username
                if actor else 'Someone'
            )

        count = obj.payload.get('count', 1)

        return {
            T.CONNECTION_REQUEST: f'{name} sent you a connection request',
            T.CONNECTION_ACCEPTED: f'{name} accepted your connection request',
            T.POST_LIKE: f'{name} liked your post',
            T.POST_COMMENT: f'{name} commented on your post',
            T.NEW_MESSAGE: (
                f'{name} sent you a message'
                if count == 1
                else f'{name} sent you {count} messages'
            ),
        }.get(obj.type, 'New notification')
