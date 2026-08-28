from rest_framework import serializers
from .models import Doctor, DoctorReview
from accounts.serializers import UserSerializer


class DoctorReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorReview
        fields = ['id', 'client_name', 'rating', 'comment', 'date']
        read_only_fields = ['id', 'date']


class DoctorSerializer(serializers.ModelSerializer):
    distance_km = serializers.FloatField(read_only=True, required=False)
    rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    reviews = DoctorReviewSerializer(many=True, read_only=True)
    claimed_by_detail = UserSerializer(source='claimed_by', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id',
            'osm_id',
            'name',
            'specialization',
            'phone',
            'address',
            'facility_type',
            'latitude',
            'longitude',
            'source',
            'status',
            'claimed_by',
            'claimed_by_detail',
            'distance_km',
            'rating',
            'review_count',
            'reviews',
            'about',
            'bio',
            'profile_detail',
            'education',
            'title',
            'clinic_timings',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'osm_id', 'source', 'claimed_by', 'created_at', 'updated_at']
