from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Article
from .serializers import ArticleSerializer
from .permissions import ArticlePermission

class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [ArticlePermission]
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        if not user or user.is_anonymous:
            # Fallback if anonymous (permission class will block, but safe standard)
            queryset = Article.objects.filter(status=Article.PUBLISHED)
        elif user.role == 'admin' or user.is_superuser:
            queryset = Article.objects.all()
        else:
            # Clients and Doctors see published articles or their own drafts
            queryset = Article.objects.filter(Q(status=Article.PUBLISHED) | Q(author=user))

        # Basic filtering
        author_id = self.request.query_params.get('author')
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        tag = self.request.query_params.get('tag')
        if tag:
            # Basic tag lookup within the comma-separated string
            queryset = queryset.filter(tags__icontains=tag)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        # Auto-set author to current user on creation
        serializer.save(author=self.request.user)
