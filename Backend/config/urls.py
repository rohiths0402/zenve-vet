from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    # Posts APIs
    path("api/", include("posts.urls")),

    # Advertise APIs
    path("api/advertise/", include("advertise.urls")),

    # Member Benefits APIs
    path("api/member-benefits/", include("member_benefits.urls")),
]