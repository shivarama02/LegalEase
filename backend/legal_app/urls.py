from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LawInfoViewSet,
    ClientViewSet,
    LawyerViewSet,
    LawDetailViewSet,
    ComplaintViewSet,
    ComplaintDraftViewSet,
    ClientSignupView,
    LawyerSignupView,
    LoginView,
    chat_with_gemini,
    generate_complaint_pdf,
    AppointmentViewSet,
    list_case_types,
    FeedbackViewSet,
    LawListViewSet,
    create_or_get_chat_room,
    accept_chat_request,
    get_chat_messages,
    get_my_chat_rooms,
    clear_chat_messages,
    delete_chat_room,
    upload_lawyer_photo,
    lawyer_filter_options,
    upload_client_photo,
)

router = DefaultRouter()
router.register(r'laws', LawInfoViewSet, basename='laws')
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'lawyers', LawyerViewSet, basename='lawyers')
router.register(r'lawdetails', LawDetailViewSet, basename='lawdetails')
router.register(r'complaints', ComplaintViewSet, basename='complaints')
router.register(r'complaint-drafts', ComplaintDraftViewSet, basename='complaint-drafts')
router.register(r'appointments', AppointmentViewSet, basename='appointments')
router.register(r'feedbacks', FeedbackViewSet, basename='feedbacks')
router.register(r'lawlists', LawListViewSet, basename='lawlists')

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
    path('', include(router.urls)),
    path('auth/signup/user/', ClientSignupView.as_view()),
    path('auth/signup/lawyer/', LawyerSignupView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('chat/ai/', chat_with_gemini, name='chat_with_gemini'),
]
