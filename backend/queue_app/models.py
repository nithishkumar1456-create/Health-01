from django.db import models
from django.conf import settings
from django.utils import timezone


class Queue(models.Model):
    ACTIVE = 'active'
    PAUSED = 'paused'
    CLOSED = 'closed'

    STATUS_CHOICES = [
        (ACTIVE, 'Active'),
        (PAUSED, 'Paused'),
        (CLOSED, 'Closed'),
    ]

    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.CASCADE,
        related_name='queues'
    )
    doctor_name = models.CharField(max_length=255, blank=True, default="")
    doctor_specialty = models.CharField(max_length=255, blank=True, default="")
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=ACTIVE)
    avg_consultation_minutes = models.PositiveIntegerField(default=15)
    current_token_number = models.PositiveIntegerField(null=True, blank=True)
    pause_reason = models.CharField(max_length=500, blank=True, null=True)
    paused_at = models.DateTimeField(null=True, blank=True)
    estimated_resume_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('doctor', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Queue for {self.doctor_name} on {self.date} [{self.status}]"


class QueueEntry(models.Model):
    WAITING = 'waiting'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    NO_SHOW = 'no_show'

    STATUS_CHOICES = [
        (WAITING, 'Waiting'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
        (NO_SHOW, 'No Show'),
    ]

    queue = models.ForeignKey(
        Queue,
        on_delete=models.CASCADE,
        related_name='entries'
    )
    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.CASCADE,
        related_name='queue_entries'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='queue_entries'
    )
    client_name = models.CharField(max_length=255, blank=True, default="")
    token_number = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=WAITING)
    booked_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['token_number']
        unique_together = ('queue', 'token_number')

    def __str__(self):
        return f"Token #{self.token_number} — {self.client_name} [{self.status}]"
