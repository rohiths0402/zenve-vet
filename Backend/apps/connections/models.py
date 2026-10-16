
from django.conf import settings
from django.db import models
from django.db.models import F, Q


class Connection(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    # Store the two users in a canonical order so that
    # A-B and B-A cannot create separate relationships.
    user_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="connections_as_a",
    )
    user_b = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="connections_as_b",
    )

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="connection_requests_sent",
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user_a", "user_b"],
                name="unique_connection_pair",
            ),
            models.CheckConstraint(
                condition=~Q(user_a=F("user_b")),
                name="connection_users_must_differ",
            ),
        ]

    def save(self, *args, **kwargs):
        if (
            self.user_a_id is not None
            and self.user_b_id is not None
            and self.user_a_id > self.user_b_id
        ):
            self.user_a_id, self.user_b_id = (
                self.user_b_id,
                self.user_a_id,
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"Connection {self.user_a_id}-{self.user_b_id} "
            f"({self.status})"
        )
