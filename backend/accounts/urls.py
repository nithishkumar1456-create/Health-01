from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegistrationView,
    MeView,
    VerifyDoctorView,
    UserListView,
    ProfileUpdateView
)

urlpatterns = [
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Account endpoints
    path('accounts/register/', RegistrationView.as_view(), name='register'),
    path('accounts/me/', MeView.as_view(), name='me'),
    path('accounts/doctors/<int:user_id>/verify/', VerifyDoctorView.as_view(), name='verify_doctor'),
    path('accounts/users/', UserListView.as_view(), name='user_list'),
    path('accounts/profile/', ProfileUpdateView.as_view(), name='profile_update'),
]

