from django.contrib import admin
from .models import LawInfo, Client, Lawyer

@admin.register(LawInfo)
class LawInfoAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'section_code')
    search_fields = ('title', 'category', 'section_code')
    list_filter = ('category',)

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('cname', 'email', 'phone', 'username', 'created_at')
    search_fields = ('cname', 'email', 'phone', 'username')
    list_filter = ('created_at',)

@admin.register(Lawyer)
class LawyerAdmin(admin.ModelAdmin):
    list_display = ('lname', 'specialization', 'location', 'experience_years', 'charge', 'email')
    list_filter = ('specialization', 'location')
    search_fields = ('lname', 'specialization', 'location', 'email')
