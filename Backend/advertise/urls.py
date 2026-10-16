
from django.urls import path

from .views import (
    create_advertiser,
    validate_access_key,
    advertiser_dashboard,
)

urlpatterns = [
    path(
        "accounts/",
        create_advertiser,
        name="create-advertiser",
    ),

    path(
        "validate-key/",
        validate_access_key,
        name="validate-access-key",
    ),

    path(
        "dashboard/",
        advertiser_dashboard,
        name="advertiser-dashboard",
    ),
]
