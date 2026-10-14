from rest_framework import permissions

class IsConnectionParticipant(permissions.BasePermission):
    """
    Custom permission to ensure only the sender or receiver can view or modify the connection.
    """
    def has_object_permission(self, request, view, obj):
        return request.user in [obj.sender, obj.receiver]

class IsReceiverOnly(permissions.BasePermission):
    """
    Only the recipient can accept or reject a connection request.
    """
    def has_object_permission(self, request, view, obj):
        return obj.receiver == request.user