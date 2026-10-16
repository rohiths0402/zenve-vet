
from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.hashers import check_password
from django.db import IntegrityError, transaction
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .bloom import get_username_filter
from .models import DoctorProfile, Clinic

User = get_user_model()


class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    fullName = serializers.CharField(
        max_length=150,
        trim_whitespace=True,
    )
    username = serializers.RegexField(
        regex=r"^[A-Za-z0-9_.-]+$",
        max_length=150,
    )
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        min_length=8,
        max_length=128,
    )
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    specialty = serializers.CharField(max_length=150)
    bio = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value.strip().lower()

    def validate_username(self, value):
        value = value.strip()

        # The Bloom filter is a quick pre-check, not the authority.
        bloom = get_username_filter()

        if bloom.might_contain(value):
            if User.objects.filter(username__iexact=value).exists():
                raise serializers.ValidationError(
                    "This username is already taken."
                )

        return value

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate_fullName(self, value):
        value = " ".join(value.split())

        if not value:
            raise serializers.ValidationError(
                "Full name is required."
            )

        return value

    def validate(self, attrs):
        if User.objects.filter(
            email__iexact=attrs["email"]
        ).exists():
            raise serializers.ValidationError({
                "email": "An account with this email already exists."
            })

        if User.objects.filter(
            username__iexact=attrs["username"]
        ).exists():
            raise serializers.ValidationError({
                "username": "This username is already taken."
            })

        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop("fullName")
        password = validated_data.pop("password")

        parts = full_name.split(maxsplit=1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=validated_data["username"],
                    email=validated_data["email"],
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                )

                DoctorProfile.objects.create(
                    user=user,
                    city=validated_data["city"].strip(),
                    state=validated_data["state"].strip(),
                    specialty=validated_data["specialty"].strip(),
                    bio=validated_data.get("bio", "").strip(),
                )
        except IntegrityError:
            raise serializers.ValidationError(
                "This username or account is already registered."
            )

        # Update this process's filter after successful registration.
        get_username_filter().add(user.username)

        return user


class LoginSerializer(TokenObtainPairSerializer):
    username_field = "identifier"

    identifier = serializers.CharField(write_only=True)
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        identifier = attrs.get("identifier", "").strip()
        password = attrs.get("password", "")

        if "@" in identifier:
            user = User.objects.filter(
                email__iexact=identifier
            ).first()
        else:
            user = User.objects.filter(
                username__iexact=identifier
            ).first()

        # Use a generic error so we don't disclose which account exists.
        if (
            user is None
            or not user.is_active
            or not check_password(password, user.password)
        ):
            raise AuthenticationFailed(
                "Invalid username/email or password."
            )

        refresh = RefreshToken.for_user(user)

        profile = getattr(user, "doctor_profile", None)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.pk,
                "username": user.username,
                "email": user.email,
                "fullName": " ".join(
                    part for part in [user.first_name, user.last_name]
                    if part
                ),
                "city": profile.city if profile else "",
                "state": profile.state if profile else "",
                "specialty": profile.specialty if profile else "",
                "bio": profile.bio if profile else "",
            },
        }


class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = [
            "id",
            "name",
            "address",
            "city",
            "state",
            "phone",
            "website",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class DoctorProfileSerializer(serializers.ModelSerializer):
    fullName = serializers.SerializerMethodField()
    clinics = ClinicSerializer(many=True, read_only=True)
    pageStrength = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            "id",
            "fullName",
            "city",
            "state",
            "specialty",
            "bio",
            "profile_photo_url",
            "banner_image_url",
            "website",
            "gallery",
            "is_verified",
            "phone_alerts_enabled",
            "clinics",
            "pageStrength",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "is_verified",
            "created_at",
            "updated_at",
        ]

    def get_fullName(self, obj):
        user = obj.user
        return (
            " ".join(
                part
                for part in [user.first_name, user.last_name]
                if part
            )
            or user.username
        )

    def get_pageStrength(self, obj):
        checks = [
            bool(obj.profile_photo_url),
            bool(obj.bio.strip()),
            bool(obj.website),
            bool(obj.city.strip() and obj.state.strip()),
            bool(obj.gallery),
            bool(obj.is_verified),
        ]

        return round(sum(checks) / len(checks) * 100)
