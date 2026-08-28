from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Max
from datetime import date, timedelta

from .models import Queue, QueueEntry
from .serializers import QueueSerializer, QueueEntrySerializer


class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'doctor'


def compute_queue_status_response(entry, queue, all_entries, doctor=None):
    """Build the QueueStatusResponse dict matching the frontend interface."""
    people_ahead = all_entries.filter(
        queue=queue,
        status__in=['waiting', 'in_progress'],
        token_number__lt=entry.token_number
    ).exclude(id=entry.id).count()

    estimated_wait_mins = people_ahead * (queue.avg_consultation_minutes or 15)
    
    base = {
        'queue_status': queue.status,
        'token_number': entry.token_number,
        'people_ahead': people_ahead,
        'estimated_wait_minutes': estimated_wait_mins,
        'entry_status': entry.status,
        'current_token_number': queue.current_token_number,
        'doctor_name': queue.doctor_name,
        'doctor_specialization': queue.doctor_specialty,
        'clinic_name': doctor.facility_type if doctor else None,
    }

    if queue.status == 'paused':
        base['message'] = (
            f"Doctor is currently unavailable ({queue.pause_reason}). We'll update you when they resume."
            if queue.pause_reason
            else "Doctor is currently unavailable (emergency/break). We'll update you when they resume."
        )
        base['estimated_resume_at'] = queue.estimated_resume_at.isoformat() if queue.estimated_resume_at else None

    return base


def get_or_create_today_queue(doctor):
    today = date.today()
    queue, created = Queue.objects.get_or_create(
        doctor=doctor,
        date=today,
        defaults={
            'doctor_name': doctor.name,
            'doctor_specialty': doctor.specialization,
            'status': Queue.ACTIVE,
            'avg_consultation_minutes': 15,
        }
    )
    return queue


class BookQueueTokenView(APIView):
    """POST /api/queue/book/ — Book a token for a doctor."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from doctors.models import Doctor

        doctor_id = request.data.get('doctor_id')
        if not doctor_id:
            return Response({"detail": "doctor_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            doctor = Doctor.objects.get(pk=doctor_id)
        except Doctor.DoesNotExist:
            return Response({"detail": f"Doctor #{doctor_id} not found."}, status=status.HTTP_404_NOT_FOUND)

        if doctor.status != Doctor.VERIFIED:
            return Response(
                {"detail": "Doctor is unverified and call-only. Live queue booking is not available."},
                status=status.HTTP_400_BAD_REQUEST
            )

        queue = get_or_create_today_queue(doctor)

        # Check if user already has an active token
        existing_entry = QueueEntry.objects.filter(
            queue=queue,
            client=request.user,
            status__in=['waiting', 'in_progress']
        ).first()

        if existing_entry:
            all_entries = QueueEntry.objects.filter(queue=queue)
            status_resp = compute_queue_status_response(existing_entry, queue, all_entries, doctor)
            return Response({
                'entry': QueueEntrySerializer(existing_entry).data,
                'status': status_resp
            })

        # Assign next token
        last_token = QueueEntry.objects.filter(queue=queue).aggregate(
            max_token=Max('token_number')
        )['max_token'] or 0
        next_token = last_token + 1

        client_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username

        entry = QueueEntry.objects.create(
            queue=queue,
            doctor=doctor,
            client=request.user,
            client_name=client_name,
            token_number=next_token,
            status=QueueEntry.WAITING
        )

        all_entries = QueueEntry.objects.filter(queue=queue)
        status_resp = compute_queue_status_response(entry, queue, all_entries, doctor)

        return Response({
            'entry': QueueEntrySerializer(entry).data,
            'status': status_resp
        }, status=status.HTTP_201_CREATED)


class QueueEntryStatusView(APIView):
    """GET /api/queue/entries/<pk>/status/ — Get queue entry status."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        entry = get_object_or_404(QueueEntry, pk=pk)
        
        # Only client who owns it or doctor/admin can view
        if request.user.role not in ['admin', 'support', 'doctor'] and entry.client != request.user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        queue = entry.queue
        all_entries = QueueEntry.objects.filter(queue=queue)
        doctor = entry.doctor
        status_resp = compute_queue_status_response(entry, queue, all_entries, doctor)

        return Response({
            **status_resp,
            'entry': QueueEntrySerializer(entry).data,
            'queue': QueueSerializer(queue).data,
        })


class CancelQueueEntryView(APIView):
    """POST /api/queue/entries/<pk>/cancel/ — Cancel a token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        entry = get_object_or_404(QueueEntry, pk=pk)

        if request.user.role not in ['admin'] and entry.client != request.user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        if entry.status != QueueEntry.WAITING:
            return Response(
                {"detail": f"Token #{entry.token_number} is already {entry.status} and cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        entry.status = QueueEntry.CANCELLED
        entry.save()

        return Response({
            'message': f"Token #{entry.token_number} cancelled successfully.",
            'entry': QueueEntrySerializer(entry).data
        })


class MyQueueEntriesView(APIView):
    """GET /api/queue/my-entries/ — Get current user's queue entries."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        entries = QueueEntry.objects.filter(
            client=request.user
        ).select_related('queue', 'doctor').order_by('-booked_at')
        return Response(QueueEntrySerializer(entries, many=True).data)


