
from django.contrib.auth import get_user_model
from rest_framework import serializers
from apps.accounts.models import DoctorProfile
from .models import Connection

User = get_user_model()


class DoctorDirectorySerializer(serializers.ModelSerializer):
    fullName = serializers.SerializerMethodField()
    specialty = serializers.CharField(
        source="doctor_profile.specialty",
        read_only=True,
        default="",
    )
    city = serializers.CharField(
        source="doctor_profile.city",
        read_only=True,
        default="",
    )
    state = serializers.CharField(
        source="doctor_profile.state",
        read_only=True,
        default="",
    )
    profile_photo_url = serializers.CharField(
        source="doctor_profile.profile_photo_url",
        read_only=True,
        default="",
    )
    is_verified = serializers.BooleanField(
        source="doctor_profile.is_verified",
        read_only=True,
        default=False,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "fullName",
            "specialty",
            "city",
            "state",
            "profile_photo_url",
            "is_verified",
        ]

    def get_fullName(self, obj):
        name = " ".join(
            part for part in [obj.first_name, obj.last_name] if part
        )
        return name or obj.username


class ConnectionSerializer(serializers.ModelSerializer):
    requested_by_username = serializers.CharField(
        source="requested_by.username",
        read_only=True,
    )

    class Meta:
        model = Connection
        fields = [
            "id",
            "user_a",
            "user_b",
            "requested_by",
            "requested_by_username",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user_a",
            "user_b",
            "requested_by",
            "status",
            "created_at",
            "updated_at",
        ]
class ConnectionRequestSerializer(serializers.ModelSerializer):
    requested_by_username = serializers.CharField(
        source="requested_by.username",
        read_only=True,
    )
    other_doctor = serializers.SerializerMethodField()

    class Meta:
        model = Connection
        fields = [
            "id",
            "user_a",
            "user_b",
            "requested_by",
            "requested_by_username",
            "other_doctor",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_other_doctor(self, obj):
        request = self.context.get("request")
        if not request:
            return None

        current_user_id = request.user.id
        other_user = (
            obj.user_b if obj.user_a_id == current_user_id
            else obj.user_a
        )

        profile = getattr(other_user, "doctor_profile", None)

        if profile is None:
            return {
                "id": other_user.id,
                "username": other_user.username,
            }

        return {
            "id": other_user.id,
            "username": other_user.username,
            "fullName": (
                f"{other_user.first_name} {other_user.last_name}".strip()
                or other_user.username
            ),
            "specialty": profile.specialty,
            "city": profile.city,
            "state": profile.state,
        }
