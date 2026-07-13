from rest_framework import permissions

class ArticlePermission(permissions.BasePermission):
    """
    Enforces HEALTH-02 role-based permissions for Articles:
    - Read published articles: All authenticated users
    - Read own drafts: Author or Admin
    - Create article: Verified Doctor or Admin
    - Edit/delete/publish/unpublish: Author if verified doctor, or Admin
    """
    def has_permission(self, request, view):
        # All actions require authentication
        if not (request.user and request.user.is_authenticated):
            return False
            
        # Create article (POST)
        if request.method == 'POST':
            # Check if admin
            if request.user.role == 'admin' or request.user.is_superuser:
                return True
            # Check if verified doctor
            if request.user.role == 'doctor' and hasattr(request.user, 'doctor_profile'):
                return request.user.doctor_profile.is_verified
            return False
            
        # Safe methods (GET, HEAD, OPTIONS) and other writes (PUT, PATCH, DELETE)
        # will be checked in has_object_permission
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Read actions
        if request.method in permissions.SAFE_METHODS:
            if obj.status == 'published':
                return True
            # Drafts can only be read by their author or admins
            return obj.author == user or user.role == 'admin' or user.is_superuser

        # Write actions (PUT, PATCH, DELETE)
        # Admin can edit or delete any article
        if user.role == 'admin' or user.is_superuser:
            return True

        # Verified doctor can edit/delete/publish/unpublish their own articles
        if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            is_verified = user.doctor_profile.is_verified
            return is_verified and (obj.author == user)

        return False
