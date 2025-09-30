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
)

router = DefaultRouter()
router.register(r'laws', LawInfoViewSet, basename='laws')
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'lawyers', LawyerViewSet, basename='lawyers')
router.register(r'lawdetails', LawDetailViewSet, basename='lawdetails')
router.register(r'complaints', ComplaintViewSet, basename='complaints')
router.register(r'complaint-drafts', ComplaintDraftViewSet, basename='complaint-drafts')
router.register(r'appointments', AppointmentViewSet, basename='appointments')

urlpatterns = [
    # Place specific paths BEFORE including router to avoid being captured by router detail routes
    path('complaints/pdf/', generate_complaint_pdf, name='generate_complaint_pdf'),
    # Optional: support without trailing slash to avoid 301 on POST if APPEND_SLASH behavior varies
    path('complaints/pdf', generate_complaint_pdf),
    path('case-types/', list_case_types, name='case_types'),
    path('', include(router.urls)),
    path('auth/signup/user/', ClientSignupView.as_view()),
    path('auth/signup/lawyer/', LawyerSignupView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('chat/', chat_with_gemini, name='chat_with_gemini'),
]
