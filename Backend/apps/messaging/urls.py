
from django.urls import path

from .views import (
    ConversationListCreateView,
    ConversationReadView,
    GroupParticipantsView,
    MessageListCreateView,
    UnreadCountView,
)

urlpatterns = [
    path(
        "conversations/",
        ConversationListCreateView.as_view(),
        name="conversation-list-create",
    ),
    path(
        "conversations/<int:pk>/messages/",
        MessageListCreateView.as_view(),
        name="conversation-messages",
    ),
    path(
        "conversations/<int:pk>/read/",
        ConversationReadView.as_view(),
        name="conversation-read",
    ),
    path(
        "conversations/<int:pk>/participants/",
        GroupParticipantsView.as_view(),
        name="conversation-participants",
    ),
    path(
        "conversations/<int:pk>/participants/<int:user_id>/",
        GroupParticipantsView.as_view(),
        name="conversation-participant-remove",
    ),
    path(
        "messages/unread-count/",
        UnreadCountView.as_view(),
        name="message-unread-count",
    ),
]
