
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, pagination, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.notifications.models import Notification
from apps.accounts.models import DoctorProfile
from .filters import DoctorDirectoryFilter
from .models import Connection
from .serializers import (
    ConnectionRequestSerializer,
    DoctorDirectorySerializer,
)

User = get_user_model()


class DoctorDirectoryPagination(pagination.PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


class DoctorDirectoryView(generics.ListAPIView):
    serializer_class = DoctorDirectorySerializer
    permission_classes = [AllowAny]
    pagination_class = DoctorDirectoryPagination
    filter_backends = [DoctorDirectoryFilter]

    def get_queryset(self):
        return (
            User.objects.filter(doctor_profile__isnull=False)
            .select_related("doctor_profile")
            .order_by("username")
        )


class ConnectionRequestListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Connection.objects.filter(
            Q(user_a=request.user) | Q(user_b=request.user)
        ).select_related("user_a", "user_b", "requested_by")

        direction = request.query_params.get("direction", "all")

        if direction == "incoming":
            queryset = queryset.filter(
                status=Connection.Status.PENDING
            ).exclude(requested_by=request.user)
        elif direction == "outgoing":
            queryset = queryset.filter(requested_by=request.user)
        elif direction != "all":
            raise ValidationError({
                "direction": "Use incoming, outgoing, or all."
            })

        return Response(
            ConnectionRequestSerializer(
                queryset,
                many=True,
                context={"request": request},
            ).data
        )

    def post(self, request):
        username = request.data.get("username")

        if not isinstance(username, str) or not username.strip():
            raise ValidationError({"username": "A username is required."})

        target = get_object_or_404(
            User.objects.filter(doctor_profile__isnull=False),
            username=username.strip(),
        )

        if target.pk == request.user.pk:
            raise ValidationError("You cannot connect with yourself.")

        user_a_id, user_b_id = sorted([request.user.pk, target.pk])

        try:
            with transaction.atomic():
                connection, created = Connection.objects.get_or_create(
                    user_a_id=user_a_id,
                    user_b_id=user_b_id,
                    defaults={
                        "requested_by": request.user,
                        "status": Connection.Status.PENDING,
                    },
                )
        except IntegrityError:
            connection = Connection.objects.get(
                user_a_id=user_a_id,
                user_b_id=user_b_id,
            )
            created = False

        if not created:
            if connection.status == Connection.Status.PENDING:
                raise ValidationError("A connection request already exists.")
            if connection.status == Connection.Status.ACCEPTED:
                raise ValidationError("You are already connected.")
            raise ValidationError(
                "A previous request exists and was rejected."
            )

        Notification.objects.create(
            recipient=target,
            actor=request.user,
            type=Notification.Type.CONNECTION_REQUEST,
            payload={"connectionId": connection.id},
        )

        return Response(
            ConnectionRequestSerializer(
                connection,
                context={"request": request},
            ).data,
            status=status.HTTP_201_CREATED,
        )


class ConnectionRequestActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        action = request.data.get("action")

        with transaction.atomic():
            connection = get_object_or_404(
                Connection.objects.select_for_update(),
                pk=pk,
                status=Connection.Status.PENDING,
            )

            if request.user.pk not in (
                connection.user_a_id,
                connection.user_b_id,
            ):
                raise PermissionDenied(
                    "You cannot manage this connection request."
                )

            is_requester = connection.requested_by_id == request.user.pk

            if action == "accept":
                if is_requester:
                    raise ValidationError(
                        "You cannot accept your own outgoing request."
                    )
                connection.status = Connection.Status.ACCEPTED

            elif action == "reject":
                if is_requester:
                    raise ValidationError(
                        "You cannot reject your own outgoing request."
                    )
                connection.status = Connection.Status.REJECTED

            elif action == "cancel":
                if not is_requester:
                    raise PermissionDenied(
                        "Only the requester can cancel this request."
                    )
                connection.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)

            else:
                raise ValidationError({
                    "action": "Use accept, reject, or cancel."
                })

            connection.save(update_fields=["status", "updated_at"])
            if action == "accept":
                Notification.objects.create(
                    recipient_id=connection.requested_by_id,
                    actor=request.user,
                    type=Notification.Type.CONNECTION_ACCEPTED,
                    payload={"connectionId": connection.id},
                )

        return Response(
            ConnectionRequestSerializer(
                connection,
                context={"request": request},
            ).data
        )


class AcceptedConnectionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Connection.objects.filter(
            Q(user_a=request.user) | Q(user_b=request.user),
            status=Connection.Status.ACCEPTED,
        ).select_related("user_a", "user_b", "requested_by")

        return Response(
            ConnectionRequestSerializer(
                queryset,
                many=True,
                context={"request": request},
            ).data
        )
