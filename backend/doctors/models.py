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

    # Rich profile fields (populated when claimed by a doctor)
    education = models.CharField(max_length=500, blank=True, default="")
    title = models.CharField(max_length=255, blank=True, default="")
    clinic_timings = models.CharField(max_length=255, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    profile_detail = models.TextField(blank=True, default="")
    about = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.name} ({self.facility_type}) - Status: {self.status}"

    @property
    def rating(self):
        reviews = self.reviews.all()
        if not reviews.exists():
            return round(4.0 + (self.id % 10) * 0.1, 1)
        total = sum(r.rating for r in reviews)
        return round(total / reviews.count(), 1)

    @property
    def review_count(self):
        count = self.reviews.count()
        if count == 0:
            return (self.id % 50) * 3 + 12
        return count


class DoctorReview(models.Model):
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='doctor_reviews'
    )
    client_name = models.CharField(max_length=255, blank=True, default="Anonymous")
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField(blank=True, default="")
    date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Review for {self.doctor.name} by {self.client_name} ({self.rating}★)"
