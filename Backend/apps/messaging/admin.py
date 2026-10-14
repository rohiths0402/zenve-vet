from django.contrib import admin

from .models import Conversation, ConversationParticipant, Message, MessageReceipt, OutboxEvent

admin.site.register(Conversation)
admin.site.register(ConversationParticipant)
admin.site.register(Message)
admin.site.register(MessageReceipt)


@admin.register(OutboxEvent)
class OutboxEventAdmin(admin.ModelAdmin):
    list_display = ('event_id', 'event_type', 'status', 'attempts', 'created_at', 'processed_at')
    list_filter = ('status', 'event_type')
    search_fields = ('event_id', 'last_error')
    readonly_fields = ('event_id', 'event_type', 'payload', 'status', 'attempts', 'next_attempt_at', 'locked_until', 'processed_at', 'last_error', 'created_at')
