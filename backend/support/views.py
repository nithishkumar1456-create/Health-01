from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import SupportIssue
from .serializers import SupportIssueSerializer, SupportIssueCreateSerializer, STATUS_MAP


class IsAdminOrSupport(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'support']


class SupportIssueListCreateView(APIView):
    """
    GET  /api/support/issues/   — List all issues (admin/support) or own issues (clients/doctors)
    POST /api/support/issues/   — Create a new support issue
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role in ['admin', 'support']:
            issues = SupportIssue.objects.all()
        else:
            issues = SupportIssue.objects.filter(user=request.user)
        serializer = SupportIssueSerializer(issues, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        if not data.get('userEmail'):
            data['userEmail'] = request.user.email
        
        serializer = SupportIssueCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        issue = serializer.save(user=request.user)
        return Response(SupportIssueSerializer(issue).data, status=status.HTTP_201_CREATED)


class SupportIssueStatusUpdateView(APIView):
    """
    PATCH /api/support/issues/<id>/status/ — Update issue status
    """
    permission_classes = [IsAdminOrSupport]

    def patch(self, request, pk):
        issue = get_object_or_404(SupportIssue, pk=pk)
        
        raw_status = request.data.get('status')
        if not raw_status:
            return Response({"detail": "status field is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        db_status = STATUS_MAP.get(raw_status, raw_status.lower().replace(' ', '_'))
        valid_statuses = [choice[0] for choice in SupportIssue.STATUS_CHOICES]
        if db_status not in valid_statuses:
            return Response(
                {"detail": f"Invalid status. Must be one of: {list(STATUS_MAP.keys())}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        issue.status = db_status
        issue.save()
        return Response(SupportIssueSerializer(issue).data)
