
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from .models import Clinic
from .serializers import ClinicSerializer


class MyClinicListCreateView(generics.ListCreateAPIView):
    serializer_class = ClinicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = getattr(self.request.user, "doctor_profile", None)

        if profile is None:
            raise NotFound("Doctor profile not found.")

        return Clinic.objects.filter(profile=profile)

    def perform_create(self, serializer):
        profile = getattr(self.request.user, "doctor_profile", None)

        if profile is None:
            raise NotFound("Doctor profile not found.")

        serializer.save(profile=profile)


class MyClinicDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClinicSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "put", "patch", "delete", "head", "options"]

    def get_queryset(self):
        profile = getattr(self.request.user, "doctor_profile", None)

        if profile is None:
            raise NotFound("Doctor profile not found.")

        return Clinic.objects.filter(profile=profile)
