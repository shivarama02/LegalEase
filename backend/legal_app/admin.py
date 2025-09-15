from django.contrib import admin
from .models import LawInfo

@admin.register(LawInfo)
class LawInfoAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'section_code')
    search_fields = ('title', 'category', 'section_code')
    list_filter = ('category',)

from .models import LawyerInfo

@admin.register(LawyerInfo)
class LawyerInfoAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialization', 'location', 'consultation_fee', 'is_verified')
    list_filter = ('specialization', 'location', 'is_verified')
    search_fields = ('full_name', 'specialization', 'location')
