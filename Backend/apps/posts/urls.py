
from django.urls import path

from .views import (
    PostListCreateView,
    PostDetailView,
    PostLikeView,
    PostCommentListCreateView,
    PostCommentDeleteView,
)


urlpatterns = [
    path(
        "",
        PostListCreateView.as_view(),
        name="post-list-create",
    ),
    path(
        "<int:pk>/",
        PostDetailView.as_view(),
        name="post-detail",
    ),
    path(
        "<int:post_id>/like/",
        PostLikeView.as_view(),
        name="post-like",
    ),
    path(
        "<int:post_id>/comments/",
        PostCommentListCreateView.as_view(),
        name="post-comments",
    ),
    path(
        "comments/<int:pk>/",
        PostCommentDeleteView.as_view(),
        name="post-comment-delete",
    ),
]
