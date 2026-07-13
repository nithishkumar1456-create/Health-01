from rest_framework import serializers
from .models import Doctor
from accounts.serializers import UserSerializer

class DoctorSerializer(serializers.ModelSerializer):
    distance_km = serializers.FloatField(read_only=True, required=False)
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    about = serializers.SerializerMethodField()
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
            'about',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'osm_id', 'source', 'status', 'claimed_by', 'created_at', 'updated_at']

    def get_rating(self, obj):
        # Deterministic dummy rating between 4.0 and 4.9 based on ID
        return round(4.0 + (obj.id % 10) * 0.1, 1)

    def get_review_count(self, obj):
        # Deterministic dummy review count based on ID
        return (obj.id % 50) * 3 + 12

    def get_about(self, obj):
        return f"Sourced via OpenStreetMap. Comprehensive healthcare services provider in {obj.address or 'the local area'}."
