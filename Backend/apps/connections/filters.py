import django_filters
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Connection

User = get_user_model()

class VetNetworkFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_by_search', label='Search name, specialty, or city')
    specialty = django_filters.CharFilter(method='filter_by_specialty', label='Specialty')
    state = django_filters.CharFilter(method='filter_by_state', label='State')
    city = django_filters.CharFilter(method='filter_by_city', label='City')

    class Meta:
        model = User
        fields = ['search', 'specialty', 'state', 'city']

    def filter_by_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(first_name__icontains=value) |
            Q(last_name__icontains=value) |
            Q(username__icontains=value) |
            Q(profile__specialty__icontains=value) |
            Q(profile__city__icontains=value) |
            Q(profile__state__icontains=value)
        ).distinct()

    def filter_by_specialty(self, queryset, name, value):
        if not value or value.lower() in ['all', 'all specialties']:
            return queryset
        return queryset.filter(profile__specialty__iexact=value)

    def filter_by_state(self, queryset, name, value):
        if not value or value.lower() in ['all', 'all states']:
            return queryset
        return queryset.filter(profile__state__iexact=value)

    def filter_by_city(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(profile__city__iexact=value)