from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    CLIENT = 'client'
    DOCTOR = 'doctor'
    ADMIN = 'admin'
    
    ROLE_CHOICES = [
        (CLIENT, 'Client'),
        (DOCTOR, 'Doctor'),
        (ADMIN, 'Admin'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=CLIENT
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class DoctorProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )
    specialization = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )
    registration_number = models.CharField(
        max_length=100
    )
    is_verified = models.BooleanField(
        default=False
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_doctors'
    )
    verified_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Dr. {self.user.username} - NMC/Reg No: {self.registration_number} (Verified: {self.is_verified})"
