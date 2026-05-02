from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LawDomainViewSet,
    LawCategoryViewSet,
    LawViewSet,
    LawSectionViewSet,
    LawSectionDetailViewSet,
    ClientViewSet,
    LawyerViewSet,
    ComplaintViewSet,
    ComplaintDraftViewSet,
    ClientSignupView,
    LawyerSignupView,
    SendOTPView,
    VerifyOTPView,
    check_lawyer_id,
    LoginView,
    chat_with_gemini,
    generate_complaint_pdf,
    AppointmentViewSet,
    list_case_types,
    FeedbackViewSet,
    create_or_get_chat_room,
    accept_chat_request,
    get_chat_messages,
    get_my_chat_rooms,
    clear_chat_messages,
    delete_chat_room,
    upload_lawyer_photo,
    lawyer_filter_options,
    upload_client_photo,
    NotificationViewSet,
    mark_notification_read,
    mark_all_notifications_read,
    notification_stats,
    broadcast_notification,
    unread_feedback_count,
)

router = DefaultRouter()
router.register(r'law-domains', LawDomainViewSet, basename='law-domains')
router.register(r'law-categories', LawCategoryViewSet, basename='law-categories')
router.register(r'laws', LawViewSet, basename='laws')
router.register(r'law-sections', LawSectionViewSet, basename='law-sections')
router.register(r'law-section-details', LawSectionDetailViewSet, basename='law-section-details')
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'lawyers', LawyerViewSet, basename='lawyers')
router.register(r'complaints', ComplaintViewSet, basename='complaints')
router.register(r'complaint-drafts', ComplaintDraftViewSet, basename='complaint-drafts')
router.register(r'appointments', AppointmentViewSet, basename='appointments')
router.register(r'feedbacks', FeedbackViewSet, basename='feedbacks')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('chat/create-room/<int:lawyer_id>/', create_or_get_chat_room, name='create_chat_room'),
    path('chat/accept/<int:room_id>/', accept_chat_request, name='accept_chat_request'),
    path('chat/messages/<int:room_id>/', get_chat_messages, name='get_chat_messages'),
    path('chat/messages/<int:room_id>/clear/', clear_chat_messages, name='clear_chat_messages'),
    path('chat/room/<int:room_id>/delete/', delete_chat_room, name='delete_chat_room'),
    path('chat/my-rooms/', get_my_chat_rooms, name='get_my_chat_rooms'),
    path('lawyers/<int:lawyer_id>/upload-photo/', upload_lawyer_photo, name='upload_lawyer_photo'),
    path('lawyers/filter-options/', lawyer_filter_options, name='lawyer_filter_options'),
    path('clients/<int:client_id>/upload-photo/', upload_client_photo, name='upload_client_photo'),
    # Place specific paths BEFORE including router to avoid being captured by router detail routes
    path('complaints/pdf/', generate_complaint_pdf, name='generate_complaint_pdf'),
    # Optional: support without trailing slash to avoid 301 on POST if APPEND_SLASH behavior varies
    path('complaints/pdf', generate_complaint_pdf),
    path('case-types/', list_case_types, name='case_types'),
    path('notifications/<int:notif_id>/read/', mark_notification_read, name='mark_notification_read'),
    path('notifications/read-all/', mark_all_notifications_read, name='mark_all_notifications_read'),
    path('notifications/stats/', notification_stats, name='notification_stats'),
    path('notifications/broadcast/', broadcast_notification, name='broadcast_notification'),
    path('feedbacks/unread-count/', unread_feedback_count, name='unread_feedback_count'),
    path('', include(router.urls)),
    path('auth/signup/user/', ClientSignupView.as_view()),
    path('auth/signup/lawyer/', LawyerSignupView.as_view()),
    path('auth/otp/send/', SendOTPView.as_view()),
    path('auth/otp/verify/', VerifyOTPView.as_view()),
    path('auth/lawyer-id/check/', check_lawyer_id),
    path('auth/login/', LoginView.as_view()),
    path('chat/ai/', chat_with_gemini, name='chat_with_gemini'),
]
