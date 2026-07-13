from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone

class Article(models.Model):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    
    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (PUBLISHED, 'Published'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    summary = models.TextField(blank=True, default="")
    content = models.TextField()
    cover_image_url = models.URLField(max_length=500, blank=True, null=True)
    tags = models.CharField(
        max_length=255, 
        blank=True, 
        default="", 
        help_text="Comma-separated string of tags"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='articles'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Generate slug if empty
        if not self.slug:
            base_slug = slugify(self.title) or "article"
            slug = base_slug
            counter = 1
            # Query for uniqueness, ignoring current instance if updating
            queryset = Article.objects.all()
            if self.pk:
                queryset = queryset.exclude(pk=self.pk)
            
            while queryset.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
            
        # Set published_at when first transitioning to published
        if self.status == self.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        elif self.status == self.DRAFT:
            # If changed back to draft, we keep/clear published_at depending on design.
            # Usually, unpublishing might clear published_at or keep it. Let's clear it
            # so next publish updates the timestamp, or keep it. Let's clear it.
            self.published_at = None

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.status}) by {self.author.username}"
