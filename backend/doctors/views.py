from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
import math

from .models import Doctor
from .serializers import DoctorSerializer
from accounts.permissions import IsAdmin, IsDoctor

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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        lat_str = self.request.query_params.get('lat')
        lng_str = self.request.query_params.get('lng')
        if not lat_str or not lng_str:
            raise ValidationError("lat and lng query parameters are required.")
        
        try:
            user_lat = float(lat_str)
            user_lng = float(lng_str)
        except ValueError:
            raise ValidationError("lat and lng must be valid float numbers.")

        radius_km = self.request.query_params.get('radius_km')
        if radius_km:
            try:
                radius_km = float(radius_km)
            except ValueError:
                raise ValidationError("radius_km must be a float number.")

        specialization = self.request.query_params.get('specialization')

        # Load from local database only
        queryset = Doctor.objects.all()
        if specialization:
            queryset = queryset.filter(specialization__iexact=specialization)

        results = []
        for doc in queryset:
            dist = haversine(user_lat, user_lng, doc.latitude, doc.longitude)
            if radius_km is None or dist <= radius_km:
                doc.distance_km = round(dist, 2)
                results.append(doc)

        # Sort by distance
        results.sort(key=lambda x: x.distance_km)
        return results


class DoctorRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]



class DoctorClaimView(APIView):
    permission_classes = [IsDoctor]

    def post(self, request, pk):
        doctor = get_object_or_404(Doctor, pk=pk)
        
        # Check if already claimed by someone else
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
        
        # Set status to verified if doctor is verified in accounts profile
        if hasattr(request.user, 'doctor_profile') and request.user.doctor_profile.is_verified:
            doctor.status = Doctor.VERIFIED
            
        doctor.save()
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DoctorVerifyView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        doctor = get_object_or_404(Doctor, pk=pk)
        doctor.status = Doctor.VERIFIED
        doctor.save()
        
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data, status=status.HTTP_200_OK)



