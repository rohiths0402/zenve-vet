from rest_framework import serializers

from .models import Benefit, ProfessionalProfile


class BenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Benefit
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "category",
            "eligibility",
            "application_url",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalProfile
        fields = [
            "id",
            "full_name",
            "professional_title",
            "specialization",
            "organization",
            "bio",
            "website",
            "is_public",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]