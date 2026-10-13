from django.db.models import F
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.common.pagination import DefaultPagePagination
from . import services
from .models import Conversation, ConversationParticipant
from .realtime import push_to_user
from .serializers import (AddParticipantsSerializer, ConversationCreateSerializer, MessageCreateSerializer, MessageSerializer, serialize_conversations)


def _int_param(request, name, default=None, maximum=None):
    raw = request.query_params.get(name)
    if raw in (None, ''):
        return default
    try:
        value = int(raw)
    except (TypeError, ValueError):
        raise ValidationError({name: ['Must be a whole number.']})
    if value < 1:
        raise ValidationError({name: ['Must be 1 or more.']})
    return min(value, maximum) if maximum else value


class ConversationListCreateView(APIView):
    def get(self, request):
        qs = (Conversation.objects.filter(participants__user=request.user, participants__left_at__isnull=True).select_related('last_message', 'created_by').distinct().order_by(F('last_message_at').desc(nulls_last=True), '-id'))
        paginator = DefaultPagePagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(serialize_conversations(request, page))

    def post(self, request):
        serializer = ConversationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if data['type'] == 'DIRECT':
            conversation, created = services.get_or_create_direct(request.user, data['recipient_id'])
        else:
            conversation = services.create_group(request.user, data['title'], data['participant_ids'])
            created = True
        response = serialize_conversations(request, [conversation])[0]
        return Response(response, status=201 if created else 200)


class MessageListCreateView(APIView):
    def get(self, request, pk):
        conversation = services.get_member_conversation(request.user, pk)
        limit = _int_param(request, 'limit', default=30, maximum=100)
        after = _int_param(request, 'after')
        before = _int_param(request, 'before')
        membership = ConversationParticipant.objects.get( conversation=conversation, user=request.user, left_at__isnull=True)
        qs = conversation.messages.filter(created_at__gte=membership.joined_at).prefetch_related('receipts')
        if after:
            rows = list(qs.filter(id__gt=after).order_by('id')[:limit + 1])
            has_more = len(rows) > limit
            rows = rows[:limit]
        else:
            if before:
                qs = qs.filter(id__lt=before)
            rows = list(qs.order_by('-id')[:limit + 1])
            has_more = len(rows) > limit
            rows = rows[:limit][::-1]
        if rows:
            changed = services.mark_delivered(request.user, conversation, up_to_id=rows[-1].id)
            if changed:
                for recipient_id in services.participant_user_ids(conversation, request.user.id):
                    push_to_user(recipient_id, {'type': 'message.status', 'status': 'delivered', 'conversationId': conversation.id, 'recipientId': request.user.id, 'upToId': changed})
        return Response({'results': MessageSerializer(rows, many=True).data, 'hasMore': has_more,'nextBefore': rows[0].id if (rows and has_more and not after) else None, 'nextAfter': rows[-1].id if (rows and has_more and after) else None})

    def post(self, request, pk):
        conversation = services.get_member_conversation(request.user, pk)
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message, created = services.send_message(
            conversation, request.user, serializer.validated_data['body'],
            serializer.validated_data['client_msg_id'])
        data = MessageSerializer(message).data
        return Response(data, status=201 if created else 200)


class ConversationReadView(APIView):
    def post(self, request, pk):
        conversation = services.get_member_conversation(request.user, pk)
        up_to_id = request.data.get('upToId') or services.latest_message_id(conversation)
        try:
            up_to_id = int(up_to_id)
        except (TypeError, ValueError):
            raise ValidationError({'upToId': ['Must be a whole number.']})
        if up_to_id and not conversation.messages.filter(pk=up_to_id).exists():
            raise ValidationError({'upToId': ['Message must belong to this conversation.']})
        changed = services.mark_seen(request.user, conversation, up_to_id)
        if changed:
            for recipient_id in services.participant_user_ids(conversation, request.user.id):
                push_to_user(recipient_id, {'type': 'message.status', 'status': 'seen', 'conversationId': conversation.id, 'upToId': changed, 'readerId': request.user.id})
        return Response({'updated': bool(changed), 'unread': services.total_unread(request.user)})


class UnreadCountView(APIView):
    def get(self, request):
        return Response({'unread': services.total_unread(request.user)})


class GroupParticipantsView(APIView):
    def post(self, request, pk):
        conversation = services.get_member_conversation(request.user, pk)
        serializer = AddParticipantsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        users = services.add_group_participants(request.user, conversation, serializer.validated_data['participant_ids'])
        for user in users:
            push_to_user(user.id, {'type': 'conversation.updated', 'conversationId': conversation.id, 'action': 'added'})
        return Response({'conversationId': conversation.id, 'addedUserIds': [u.id for u in users]}, status=200)

    def delete(self, request, pk, user_id):
        conversation = services.get_member_conversation(request.user, pk)
        target = services.remove_group_participant(request.user, conversation, user_id)
        push_to_user(target.user_id, {'type': 'conversation.updated', 'conversationId': conversation.id,'action': 'removed'})
        return Response(status=204)
