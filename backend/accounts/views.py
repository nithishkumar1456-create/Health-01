from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import DoctorProfile
from .serializers import (
    CustomTokenObtainPairSerializer, 
    RegistrationSerializer, 
    UserSerializer,
    DoctorProfileSerializer,
    ProfileUpdateSerializer
)
from .permissions import IsAdmin

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegistrationView(CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]


class MeView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class VerifyDoctorView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if target_user.role != User.DOCTOR or not hasattr(target_user, 'doctor_profile'):
            return Response(
                {"detail": "Target user is not a doctor or has no doctor profile."},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = target_user.doctor_profile
        if profile.is_verified:
            return Response(
                {"detail": f"Doctor {target_user.username} is already verified."},
                status=status.HTTP_200_OK
            )

        profile.is_verified = True
        profile.verified_by = request.user
        profile.verified_at = timezone.now()
        profile.save()

        # Serialize doctor profile response
        serializer = DoctorProfileSerializer(profile)
        return Response(
            {
                "detail": f"Doctor {target_user.username} successfully verified.",
                "doctor_profile": serializer.data
            },
            status=status.HTTP_200_OK
        )


from rest_framework import generics
from rest_framework.exceptions import ValidationError

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        role = self.request.query_params.get('role')
        if role:
            if role not in [User.CLIENT, User.DOCTOR, User.ADMIN]:
                raise ValidationError({"role": f"Invalid role: {role}."})
            queryset = queryset.filter(role=role)

        verified = self.request.query_params.get('verified')
        if verified is not None:
            if role != User.DOCTOR:
                raise ValidationError({"verified": "The verified parameter can only be used when role is doctor."})
            
            is_verified = verified.lower() in ['true', '1', 'false', '0']
            if is_verified:
                val = verified.lower() in ['true', '1']
                queryset = queryset.filter(doctor_profile__is_verified=val)
            
        return queryset


class ProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        response_serializer = UserSerializer(user)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


