from django.urls import path

from .views import (NotificationListView, NotificationReadAllView, NotificationReadView,
                    NotificationUnreadCountView)

urlpatterns = [
    path('notifications/', NotificationListView.as_view()),
    path('notifications/read-all/', NotificationReadAllView.as_view()),
    path('notifications/unread-count/', NotificationUnreadCountView.as_view()),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view()),
]
