from django.contrib import admin
from .models import Queue, QueueEntry

@admin.register(Queue)
class QueueAdmin(admin.ModelAdmin):
    list_display = ['id', 'doctor_name', 'date', 'status', 'current_token_number', 'avg_consultation_minutes']
    list_filter = ['status', 'date']
    search_fields = ['doctor_name']

@admin.register(QueueEntry)
class QueueEntryAdmin(admin.ModelAdmin):
    list_display = ['id', 'queue', 'client_name', 'token_number', 'status', 'booked_at']
    list_filter = ['status']
    search_fields = ['client_name']
