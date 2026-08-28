from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegistrationView,
    MeView,
    VerifyDoctorView,
    UserListView,
    ProfileUpdateView,
    AdminCreateUserView,
    DoctorVerificationRequestView,
)

urlpatterns = [
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Account endpoints
    path('accounts/register/', RegistrationView.as_view(), name='register'),
    path('accounts/me/', MeView.as_view(), name='me'),
    path('accounts/profile/', ProfileUpdateView.as_view(), name='profile_update'),

    # Doctor verification
    path('accounts/doctors/<int:user_id>/verify/', VerifyDoctorView.as_view(), name='verify_doctor'),
    path('accounts/doctors/verify-request/', DoctorVerificationRequestView.as_view(), name='verify_request'),

    # Admin endpoints
    path('accounts/admin/users/', UserListView.as_view(), name='user_list'),
    path('accounts/admin/create-user/', AdminCreateUserView.as_view(), name='admin_create_user'),
    # Legacy alias (frontend may call /api/accounts/users/)
    path('accounts/users/', UserListView.as_view(), name='user_list_legacy'),
]
