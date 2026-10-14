from django.apps import apps
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import status, views, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .filters import VetNetworkFilter
from .models import Connection, ConnectionStatus
from .permissions import IsConnectionParticipant, IsReceiverOnly
from .serializers import ConnectionDetailSerializer, VetCardSerializer

User = get_user_model()

class VetNetworkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Returns list and profile detail of veterinarians for the Vet Network directory.
    Supports filtering by search query, specialty, state, and city.
    """
    serializer_class = VetCardSerializer
    permission_classes = [AllowAny]
    filterset_class = VetNetworkFilter

    def get_queryset(self):
        qs = User.objects.all().select_related('profile') if hasattr(User, 'profile') else User.objects.all()
        # Exclude active user from seeing themselves in peer suggestions
        if self.request.user.is_authenticated:
            qs = qs.exclude(id=self.request.user.id)
        return qs.order_by('first_name', 'username')


class ConnectionViewSet(viewsets.ModelViewSet):
    """
    Handles sending, accepting, rejecting, and canceling connection requests.
    """
    serializer_class = ConnectionDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Connection.objects.filter(Q(sender=user) | Q(receiver=user))

    def create(self, request, *args, **kwargs):
        """Send a connection request: POST /api/connections/ with {'target_user_id': <id>}"""
        receiver_id = request.data.get('target_user_id')
        if not receiver_id:
            return Response({'error': 'target_user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if str(receiver_id) == str(request.user.id):
            return Response({'error': 'You cannot connect with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({'error': 'Target doctor not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check existing connection
        existing = Connection.objects.filter(
            (Q(sender=request.user, receiver=receiver) | Q(sender=receiver, receiver=request.user))
        ).first()

        if existing:
            if existing.status == ConnectionStatus.ACCEPTED:
                return Response({'detail': 'Already connected.'}, status=status.HTTP_200_OK)
            if existing.status == ConnectionStatus.PENDING:
                return Response({'detail': 'A connection request is already pending.'}, status=status.HTTP_200_OK)
            existing.status = ConnectionStatus.PENDING
            existing.sender = request.user
            existing.receiver = receiver
            existing.save()
            return Response(ConnectionDetailSerializer(existing, context={'request': request}).data)

        connection = Connection.objects.create(sender=request.user, receiver=receiver)
        return Response(
            ConnectionDetailSerializer(connection, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsReceiverOnly])
    def accept(self, request, pk=None):
        conn = self.get_object()
        conn.status = ConnectionStatus.ACCEPTED
        conn.save()
        return Response({'detail': 'Connection request accepted.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsReceiverOnly])
    def reject(self, request, pk=None):
        conn = self.get_object()
        conn.status = ConnectionStatus.REJECTED
        conn.save()
        return Response({'detail': 'Connection request rejected.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsConnectionParticipant])
    def cancel_or_remove(self, request, pk=None):
        conn = self.get_object()
        conn.delete()
        return Response({'detail': 'Connection removed successfully.'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        pending_requests = Connection.objects.filter(
            receiver=request.user,
            status=ConnectionStatus.PENDING
        )
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)


class GlobalSearchView(views.APIView):
    """
    Search endpoint across Doctors, Clinical Cases, and Posts.
    GET /api/search/?q=<query>&type=<all|doctors|cases>&specialty=<specialty>&state=<state>
    """
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        search_type = request.query_params.get('type', 'all').lower()
        specialty = request.query_params.get('specialty', '')
        state = request.query_params.get('state', '')

        response_data = {
            'doctors': [],
            'cases': [],
            'total_results': 0
        }

        # 1. Search Doctors
        if search_type in ['all', 'doctors', 'people']:
            doctor_qs = User.objects.all()
            if query:
                doctor_qs = doctor_qs.filter(
                    Q(first_name__icontains=query) |
                    Q(last_name__icontains=query) |
                    Q(username__icontains=query) |
                    Q(profile__specialty__icontains=query) |
                    Q(profile__city__icontains=query)
                )
            if specialty and specialty.lower() not in ['all', 'all specialties']:
                doctor_qs = doctor_qs.filter(profile__specialty__iexact=specialty)
            if state and state.lower() not in ['all', 'all states']:
                doctor_qs = doctor_qs.filter(profile__state__iexact=state)

            doctor_serializer = VetCardSerializer(
                doctor_qs.distinct()[:20],
                many=True,
                context={'request': request}
            )
            response_data['doctors'] = doctor_serializer.data

        # 2. Search Clinical Cases / Posts (Graceful fallback if 'posts' app is still in progress)
        if search_type in ['all', 'cases', 'posts', 'stories']:
            PostModel = None
            try:
                PostModel = apps.get_model('posts', 'Post')
            except LookupError:
                try:
                    PostModel = apps.get_model('posts', 'ClinicalCase')
                except LookupError:
                    pass

            if PostModel:
                posts_qs = PostModel.objects.all()
                if query:
                    posts_qs = posts_qs.filter(
                        Q(title__icontains=query) |
                        Q(content__icontains=query) |
                        Q(description__icontains=query)
                    )
                response_data['cases'] = list(posts_qs.values('id', 'title', 'created_at')[:10])

        response_data['total_results'] = len(response_data['doctors']) + len(response_data['cases'])
        return Response(response_data, status=status.HTTP_200_OK)