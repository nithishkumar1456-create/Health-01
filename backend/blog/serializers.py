from rest_framework import serializers
from .models import Article
from accounts.serializers import UserSerializer

class ArticleSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Article
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'content',
            'cover_image_url',
            'tags',
            'author',
            'status',
            'created_at',
            'updated_at',
            'published_at'
        ]
        read_only_fields = ['slug', 'author', 'created_at', 'updated_at', 'published_at']
