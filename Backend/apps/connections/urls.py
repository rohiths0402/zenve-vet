from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VetNetworkViewSet, ConnectionViewSet, GlobalSearchView

router = DefaultRouter()
router.register(r'network', VetNetworkViewSet, basename='vet-network')
router.register(r'connections', ConnectionViewSet, basename='connections')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
]