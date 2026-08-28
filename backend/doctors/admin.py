from django.contrib import admin
from .models import Doctor, DoctorReview

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'facility_type', 'status', 'source', 'claimed_by', 'latitude', 'longitude')
    list_filter = ('facility_type', 'status', 'source')
    search_fields = ('name', 'phone', 'address')

@admin.register(DoctorReview)
class DoctorReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'doctor', 'client_name', 'rating', 'date')
    list_filter = ('rating',)
    search_fields = ('client_name', 'comment')
