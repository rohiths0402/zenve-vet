from django.urls import path

from .views import (ConversationListCreateView, ConversationReadView, GroupParticipantsView, MessageListCreateView, UnreadCountView)

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view()),
    path('conversations/<int:pk>/messages/', MessageListCreateView.as_view()),
    path('conversations/<int:pk>/read/', ConversationReadView.as_view()),
    path('conversations/<int:pk>/participants/', GroupParticipantsView.as_view()),
    path('conversations/<int:pk>/participants/<int:user_id>/', GroupParticipantsView.as_view()),
    path('messages/unread-count/', UnreadCountView.as_view()),
]
