from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import DoctorProfile
from .serializers import (
    CustomTokenObtainPairSerializer, 
    RegistrationSerializer, 
    UserSerializer,
    DoctorProfileSerializer,
    ProfileUpdateSerializer,
    AdminCreateUserSerializer,
    VerificationRequestSerializer
)
from .permissions import IsAdmin, IsDoctor, IsAdminOrSupport

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegistrationView(CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class VerifyDoctorView(APIView):
    permission_classes = [IsAdminOrSupport]

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

        serializer = DoctorProfileSerializer(profile)
        return Response(
            {
                "detail": f"Doctor {target_user.username} successfully verified.",
                "doctor_profile": serializer.data,
                "success": True
            },
            status=status.HTTP_200_OK
        )


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        role = self.request.query_params.get('role')
        if role:
            if role not in [User.CLIENT, User.DOCTOR, User.ADMIN, User.SUPPORT]:
                raise ValidationError({"role": f"Invalid role: {role}."})
            queryset = queryset.filter(role=role)

        verified = self.request.query_params.get('verified')
        if verified is not None:
            if role != User.DOCTOR:
                raise ValidationError({"verified": "The verified parameter can only be used when role is doctor."})
            val = verified.lower() in ['true', '1']
            queryset = queryset.filter(doctor_profile__is_verified=val)
            
        return queryset


class ProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    # Also accept PUT (frontend sends PUT)
    def put(self, request):
        return self.patch(request)


class AdminCreateUserView(APIView):
    """Admin-only endpoint to create any user role including admin."""
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class DoctorVerificationRequestView(APIView):
    """Doctor submits a verification request (sends data to admin for review)."""
    permission_classes = [IsDoctor]

    def post(self, request):
        if request.user.role != User.DOCTOR:
            return Response({"detail": "Only doctors can request verification."}, status=status.HTTP_403_FORBIDDEN)

        serializer = VerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        profile, _ = DoctorProfile.objects.get_or_create(
            user=request.user,
            defaults={'registration_number': data['registration_number']}
        )
        profile.specialization = data['specialization']
        profile.registration_number = data['registration_number']
        if data.get('license_file_url'):
            profile.license_file_url = data['license_file_url']
        profile.verification_requested = True
        profile.save()

        # Create a support ticket automatically
        try:
            from support.models import SupportIssue
            SupportIssue.objects.create(
                title=f"Dr. {request.user.first_name} {request.user.last_name} license verification request",
                description=(
                    f"Physician has requested a verified profile checkmark. "
                    f"Spec: {data['specialization']}, License: {data['registration_number']}. "
                    f"Document: {data.get('license_file_url', 'license_scan.pdf')}"
                ),
                category='account',
                status='open',
                user_email=request.user.email
            )
        except Exception:
            pass  # Support ticket creation is best-effort

        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
