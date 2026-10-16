from django.conf import settings
from django.db import models


class Benefit(models.Model):
    CATEGORY_CHOICES = [
        ("scholarship", "Scholarship"),
        ("mentorship", "Mentorship"),
        ("research", "Research"),
        ("professional_development", "Professional Development"),
        ("community", "Community"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField()

    category = models.CharField(
        max_length=40,
        choices=CATEGORY_CHOICES,
    )

    eligibility = models.TextField(blank=True)
    application_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class ProfessionalProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="professional_profile",
    )

    full_name = models.CharField(max_length=150)
    professional_title = models.CharField(max_length=150)
    specialization = models.CharField(max_length=150, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    website = models.URLField(blank=True)
    is_public = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name