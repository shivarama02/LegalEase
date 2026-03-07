from django.contrib import admin
from .models import Client, Lawyer, Feedback, LawDomain, LawCategory, Law, LawSection, LawSectionDetail

@admin.register(LawDomain)
class LawDomainAdmin(admin.ModelAdmin):
    list_display = ('domain_name', 'display_order', 'created_at')
    search_fields = ('domain_name',)

@admin.register(LawCategory)
class LawCategoryAdmin(admin.ModelAdmin):
    list_display = ('category_name', 'domain', 'slug', 'created_at')
    search_fields = ('category_name', 'slug')
    list_filter = ('domain',)

@admin.register(Law)
class LawAdmin(admin.ModelAdmin):
    list_display = ('law_title', 'category', 'enactment_year', 'law_type')
    search_fields = ('law_title', 'short_title')
    list_filter = ('category', 'law_type')

@admin.register(LawSection)
class LawSectionAdmin(admin.ModelAdmin):
    list_display = ('section_number', 'section_title', 'law', 'chapter')
    search_fields = ('section_number', 'section_title')
    list_filter = ('law',)

@admin.register(LawSectionDetail)
class LawSectionDetailAdmin(admin.ModelAdmin):
    list_display = ('section', 'bailable_status', 'cognizable_status', 'last_updated')
    search_fields = ('simplified_explanation', 'offence_description')

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


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('feedback_type', 'rating', 'name', 'email', 'lawyer', 'created_at')
    list_filter = ('feedback_type', 'rating', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')


