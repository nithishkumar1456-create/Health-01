from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/doctors/', include('doctors.urls')),
    path('api/support/', include('support.urls')),
    path('api/queue/', include('queue_app.urls')),
]
