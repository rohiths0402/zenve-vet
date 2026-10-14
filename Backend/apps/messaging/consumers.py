import asyncio
import time
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from . import services
from .models import Conversation, ConversationParticipant
from .realtime import user_group


class ChatConsumer(AsyncJsonWebsocketConsumer):
    typing_timeout_seconds = 3
    auth_recheck_seconds = 20

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.typing_tasks = {}
        self.typing_conversations = set()
        self.auth_monitor_task = None

    async def connect(self):
        user = self.scope.get('user')
        expires_at = self.scope.get('zenve_token_exp')
        if user is None or user.is_anonymous or not expires_at or expires_at <= time.time():
            await self.close(code=4401)
            return
        self.user = user
        self.auth_token = self.scope.get('zenve_token')
        if not self.auth_token:
            await self.close(code=4401)
            return
        self.group = user_group(user.id)
        await self.channel_layer.group_add(self.group, self.channel_name)
        if self.scope.get('zenve_subprotocol_auth'):
            await self.accept(subprotocol='zenve')
        else:
            await self.accept()
        self.auth_monitor_task = asyncio.create_task(self._monitor_auth(int(expires_at)))
        for item in await database_sync_to_async(services.mark_all_delivered)(user):
            await self._push(item['sender_id'], {'type': 'message.status', 'status': 'delivered', 'conversationId': item['conversation_id'], 'recipientId': item['recipient_id'], 'upToId': item['up_to_id']})

    async def disconnect(self, code):
        if self.auth_monitor_task:
            self.auth_monitor_task.cancel()
        for task in self.typing_tasks.values():
            task.cancel()
        if hasattr(self, 'user'):
            for conversation_id in list(self.typing_conversations):
                await self._broadcast_typing(conversation_id, False)
        if hasattr(self, 'group'):
            await self.channel_layer.group_discard(self.group, self.channel_name)


    async def _monitor_auth(self, expires_at):
        try:
            while True:
                remaining = expires_at - time.time()
                if remaining <= 0:
                    await self.close(code=4401)
                    return
                await asyncio.sleep(min(self.auth_recheck_seconds, remaining))
                if time.time() >= expires_at or not await self._auth_is_still_valid():
                    await self.close(code=4401)
                    return
        except asyncio.CancelledError:
            return

    @database_sync_to_async
    def _auth_is_still_valid(self):
        from django.contrib.auth import get_user_model
        from rest_framework_simplejwt.tokens import AccessToken
        try:
            token = AccessToken(self.auth_token)
            if str(token['user_id']) != str(self.user.id):
                return False
            return get_user_model().objects.filter(pk=self.user.pk, is_active=True).exists()
        except Exception:
            return False

    async def receive_json(self, content, **kwargs):
        if not isinstance(content, dict):
            return
        kind = content.get('type')
        if kind == 'ping':
            await self.send_json({'type': 'pong'})
            return
        if kind not in ('typing', 'typing.start', 'typing.stop', 'delivered', 'read'):
            return
        conversation_id = content.get('conversationId')
        if not isinstance(conversation_id, int) or isinstance(conversation_id, bool):
            return
        member_ids = await self._active_member_ids(conversation_id)
        if self.user.id not in member_ids:
            return
        recipients = [uid for uid in member_ids if uid != self.user.id]
        if kind in ('typing', 'typing.start', 'typing.stop'):
            is_typing = kind != 'typing.stop' and content.get('isTyping', True) is not False
            if is_typing:
                self.typing_conversations.add(conversation_id)
                previous = self.typing_tasks.pop(conversation_id, None)
                if previous:
                    previous.cancel()
                self.typing_tasks[conversation_id] = asyncio.create_task(self._clear_typing_later(conversation_id))
            else:
                self.typing_conversations.discard(conversation_id)
                previous = self.typing_tasks.pop(conversation_id, None)
                if previous:
                    previous.cancel()
            payload = {'type': 'typing', 'conversationId': conversation_id, 'userId': self.user.id}
            if kind != 'typing' or 'isTyping' in content:
                payload['isTyping'] = is_typing
            for user_id in recipients:
                await self._push(user_id, payload)
            return
        up_to_id = content.get('upToId')
        if not isinstance(up_to_id, int) or isinstance(up_to_id, bool) or up_to_id < 1:
            return
        changed = await self._apply_status(kind, conversation_id, up_to_id)
        if changed:
            for user_id in recipients:
                await self._push(user_id, {'type': 'message.status', 'status': 'seen' if kind == 'read' else 'delivered', 'conversationId': conversation_id, 'upToId': changed, 'readerId': self.user.id if kind == 'read' else None})


    async def _clear_typing_later(self, conversation_id):
        try:
            await asyncio.sleep(self.typing_timeout_seconds)
            self.typing_tasks.pop(conversation_id, None)
            if conversation_id in self.typing_conversations:
                self.typing_conversations.discard(conversation_id)
                member_ids = await self._active_member_ids(conversation_id)
                if self.user.id in member_ids:
                    await self._broadcast_typing(conversation_id, False, member_ids)
        except asyncio.CancelledError:
            return

    async def _broadcast_typing(self, conversation_id, is_typing, member_ids=None):
        member_ids = member_ids if member_ids is not None else await self._active_member_ids(conversation_id)
        payload = {'type': 'typing', 'conversationId': conversation_id, 'userId': self.user.id, 'isTyping': is_typing}
        for user_id in member_ids:
            if user_id != self.user.id:
                await self._push(user_id, payload)

    async def chat_event(self, event):
        await self.send_json(event['payload'])

    async def _push(self, user_id, payload):
        await self.channel_layer.group_send(user_group(user_id), {'type': 'chat.event', 'payload': payload})

    @database_sync_to_async
    def _active_member_ids(self, conversation_id):
        return list(ConversationParticipant.objects.filter(
            conversation_id=conversation_id, left_at__isnull=True).values_list('user_id', flat=True))

    @database_sync_to_async
    def _apply_status(self, kind, conversation_id, up_to_id):
        conversation = Conversation.objects.filter(
            pk=conversation_id, participants__user=self.user, participants__left_at__isnull=True).first()
        if not conversation or not conversation.messages.filter(pk=up_to_id).exists():
            return None
        fn = services.mark_seen if kind == 'read' else services.mark_delivered
        return fn(self.user, conversation, up_to_id)
