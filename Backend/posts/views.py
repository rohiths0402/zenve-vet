from django.db.models import Count
from rest_framework import viewsets, permissions

from .models import Post
from .serializers import PostSerializer
from .pagination import FeedPagination


class PostViewSet(viewsets.ModelViewSet):

    serializer_class = PostSerializer

    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly
    ]

    pagination_class = FeedPagination

    search_fields = [
        "content",
        "diagnosis",
        "treatment",
    ]

    ordering_fields = [
        "created_at",
    ]

    def get_queryset(self):
        queryset = Post.objects.select_related(
            "author"
        ).annotate(
            likes_count=Count("likes", distinct=True),
            comments_count=Count("comments", distinct=True),
        )

        post_type = self.request.query_params.get("post_type")

        if post_type:
            queryset = queryset.filter(post_type=post_type)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)