import os
import uuid

from datetime import timedelta

from django.core.files.storage import default_storage
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Story
from .serializers import StorySerializer


class StoryListCreateView(generics.ListCreateAPIView):
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return (
            Story.objects.filter(
                is_active=True,
                expires_at__gt=timezone.now(),
            )
            .select_related("author")
            .order_by("-created_at")
        )

    def create(self, request, *args, **kwargs):
        image = request.FILES.get("image")
        caption = request.data.get("caption", "").strip()

        if image is None:
            raise ValidationError({
                "image": "Select an image for your story."
            })

        if image.size > 5 * 1024 * 1024:
            raise ValidationError({
                "image": "Story images must be 5 MB or smaller."
            })

        extension = os.path.splitext(image.name)[1].lower()
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

        if extension not in allowed_extensions:
            raise ValidationError({
                "image": "Use JPG, JPEG, PNG, WEBP, or GIF."
            })

        if (
            not image.content_type
            or not image.content_type.startswith("image/")
        ):
            raise ValidationError({
                "image": "Please upload a valid image."
            })

        saved_path = default_storage.save(
            f"stories/{uuid.uuid4().hex}{extension}",
            image,
        )

        media_url = request.build_absolute_uri(
            default_storage.url(saved_path)
        )

        story = Story.objects.create(
            author=request.user,
            media_url=media_url,
            caption=caption,
            expires_at=timezone.now() + timedelta(hours=24),
        )

        serializer = self.get_serializer(story)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class MyStoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stories = Story.objects.filter(
            author=request.user,
            is_active=True,
            expires_at__gt=timezone.now(),
        ).order_by("-created_at")

        return Response(
            StorySerializer(
                stories,
                many=True,
                context={"request": request},
            ).data
        )