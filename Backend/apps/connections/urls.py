
from django.urls import path

from .views import (
    DoctorDirectoryView,
    ConnectionRequestListCreateView,
    ConnectionRequestActionView,
    AcceptedConnectionsView,
)

urlpatterns = [
    path("doctors/", DoctorDirectoryView.as_view(), name="doctor-directory"),
    path(
    "requests/",
    ConnectionRequestListCreateView.as_view(),
    name="connection-requests",
),
path(
    "requests/<int:pk>/action/",
    ConnectionRequestActionView.as_view(),
    name="connection-request-action",
),
path(
    "accepted/",
    AcceptedConnectionsView.as_view(),
    name="accepted-connections",
),
]
