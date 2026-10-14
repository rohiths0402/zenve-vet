import uuid
from rest_framework import serializers
from . import services
from .models import Conversation, ConversationParticipant, Message, MessageReceipt


class MessageReceiptSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source='recipient_id', read_only=True)
    deliveredAt = serializers.DateTimeField(source='delivered_at', read_only=True)
    readAt = serializers.DateTimeField(source='read_at', read_only=True)

    class Meta:
        model = MessageReceipt
        fields = ['userId', 'deliveredAt', 'readAt']


class MessageSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    conversationId = serializers.IntegerField(source='conversation_id', read_only=True)
    clientMsgId = serializers.UUIDField(source='client_msg_id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    deliveredAt = serializers.DateTimeField(source='delivered_at', read_only=True)
    seenAt = serializers.DateTimeField(source='seen_at', read_only=True)
    receipts = MessageReceiptSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversationId', 'sender', 'body', 'clientMsgId', 'status', 'createdAt', 'deliveredAt', 'seenAt', 'receipts']

    def get_status(self, obj):
        return Message.Status(obj.status).name.lower()


class UserBriefSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    fullName = serializers.SerializerMethodField()

    def get_fullName(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile:
            full_name = getattr(profile, 'full_name', '')
            if full_name:
                return full_name

        return obj.get_full_name() or obj.username


class MessageCreateSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=4000)
    clientMsgId = serializers.UUIDField(source='client_msg_id', required=False, write_only=True)

    def validate_body(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Message cannot be empty.')
        return value

    def validate(self, attrs):
        attrs.setdefault('client_msg_id', uuid.uuid4())
        return attrs


class ConversationCreateSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=['DIRECT', 'GROUP'], required=False, default='DIRECT')
    recipientId = serializers.IntegerField(source='recipient_id', required=False, min_value=1)
    participantIds = serializers.ListField(source='participant_ids', child=serializers.IntegerField(min_value=1), required=False, max_length=99)
    title = serializers.CharField(required=False, allow_blank=False, max_length=120)

    def validate(self, attrs):
        kind = attrs['type']
        if kind == 'DIRECT' and not attrs.get('recipient_id'):
            ids = attrs.get('participant_ids', [])
            if len(ids) != 1:
                raise serializers.ValidationError({'recipientId': 'Provide one recipientId for a direct conversation.'})
            attrs['recipient_id'] = ids[0]
        if kind == 'GROUP':
            if not attrs.get('title', '').strip():
                raise serializers.ValidationError({'title': 'A group title is required.'})
            if not attrs.get('participant_ids'):
                raise serializers.ValidationError({'participantIds': 'Add at least one other participant.'})
        return attrs


class AddParticipantsSerializer(serializers.Serializer):
    participantIds = serializers.ListField(source='participant_ids', child=serializers.IntegerField(min_value=1), min_length=1, max_length=99)


def serialize_conversations(request, conversations):
    """Serialize direct and group conversations with bounded query count."""
    me = request.user
    ids = [c.id for c in conversations]
    participant_rows = (
    ConversationParticipant.objects
    .filter(conversation_id__in=ids, left_at__isnull=True)
    .select_related('user')
    .order_by('conversation_id', 'joined_at')
)
    participants_by_conversation = {}
    for participant in participant_rows:
        participants_by_conversation.setdefault(participant.conversation_id, []).append(participant.user)
    unread = services.unread_counts(me, ids)
    out = []
    for c in conversations:
        users = participants_by_conversation.get(c.id, [])
        others = [u for u in users if u.id != me.id]
        last = c.last_message
        out.append({
            'id': c.id,
            'type': c.conversation_type,
            'title': c.title or None,
            'createdBy': c.created_by_id,
            'participants': UserBriefSerializer(users, many=True, context={'request': request}).data,
            'otherUser': UserBriefSerializer(others[0], context={'request': request}).data
                if c.conversation_type == Conversation.Type.DIRECT and others else None,
            'lastMessage': ({'id': last.id, 'body': last.body, 'sender': last.sender_id, 'status': Message.Status(last.status).name.lower(), 'createdAt': last.created_at} if last else None),
            'unreadCount': unread.get(c.id, 0),
            'updatedAt': c.last_message_at or c.created_at,
        })
    return out
