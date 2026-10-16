from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        CONNECTION_REQUEST = 'CONNECTION_REQUEST'
        CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED'
        POST_LIKE = 'POST_LIKE'
        POST_COMMENT = 'POST_COMMENT'
        NEW_MESSAGE = 'NEW_MESSAGE'

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                              on_delete=models.CASCADE, related_name='+')
    type = models.CharField(max_length=30, choices=Type.choices)
    payload = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']
        indexes = [models.Index(fields=['recipient', 'is_read', '-id'])]
