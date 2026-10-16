from django.urls import path

from .views import (
    BenefitListCreateAPIView,
    BenefitDetailAPIView,
    ProfessionalProfileAPIView,
)

app_name = "member_benefits"

urlpatterns = [
    # List and create benefits
    path(
        "",
        BenefitListCreateAPIView.as_view(),
        name="benefit-list-create",
    ),

    # Retrieve, update, or delete a benefit
    path(
        "<int:pk>/",
        BenefitDetailAPIView.as_view(),
        name="benefit-detail",
    ),

    # Retrieve or update a professional profile
    path(
        "profile/",
        ProfessionalProfileAPIView.as_view(),
        name="professional-profile",
    ),
]