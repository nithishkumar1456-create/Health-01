from django.urls import path
from .views import SupportIssueListCreateView, SupportIssueStatusUpdateView

urlpatterns = [
    path('issues/', SupportIssueListCreateView.as_view(), name='support_issues'),
    path('issues/<int:pk>/status/', SupportIssueStatusUpdateView.as_view(), name='support_issue_status'),
]
