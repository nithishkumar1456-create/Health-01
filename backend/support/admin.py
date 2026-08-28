from django.contrib import admin
from .models import SupportIssue

@admin.register(SupportIssue)
class SupportIssueAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'category', 'status', 'user_email', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['title', 'description', 'user_email']
