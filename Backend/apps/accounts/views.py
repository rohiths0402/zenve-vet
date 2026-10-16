
import os
import uuid

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage

from rest_framework import generics, status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .bloom import get_username_filter
from .serializers import (
    DoctorProfileSerializer,
    LoginSerializer,
    RegistrationSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        profile = user.doctor_profile

        return Response(
            {
                "message": "Registration successful.",
                "user": {
                    "id": user.pk,
                    "email": user.email,
                    "username": user.username,
                    "fullName": " ".join(
                        part
                        for part in [user.first_name, user.last_name]
                        if part
                    ),
                    "city": profile.city,
                    "state": profile.state,
                    "specialty": profile.specialty,
                    "bio": profile.bio,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer


class UsernameAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        username = request.query_params.get("username", "").strip()

        if not username:
            return Response(
                {
                    "error": "The username query parameter is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(username) > 150:
            return Response(
                {
                    "username": username,
                    "available": False,
                    "reason": "Username is too long.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        bloom = get_username_filter()

        # A Bloom-filter positive may be a false positive.
        # Confirm it against the database before reporting unavailable.
        if bloom.might_contain(username):
            exists = User.objects.filter(
                username__iexact=username
            ).exists()
        else:
            exists = False

        return Response(
            {
                "username": username,
                "available": not exists,
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, "doctor_profile", None)

        return Response(
            {
                "user": {
                    "id": user.pk,
                    "email": user.email,
                    "username": user.username,
                    "fullName": " ".join(
                        part
                        for part in [user.first_name, user.last_name]
                        if part
                    ),
                    "city": profile.city if profile else "",
                    "state": profile.state if profile else "",
                    "specialty": profile.specialty if profile else "",
                    "bio": profile.bio if profile else "",
                }
            }
        )


class PublicDoctorProfileView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = User.objects.filter(
            username__iexact=username,
            is_active=True,
        ).first()

        if user is None:
            raise NotFound("Doctor profile not found.")

        profile = getattr(user, "doctor_profile", None)

        if profile is None:
            raise NotFound("Doctor profile not found.")

        return Response(
            {
                "user": {
                    "id": user.pk,
                    "username": user.username,
                    "fullName": " ".join(
                        part
                        for part in [user.first_name, user.last_name]
                        if part
                    ) or user.username,
                    "city": profile.city,
                    "state": profile.state,
                    "specialty": profile.specialty,
                    "bio": profile.bio,
                },
                "content_endpoints": {
                    "posts": (
                        f"/api/posts/?author={user.username}&type=post"
                    ),
                    "cases": (
                        f"/api/posts/?author={user.username}&type=case"
                    ),
                    "videos": (
                        f"/api/posts/?author={user.username}&type=video"
                    ),
                },
            }
        )


class MyDoctorProfileView(RetrieveUpdateAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    http_method_names = ["get", "put", "patch", "head", "options"]

    MAX_IMAGE_SIZE = 5 * 1024 * 1024
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

    def get_object(self):
        profile = getattr(
            self.request.user,
            "doctor_profile",
            None,
        )

        if profile is None:
            raise NotFound("Doctor profile not found.")

        return profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        profile = self.get_object()

        data = request.data.copy()

        profile_file = request.FILES.get("profile_photo_file")
        banner_file = request.FILES.get("banner_image_file")

        # These upload keys are handled separately from the serializer.
        data.pop("profile_photo_file", None)
        data.pop("banner_image_file", None)

        uploads = [
            (
                "profile_photo_url",
                profile_file,
                "profile_photos",
            ),
            (
                "banner_image_url",
                banner_file,
                "profile_banners",
            ),
        ]

        # Validate all selected files before updating the profile.
        for field_name, uploaded_file, _folder in uploads:
            if uploaded_file is None:
                continue

            if uploaded_file.size > self.MAX_IMAGE_SIZE:
                raise ValidationError(
                    {
                        field_name:
                            "Image must be 5 MB or smaller."
                    }
                )

            extension = os.path.splitext(
                uploaded_file.name
            )[1].lower()

            if extension not in self.ALLOWED_EXTENSIONS:
                raise ValidationError(
                    {
                        field_name:
                            "Use JPG, JPEG, PNG, WEBP, or GIF."
                    }
                )

            if (
                not uploaded_file.content_type
                or not uploaded_file.content_type.startswith("image/")
            ):
                raise ValidationError(
                    {
                        field_name:
                            "Please upload an image file."
                    }
                )

        # Update ordinary profile fields using the existing serializer.
        serializer = self.get_serializer(
            profile,
            data=data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Store uploaded files and save their URLs in existing DB fields.
        saved_fields = []

        for field_name, uploaded_file, folder in uploads:
            if uploaded_file is None:
                continue

            extension = os.path.splitext(
                uploaded_file.name
            )[1].lower()

            filename = f"{uuid.uuid4().hex}{extension}"
            storage_path = f"{folder}/{filename}"

            saved_path = default_storage.save(
                storage_path,
                uploaded_file,
            )

            image_url = request.build_absolute_uri(
                default_storage.url(saved_path)
            )

            setattr(profile, field_name, image_url)
            saved_fields.append(field_name)

        if saved_fields:
            profile.save(
                update_fields=saved_fields + ["updated_at"]
            )

        return Response(
            self.get_serializer(profile).data,
            status=status.HTTP_200_OK,
        )
