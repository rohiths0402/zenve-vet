from django.urls import path
from .views import DoctorProfileDetailView, AddQualificationView, AddExperienceView

urlpatterns = [
    path('me/', DoctorProfileDetailView.as_view(), name='doctor-profile-me'),
    path('qualification/', AddQualificationView.as_view(), name='add-qualification'),
    path('experience/', AddExperienceView.as_view(), name='add-experience'),
]
