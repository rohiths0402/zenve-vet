from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.pagination import DefaultPagePagination

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(ListAPIView):
    """GET /notifications/  (newest first, ?unread=1 for unread only)"""
    serializer_class = NotificationSerializer
    pagination_class = DefaultPagePagination

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user).select_related('actor__profile')
        if self.request.query_params.get('unread') in ('1', 'true'):
            qs = qs.filter(is_read=False)
        return qs


class NotificationReadView(APIView):
    """POST /notifications/<id>/read/  Only the recipient can mark it (others get 404)."""

    def post(self, request, pk):
        notification = get_object_or_404(Notification.objects.select_related('actor__profile'),
                                         pk=pk, recipient=request.user)
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notification, context={'request': request}).data)


class NotificationReadAllView(APIView):
    def post(self, request):
        updated = Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'updated': updated})


class NotificationUnreadCountView(APIView):
    def get(self, request):
        return Response({'unread': Notification.objects.filter(recipient=request.user, is_read=False).count()})
