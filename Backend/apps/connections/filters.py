
from django.db.models import Q
from rest_framework import filters


class DoctorDirectoryFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        specialty = request.query_params.get("specialty", "").strip()
        state = request.query_params.get("state", "").strip()
        city = request.query_params.get("city", "").strip()
        search = request.query_params.get("search", "").strip()

        if specialty:
            queryset = queryset.filter(
                doctor_profile__specialty__iexact=specialty
            )

        if state:
            queryset = queryset.filter(
                doctor_profile__state__iexact=state
            )

        if city:
            queryset = queryset.filter(
                doctor_profile__city__iexact=city
            )

        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(doctor_profile__specialty__icontains=search)
            )

        return queryset
