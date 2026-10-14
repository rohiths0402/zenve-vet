"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Main admin control portal
    path('admin/', admin.site.urls),

    # Core Application Endpoint Sub-routers
    path('api/accounts/', include('accounts.urls')),
    path('api/cases/', include('cases.urls')),  # Links your new Case Discussion module view pathways

    # Beautiful Auto-Generated API Documentation Routing
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Maps both the empty root address and the /docs path to the interactive Swagger grid
    path('', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui-root'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui-docs'),
]
