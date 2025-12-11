from django.contrib import admin
from .models import LawInfo, Client, Lawyer, Feedback, LawList

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


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('feedback_type', 'rating', 'name', 'email', 'lawyer', 'created_at')
    list_filter = ('feedback_type', 'rating', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')


@admin.register(LawList)
class LawListAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'category', 'created_at')
    search_fields = ('title', 'slug', 'description', 'category')


