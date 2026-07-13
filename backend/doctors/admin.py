from django.contrib import admin
from .models import Doctor

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'facility_type', 'status', 'source', 'claimed_by', 'latitude', 'longitude')
    list_filter = ('facility_type', 'status', 'source')
    search_fields = ('name', 'phone', 'address')
