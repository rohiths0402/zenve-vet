from rest_framework import serializers

from .models import Advertiser


class AdvertiserSerializer(serializers.ModelSerializer):

    class Meta:
        model = Advertiser

        fields = [
            "id",
            "brand_name",
            "contact_email",
            "website",
            "access_key",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "access_key",
            "is_active",
            "created_at",
        ]

    def validate_brand_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Brand name cannot be empty."
            )

        return value

    def validate_contact_email(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Contact email is required."
            )

        return value


class AdvertiserAccessKeySerializer(serializers.Serializer):

    access_key = serializers.CharField(
        max_length=64,
        trim_whitespace=True
    )