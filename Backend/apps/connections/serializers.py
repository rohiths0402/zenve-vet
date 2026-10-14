from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Connection, ConnectionStatus

User = get_user_model()

class VetCardSerializer(serializers.ModelSerializer):
    """
    Serializer tailored for the Vet Network grid cards.
    """
    name = serializers.SerializerMethodField()
    specialty = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    connection_status = serializers.SerializerMethodField()
    connection_id = serializers.SerializerMethodField()
    connections_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'name',
            'specialty',
            'location',
            'avatar',
            'connection_status',
            'connection_id',
            'connections_count'
        ]

    def get_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        if full_name:
            return f"Dr. {full_name}" if not full_name.startswith("Dr.") else full_name
        return f"Dr. {obj.username}"

    def get_specialty(self, obj):
        profile = getattr(obj, 'profile', None)
        return getattr(profile, 'specialty', 'Veterinary Practitioner') if profile else 'Veterinary Practitioner'

    def get_location(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile:
            city = getattr(profile, 'city', '')
            state = getattr(profile, 'state', '')
            return f"{city}, {state}".strip(", ")
        return "India"

    def get_avatar(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile and hasattr(profile, 'avatar') and profile.avatar:
            try:
                return profile.avatar.url
            except ValueError:
                return None
        return None

    def get_connection_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'not_connected'
        
        current_user = request.user
        if current_user == obj:
            return 'self'

        conn = Connection.objects.filter(
            (models.Q(sender=current_user, receiver=obj) | models.Q(sender=obj, receiver=current_user))
        ).first()

        if not conn:
            return 'not_connected'
        if conn.status == ConnectionStatus.ACCEPTED:
            return 'connected'
        if conn.status == ConnectionStatus.PENDING:
            return 'pending_sent' if conn.sender == current_user else 'pending_received'
        return conn.status

    def get_connection_id(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        conn = Connection.objects.filter(
            (models.Q(sender=request.user, receiver=obj) | models.Q(sender=obj, receiver=request.user))
        ).first()
        return conn.id if conn else None

    def get_connections_count(self, obj):
        return Connection.objects.filter(
            models.Q(sender=obj) | models.Q(receiver=obj),
            status=ConnectionStatus.ACCEPTED
        ).count()


class ConnectionDetailSerializer(serializers.ModelSerializer):
    sender_detail = VetCardSerializer(source='sender', read_only=True)
    receiver_detail = VetCardSerializer(source='receiver', read_only=True)

    class Meta:
        model = Connection
        fields = ['id', 'sender', 'receiver', 'sender_detail', 'receiver_detail', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']