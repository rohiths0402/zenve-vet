from django.urls import path

from .views import MyStoriesView, StoryListCreateView

urlpatterns = [
    path("", StoryListCreateView.as_view(), name="story-list-create"),
    path("mine/", MyStoriesView.as_view(), name="my-stories"),
]