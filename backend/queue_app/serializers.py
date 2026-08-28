from rest_framework import serializers
from .models import Queue, QueueEntry


class QueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Queue
        fields = [
            'id', 'doctor', 'doctor_name', 'doctor_specialty',
            'date', 'status', 'avg_consultation_minutes', 'current_token_number',
            'pause_reason', 'paused_at', 'estimated_resume_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class QueueEntrySerializer(serializers.ModelSerializer):
    queue_id = serializers.IntegerField(source='queue.id', read_only=True)
    doctor_id = serializers.IntegerField(source='doctor.id', read_only=True)

    class Meta:
        model = QueueEntry
        fields = [
            'id', 'queue', 'queue_id', 'doctor_id',
            'client', 'client_name', 'token_number',
            'status', 'booked_at', 'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'queue', 'queue_id', 'doctor_id', 'client', 'token_number', 'booked_at']


class QueueStatusResponseSerializer(serializers.Serializer):
    queue_status = serializers.CharField()
    message = serializers.CharField(required=False, allow_null=True)
    estimated_resume_at = serializers.DateTimeField(required=False, allow_null=True)
    token_number = serializers.IntegerField()
    people_ahead = serializers.IntegerField()
    estimated_wait_minutes = serializers.IntegerField()
    entry_status = serializers.CharField()
    current_token_number = serializers.IntegerField(required=False, allow_null=True)
    doctor_name = serializers.CharField(required=False, allow_null=True)
    doctor_specialization = serializers.CharField(required=False, allow_null=True)
    clinic_name = serializers.CharField(required=False, allow_null=True)
