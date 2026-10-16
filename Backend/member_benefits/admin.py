from django.contrib import admin
from .models import Benefit


@admin.register(Benefit)
class BenefitAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "is_active",
        "created_at",
    )

    list_filter = (
        "category",
        "is_active",
    )

    search_fields = (
        "title",
        "description",
    )

    prepopulated_fields = {
        "slug": ("title",),
    }