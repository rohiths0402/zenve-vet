from django.urls import path
from .views import CaseListCreateView, CaseDetailView

urlpatterns = [
    # Main landing timeline endpoints: tracks list feeds and adding new items
    path('', CaseListCreateView.as_view(), name='case_list_create'),

    # Target item element locator path endpoints
    path('<int:pk>/', CaseDetailView.as_view(), name='case_detail'),
]