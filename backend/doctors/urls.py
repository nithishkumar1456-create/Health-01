from django.urls import path
from .views import (
    DoctorNearbyView,
    DoctorRetrieveDestroyView,
    DoctorClaimView,
    DoctorVerifyView
)

urlpatterns = [
    path('nearby/', DoctorNearbyView.as_view(), name='doctor_nearby'),
    path('<int:pk>/', DoctorRetrieveDestroyView.as_view(), name='doctor_detail_delete'),
    path('<int:pk>/claim/', DoctorClaimView.as_view(), name='doctor_claim'),
    path('<int:pk>/verify/', DoctorVerifyView.as_view(), name='doctor_verify'),
]
