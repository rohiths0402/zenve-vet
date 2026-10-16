
from django.conf import settings
from django.db import models


class DoctorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="doctor_profile",
    )
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    specialty = models.CharField(max_length=150)
    bio = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounts_doctor_profile"

    def __str__(self):
        return f"Profile: {self.user.username}"
    
    profile_photo_url = models.URLField(
        max_length=1000,
        blank=True,
        default="",
    )
    banner_image_url = models.URLField(
        max_length=1000,
        blank=True,
        default="",
    )
    website = models.URLField(
        max_length=500,
        blank=True,
        default="",
    )
    gallery = models.JSONField(
        default=list,
        blank=True,
    )
    is_verified = models.BooleanField(default=False)
    phone_alerts_enabled = models.BooleanField(default=True)



class Clinic(models.Model):
    profile = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name="clinics",
    )
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300, blank=True, default="")
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    phone = models.CharField(max_length=30, blank=True, default="")
    website = models.URLField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

