
from django.contrib.auth import get_user_model
from django.db.models import Count, Exists, OuterRef
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post, PostLike, PostComment
from .serializers import PostSerializer, PostCommentSerializer
from .services import create_post, like_post, unlike_post


User = get_user_model()


def post_feed_queryset(user=None):
    queryset = (
        Post.objects.filter(is_published=True)
        .select_related("author")
        .annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", distinct=True),
            shares_count=Count("shares", distinct=True),
        )
    )

    if user and user.is_authenticated:
        queryset = queryset.annotate(
            is_liked_by_user=Exists(
                PostLike.objects.filter(
                    post_id=OuterRef("pk"),
                    user_id=user.pk,
                )
            )
        )

    return queryset



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

        return queryset

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
                from rest_framework.exceptions import NotAuthenticated
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

        result = like_post(
            post=post,
            user=request.user,
        )

        return Response({
            "post_id": post.pk,
            **result,
        })

    def delete(self, request, post_id):
        post = get_object_or_404(
            Post,
            pk=post_id,
        )

        result = unlike_post(
            post=post,
            user=request.user,
        )

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
