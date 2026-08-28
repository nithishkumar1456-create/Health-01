from django.urls import path
from .views import (
    BookQueueTokenView,
    QueueEntryStatusView,
    CancelQueueEntryView,
    MyQueueEntriesView,
    DoctorTodayQueueView,
    DoctorCallNextView,
    CompleteQueueEntryView,
    NoShowQueueEntryView,
    PauseQueueView,
    ResumeQueueView,
)

urlpatterns = [
    # Client endpoints
    path('book/', BookQueueTokenView.as_view(), name='queue_book'),
    path('my-entries/', MyQueueEntriesView.as_view(), name='queue_my_entries'),
    path('entries/<int:pk>/status/', QueueEntryStatusView.as_view(), name='queue_entry_status'),
    path('entries/<int:pk>/cancel/', CancelQueueEntryView.as_view(), name='queue_entry_cancel'),
    path('entries/<int:pk>/complete/', CompleteQueueEntryView.as_view(), name='queue_entry_complete'),
    path('entries/<int:pk>/no-show/', NoShowQueueEntryView.as_view(), name='queue_entry_no_show'),

    # Doctor endpoints
    path('doctor/today/', DoctorTodayQueueView.as_view(), name='queue_doctor_today'),
    path('doctor/call-next/', DoctorCallNextView.as_view(), name='queue_call_next'),
    path('doctor/pause/', PauseQueueView.as_view(), name='queue_pause'),
    path('doctor/resume/', ResumeQueueView.as_view(), name='queue_resume'),
]
