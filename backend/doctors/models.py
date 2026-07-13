from django.db import models
from django.conf import settings

class Doctor(models.Model):
    HOSPITAL = 'hospital'
    CLINIC = 'clinic'
    DOCTORS = 'doctors'

    FACILITY_TYPE_CHOICES = [
        (HOSPITAL, 'Hospital'),
        (CLINIC, 'Clinic'),
        (DOCTORS, 'Doctors'),
    ]

    OPENSTREETMAP = 'openstreetmap'
    SELF_REGISTERED = 'self_registered'

    SOURCE_CHOICES = [
        (OPENSTREETMAP, 'OpenStreetMap'),
        (SELF_REGISTERED, 'Self-Registered'),
    ]

    UNVERIFIED = 'unverified'
    VERIFIED = 'verified'

    STATUS_CHOICES = [
        (UNVERIFIED, 'Unverified'),
        (VERIFIED, 'Verified'),
    ]

    osm_id = models.BigIntegerField(unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=100, blank=True, default="")
    address = models.CharField(max_length=500, blank=True, default="")
    facility_type = models.CharField(
        max_length=20,
        choices=FACILITY_TYPE_CHOICES,
        default=DOCTORS
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default=OPENSTREETMAP
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=UNVERIFIED
    )
    claimed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='claimed_listings'
    )
    raw_osm_tags = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.facility_type}) - Status: {self.status}"
