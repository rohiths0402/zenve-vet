
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Advertiser
from .serializers import (
    AdvertiserSerializer,
    AdvertiserAccessKeySerializer,
)


# =========================================================
# HELPER: FIND AN ACTIVE ADVERTISER USING AN ACCESS KEY
# =========================================================

def get_active_advertiser(access_key):

    return Advertiser.objects.filter(
        access_key=access_key,
        is_active=True,
    ).first()


# =========================================================
# CREATE ADVERTISER / LIST ADVERTISERS
# GET  /api/advertise/accounts/
# POST /api/advertise/accounts/
# =========================================================

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def create_advertiser(request):

    # GET: Retrieve all advertiser accounts
    if request.method == "GET":

        advertisers = Advertiser.objects.all()

        serializer = AdvertiserSerializer(
            advertisers,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # POST: Create a new advertiser account
    serializer = AdvertiserSerializer(
        data=request.data
    )

    serializer.is_valid(raise_exception=True)

    # Save the advertiser.
    # The Advertiser model should generate the access key
    # automatically inside its save() method.
    advertiser = serializer.save()

    # Refresh the saved object from the database.
    advertiser.refresh_from_db()

    return Response(
        {
            "message": "Advertiser account created successfully.",
            "advertiser": AdvertiserSerializer(
                advertiser
            ).data,
        },
        status=status.HTTP_201_CREATED
    )


# =========================================================
# VALIDATE ADVERTISER ACCESS KEY
# POST /api/advertise/validate-key/
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def validate_access_key(request):

    serializer = AdvertiserAccessKeySerializer(
        data=request.data
    )

    serializer.is_valid(raise_exception=True)

    access_key = serializer.validated_data["access_key"]

    # Find an advertiser with this key who is active.
    advertiser = get_active_advertiser(access_key)

    if advertiser is None:

        return Response(
            {
                "success": False,
                "detail": (
                    "Invalid access key or inactive advertiser."
                ),
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response(
        {
            "success": True,
            "message": "Access key validated successfully.",
            "advertiser": AdvertiserSerializer(
                advertiser
            ).data,
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# ADVERTISER DASHBOARD
# POST /api/advertise/dashboard/
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def advertiser_dashboard(request):

    serializer = AdvertiserAccessKeySerializer(
        data=request.data
    )

    serializer.is_valid(raise_exception=True)

    access_key = serializer.validated_data["access_key"]

    advertiser = get_active_advertiser(access_key)

    if advertiser is None:

        return Response(
            {
                "success": False,
                "detail": (
                    "Invalid access key or inactive advertiser."
                ),
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Return the authenticated advertiser's information.
    return Response(
        {
            "success": True,
            "message": "Dashboard data retrieved successfully.",
            "advertiser": AdvertiserSerializer(
                advertiser
            ).data,
        },
        status=status.HTTP_200_OK
    )

