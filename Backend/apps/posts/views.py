# apps/posts/views.py

from pathlib import Path
from uuid import uuid4

from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import (
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.queries import get_feed_queryset

from .models import Post, PostLike, PostComment
from .serializers import PostSerializer, PostCommentSerializer
from .services import like_post, unlike_post


def post_feed_queryset(user=None):
    return get_feed_queryset(user)


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = post_feed_queryset(self.request.user)

        author = self.request.query_params.get("author")
        content_type = self.request.query_params.get("type")

        if author:
            queryset = queryset.filter(
                author__username__iexact=author
            )

        if content_type:
            if content_type not in Post.ContentType.values:
                return queryset.none()

            queryset = queryset.filter(
                content_type=content_type
            )

        return queryset.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post = serializer.save(author=request.user)
        post = post_feed_queryset(request.user).get(pk=post.pk)

        response_serializer = self.get_serializer(post)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class PostMediaUploadView(APIView):
    """
    Upload an image or video and return its URL.

    POST /api/posts/upload-media/
    multipart/form-data:
        file: the image/video file
        media_type: image or video
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v"}
    IMAGE_TYPES = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    }
    VIDEO_TYPES = {
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-m4v",
    }

    IMAGE_MAX_BYTES = 5 * 1024 * 1024
    VIDEO_MAX_BYTES = 100 * 1024 * 1024

    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get("file")
        media_type = request.data.get("media_type", "").lower()

        if media_type not in {"image", "video"}:
            return Response(
                {"media_type": "Use 'image' or 'video'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not uploaded_file:
            return Response(
                {"file": "Select a file to upload."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        extension = Path(uploaded_file.name).suffix.lower()
        content_type = getattr(uploaded_file, "content_type", "")

        if media_type == "image":
            allowed_extensions = self.IMAGE_EXTENSIONS
            allowed_types = self.IMAGE_TYPES
            max_bytes = self.IMAGE_MAX_BYTES
        else:
            allowed_extensions = self.VIDEO_EXTENSIONS
            allowed_types = self.VIDEO_TYPES
            max_bytes = self.VIDEO_MAX_BYTES

        if extension not in allowed_extensions or content_type not in allowed_types:
            return Response(
                {
                    "file": (
                        "Unsupported image format."
                        if media_type == "image"
                        else "Unsupported video format."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if uploaded_file.size > max_bytes:
            limit_mb = max_bytes // (1024 * 1024)
            return Response(
                {"file": f"File must not exceed {limit_mb} MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        storage_path = (
            f"posts/{media_type}s/{uuid4().hex}{extension}"
        )

        try:
            saved_path = default_storage.save(
                storage_path,
                uploaded_file,
            )
            media_url = default_storage.url(saved_path)

            if media_url.startswith("/"):
                media_url = request.build_absolute_uri(media_url)

        except Exception:
            return Response(
                {"detail": "The media file could not be stored."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "media_type": media_type,
                "media_url": media_url,
                "filename": Path(saved_path).name,
            },
            status=status.HTTP_201_CREATED,
        )


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return post_feed_queryset(self.request.user)

    def get_object(self):
        post = get_object_or_404(
            Post.objects.select_related("author"),
            pk=self.kwargs["pk"],
            is_published=True,
        )

        if self.request.method in ("PUT", "PATCH", "DELETE"):
            if not self.request.user.is_authenticated:
                raise NotAuthenticated()

            if post.author_id != self.request.user.id:
                raise PermissionDenied(
                    "You can modify only your own posts."
                )

        return post


class PostLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(
            Post,
            pk=post_id,
            is_published=True,
        )

        result = like_post(post=post, user=request.user)

        return Response({
            "post_id": post.pk,
            **result,
        })

    def delete(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)

        result = unlike_post(post=post, user=request.user)

        return Response({
            "post_id": post.pk,
            **result,
        })


class PostCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = PostCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return (
            PostComment.objects
            .filter(
                post_id=self.kwargs["post_id"],
                post__is_published=True,
            )
            .select_related("author")
            .order_by("created_at")
        )

    def perform_create(self, serializer):
        post = get_object_or_404(
            Post,
            pk=self.kwargs["post_id"],
            is_published=True,
        )

        serializer.save(
            author=self.request.user,
            post=post,
        )


class PostCommentDeleteView(generics.DestroyAPIView):
    serializer_class = PostCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PostComment.objects.filter(
            author=self.request.user,
            post__is_published=True,
        )