class DoctorTodayQueueView(APIView):
    """GET /api/queue/doctor/today/ — Get today's queue for the logged-in doctor."""
    permission_classes = [IsDoctor]

    def get(self, request):
        from doctors.models import Doctor

        # Doctor's claimed listing
        doctor_id = request.query_params.get('doctor_id')
        if doctor_id:
            doctor = get_object_or_404(Doctor, pk=doctor_id)
        else:
            doctor = Doctor.objects.filter(claimed_by=request.user).first()
            if not doctor:
                return Response({"detail": "No doctor listing found for this account."}, status=status.HTTP_404_NOT_FOUND)

        queue = get_or_create_today_queue(doctor)
        entries = QueueEntry.objects.filter(queue=queue).order_by('token_number')

        return Response({
            'queue': QueueSerializer(queue).data,
            'entries': QueueEntrySerializer(entries, many=True).data
        })


class DoctorCallNextView(APIView):
    """POST /api/queue/doctor/call-next/ — Call the next waiting patient."""
    permission_classes = [IsDoctor]

    def post(self, request):
        queue_id = request.data.get('queue_id')
        if not queue_id:
            return Response({"detail": "queue_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        queue = get_object_or_404(Queue, pk=queue_id)

        # Check no active patient
        active = QueueEntry.objects.filter(queue=queue, status=QueueEntry.IN_PROGRESS).first()
        if active:
            return Response(
                {"detail": f"Token #{active.token_number} ({active.client_name}) is currently in progress. Please complete or mark as no-show before calling next."},
                status=status.HTTP_400_BAD_REQUEST
            )

        next_entry = QueueEntry.objects.filter(
            queue=queue, status=QueueEntry.WAITING
        ).order_by('token_number').first()

        if not next_entry:
            return Response({"detail": "No patients currently waiting in the queue."}, status=status.HTTP_400_BAD_REQUEST)

        next_entry.status = QueueEntry.IN_PROGRESS
        next_entry.started_at = timezone.now()
        next_entry.save()

        queue.current_token_number = next_entry.token_number
        queue.save()

        return Response({
            'message': f"Token #{next_entry.token_number} ({next_entry.client_name}) called into consultation!",
            'entry': QueueEntrySerializer(next_entry).data
        })


class CompleteQueueEntryView(APIView):
    """POST /api/queue/entries/<pk>/complete/ — Mark entry as completed."""
    permission_classes = [IsDoctor]

    def post(self, request, pk):
        entry = get_object_or_404(QueueEntry, pk=pk)

        if entry.status != QueueEntry.IN_PROGRESS:
            return Response(
                {"detail": f"Entry #{pk} is not currently in progress."},
                status=status.HTTP_400_BAD_REQUEST
            )

        entry.status = QueueEntry.COMPLETED
        entry.completed_at = timezone.now()
        entry.save()

        return Response(QueueEntrySerializer(entry).data)


class NoShowQueueEntryView(APIView):
    """POST /api/queue/entries/<pk>/no-show/ — Mark entry as no-show."""
    permission_classes = [IsDoctor]

    def post(self, request, pk):
        entry = get_object_or_404(QueueEntry, pk=pk)

        entry.status = QueueEntry.NO_SHOW
        entry.completed_at = timezone.now()
        entry.save()

        return Response(QueueEntrySerializer(entry).data)


class PauseQueueView(APIView):
    """POST /api/queue/doctor/pause/ — Pause the queue."""
    permission_classes = [IsDoctor]

    def post(self, request):
        queue_id = request.data.get('queue_id')
        if not queue_id:
            return Response({"detail": "queue_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        queue = get_object_or_404(Queue, pk=queue_id)
        reason = request.data.get('reason', 'Emergency/Break')
        estimated_resume_minutes = request.data.get('estimated_resume_minutes')

        queue.status = Queue.PAUSED
        queue.pause_reason = reason
        queue.paused_at = timezone.now()

        if estimated_resume_minutes:
            try:
                minutes = int(estimated_resume_minutes)
                queue.estimated_resume_at = timezone.now() + timedelta(minutes=minutes)
            except (ValueError, TypeError):
                pass

        queue.save()
        return Response(QueueSerializer(queue).data)


class ResumeQueueView(APIView):
    """POST /api/queue/doctor/resume/ — Resume a paused queue."""
    permission_classes = [IsDoctor]

    def post(self, request):
        queue_id = request.data.get('queue_id')
        if not queue_id:
            return Response({"detail": "queue_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        queue = get_object_or_404(Queue, pk=queue_id)

        queue.status = Queue.ACTIVE
        queue.pause_reason = None
        queue.paused_at = None
        queue.estimated_resume_at = None
        queue.save()

        return Response(QueueSerializer(queue).data)
