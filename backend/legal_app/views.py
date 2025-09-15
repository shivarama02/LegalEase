from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import LawInfo, Client, Lawyer
from .serializers import LawInfoSerializer, ClientSerializer, LawyerSerializer


class LawInfoViewSet(viewsets.ModelViewSet):
    queryset = LawInfo.objects.all().order_by('id')
    serializer_class = LawInfoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'category', 'section_code']
    ordering_fields = ['title', 'category']


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['cname', 'email', 'phone', 'username']
    filterset_fields = ['dob']


class LawyerViewSet(viewsets.ModelViewSet):
    queryset = Lawyer.objects.all().order_by('-created_at')
    serializer_class = LawyerSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['lname', 'email', 'specialization', 'location']
    filterset_fields = ['specialization', 'location']
    ordering_fields = ['experience_years', 'charge']
