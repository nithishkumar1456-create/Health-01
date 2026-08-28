from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
import math

from .models import Doctor, DoctorReview
from .serializers import DoctorSerializer, DoctorReviewSerializer
from accounts.permissions import IsAdmin, IsDoctor, IsAdminOrSupport

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees).
    """
    R = 6371.0  # Earth radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class DoctorNearbyView(generics.ListAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        lat_str = self.request.query_params.get('lat')
        lng_str = self.request.query_params.get('lng')
        
        user_lat = 28.57
        user_lng = 77.22
        if lat_str and lng_str:
            try:
                user_lat = float(lat_str)
                user_lng = float(lng_str)
            except ValueError:
                pass

        radius_km = self.request.query_params.get('radius_km')
        if radius_km:
            try:
                radius_km = float(radius_km)
            except ValueError:
                radius_km = None

        specialization = self.request.query_params.get('specialization')

        queryset = Doctor.objects.prefetch_related('reviews').all()
        if specialization and specialization.lower() != 'all' and specialization.lower() != 'all specialties':
            queryset = queryset.filter(specialization__iexact=specialization)

        results = []
        for doc in queryset:
            dist = haversine(user_lat, user_lng, doc.latitude, doc.longitude)
            if radius_km is None or dist <= radius_km:
                doc.distance_km = round(dist, 2)
                results.append(doc)

        results.sort(key=lambda x: x.distance_km)
        return results


class DoctorRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    queryset = Doctor.objects.prefetch_related('reviews').all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return [permissions.AllowAny()]


class DoctorClaimView(APIView):
    permission_classes = [IsDoctor]

    def post(self, request, pk):
        doctor = get_object_or_404(Doctor, pk=pk)
        
        if doctor.claimed_by:
            if doctor.claimed_by == request.user:
                return Response(
                    {"detail": "You have already claimed this listing."}, 
                    status=status.HTTP_200_OK
                )
            return Response(
                {"detail": "This listing has already been claimed by another physician."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        doctor.claimed_by = request.user
        
        # Sync doctor profile rich fields from user's DoctorProfile
        if hasattr(request.user, 'doctor_profile'):
            prof = request.user.doctor_profile
            if prof.is_verified:
                doctor.status = Doctor.VERIFIED
            if prof.specialization:
                doctor.specialization = prof.specialization
            if prof.education:
                doctor.education = prof.education
            if prof.title:
                doctor.title = prof.title
            if prof.clinic_timings:
                doctor.clinic_timings = prof.clinic_timings
            if prof.bio:
                doctor.bio = prof.bio
            if prof.profile_detail:
                doctor.profile_detail = prof.profile_detail

        doctor.save()
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DoctorVerifyView(APIView):
    permission_classes = [IsAdminOrSupport]

    def post(self, request, pk):
        doctor = get_object_or_404(Doctor, pk=pk)
        doctor.status = Doctor.VERIFIED
        doctor.save()
        
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DoctorReviewView(APIView):
    """POST /api/doctors/<pk>/reviews/ — Add a review for a doctor."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        doctor = get_object_or_404(Doctor, pk=pk)
        
        client_name = request.data.get('clientName') or request.data.get('client_name')
        if not client_name:
            client_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username

        rating = request.data.get('rating')
        if rating is None:
            return Response({"detail": "rating is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            rating = int(rating)
            if not (1 <= rating <= 5):
                raise ValueError
        except (ValueError, TypeError):
            return Response({"detail": "rating must be an integer between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

        comment = request.data.get('comment', '')

        review = DoctorReview.objects.create(
            doctor=doctor,
            client=request.user,
            client_name=client_name,
            rating=rating,
            comment=comment
        )

        # Return the full updated doctor listing
        doctor.refresh_from_db()
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
