"""
URL configuration for file_portal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes, api_view
from portal.views import RegisterView, UserProfileView, UploadedFileViewSet, download_file, PortalStatsView, AddressViewSet, PhoneNumberViewSet

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'files', UploadedFileViewSet, basename='file')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'phone-numbers', PhoneNumberViewSet, basename='phone-number')

# Apply AllowAny permission to token views
TokenObtainPairView = permission_classes([AllowAny])(TokenObtainPairView)
TokenRefreshView = permission_classes([AllowAny])(TokenRefreshView)

# Create a version of obtain_auth_token that allows any user
obtain_auth_token_view = permission_classes([AllowAny])(obtain_auth_token)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/', obtain_auth_token_view, name='login'),  # Now allows unauthenticated access
    path('api/profile/', UserProfileView.as_view(), name='profile'),
    path('api/download/<int:file_id>/', download_file, name='download-file'),
    path('api/stats/', PortalStatsView.as_view(), name='portal-stats'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
