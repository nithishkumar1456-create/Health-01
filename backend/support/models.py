from django.db import models
from django.conf import settings


class SupportIssue(models.Model):
    BILLING = 'billing'
    TECHNICAL = 'technical'
    CLINICAL = 'clinical'
    ACCOUNT = 'account'
    OTHER = 'other'

    CATEGORY_CHOICES = [
        (BILLING, 'Billing'),
        (TECHNICAL, 'Technical'),
        (CLINICAL, 'Clinical'),
        (ACCOUNT, 'Account'),
        (OTHER, 'Other'),
    ]

    OPEN = 'open'
    IN_PROGRESS = 'in_progress'
    RESOLVED = 'resolved'

    STATUS_CHOICES = [
        (OPEN, 'Open'),
        (IN_PROGRESS, 'In Progress'),
        (RESOLVED, 'Resolved'),
    ]

    title = models.CharField(max_length=500)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default=OTHER)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=OPEN)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='support_issues'
    )
    user_email = models.EmailField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_status_display()}] {self.title}"
