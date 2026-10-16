from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

from .models import Benefit, ProfessionalProfile
from .serializers import BenefitSerializer, ProfessionalProfileSerializer


# =====================================================
# BENEFITS API
# =====================================================

class BenefitListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = BenefitSerializer

    def get_queryset(self):
        queryset = Benefit.objects.all()

        # Public users can view active benefits.
        if self.request.method == "GET":
            return queryset.filter(is_active=True)

        return queryset

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        # Only staff/admin users can create benefits.
        return [IsAdminUser()]


class BenefitDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Benefit.objects.all()
    serializer_class = BenefitSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        # Only staff/admin users can update or delete benefits.
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = Benefit.objects.all()

        # Public users can retrieve only active benefits.
        if self.request.method == "GET":
            return queryset.filter(is_active=True)

        return queryset


# =====================================================
# PROFESSIONAL PROFILE API
# =====================================================

class ProfessionalProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfessionalProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "put", "patch", "head", "options"]

    def get_object(self):
        # Each authenticated user can access only their own profile.
        profile, created = ProfessionalProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                "full_name": (
                    self.request.user.get_full_name()
                    or self.request.user.get_username()
                ),
                "professional_title": "Veterinary Professional",
            },
        )

        return profile