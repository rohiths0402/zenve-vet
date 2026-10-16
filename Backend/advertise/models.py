
import secrets

from django.db import models


class Advertiser(models.Model):

    brand_name = models.CharField(
        max_length=200
    )

    contact_email = models.EmailField()

    website = models.URLField(
        blank=True,
        default=""
    )

    access_key = models.CharField(
        max_length=64,
        unique=True,
        editable=False,
        blank=True,
        default=""
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

        # Generate a unique access key for new advertisers.
        if not self.access_key:

            while True:

                key = (
                    f"ZENVE-ADV-{secrets.token_urlsafe(24)}"
                )

                # Ensure the key is not already in the database.
                if not Advertiser.objects.filter(
                    access_key=key
                ).exists():

                    self.access_key = key
                    break

        super().save(*args, **kwargs)

    def __str__(self):
        return self.brand_name

    class Meta:
        ordering = ["-created_at"]