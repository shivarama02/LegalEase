from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LawInfoViewSet, ClientViewSet, LawyerViewSet

router = DefaultRouter()
router.register(r'laws', LawInfoViewSet, basename='laws')
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'lawyers', LawyerViewSet, basename='lawyers')

urlpatterns = [
    path('', include(router.urls)),
]
