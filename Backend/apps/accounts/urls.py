
from django.urls import path
from .clinicViews import MyClinicListCreateView, MyClinicDetailView
from .views import (
    LoginView,
    RegisterView,
    UsernameAvailabilityView,
    CurrentUserView,
    PublicDoctorProfileView,
    MyDoctorProfileView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path(
        "usernameAvailability/",
        UsernameAvailabilityView.as_view(),
        name="username availability",
    ),
    path("me/", CurrentUserView.as_view(), name="current user"),
    path(
        "doctors/<str:username>/",
        PublicDoctorProfileView.as_view(),
        name="public doctor profile",
    ),
    path(
    "profile/",
    MyDoctorProfileView.as_view(),
    name="my doctor profile",
    ),
    path(
        "clinics/",
        MyClinicListCreateView.as_view(),
        name="my clinics",
    ),
    path(
        "clinics/<int:pk>/",
        MyClinicDetailView.as_view(),
        name="my clinic",
    ),
]
