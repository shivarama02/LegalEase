from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class LawInfo(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    section_code = models.CharField(max_length=50, blank=True)
    short_description = models.TextField()
    detailed_description = models.TextField()
    source_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # added
    updated_at = models.DateTimeField(auto_now=True)      # added

    def __str__(self):
        return self.title  # ensure return

class Client(models.Model):
    user = models.OneToOneField(User, related_name='client_profile',
                                on_delete=models.CASCADE, null=True, blank=True)  # new
    cname = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    dob = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    username = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)   # added
    updated_at = models.DateTimeField(auto_now=True)       # added

    def __str__(self):
        return self.cname

class Lawyer(models.Model):
    user = models.OneToOneField(User, related_name='lawyer_profile',
                                on_delete=models.CASCADE, null=True, blank=True)  # new
    lname = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    specialization = models.CharField(max_length=120, blank=True)
    experience_years = models.IntegerField(default=0)
    location = models.CharField(max_length=150, blank=True)
    charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    username = models.CharField(max_length=100, unique=True)
    lawyer_id = models.CharField(max_length=30, unique=True, blank=True, null=True)
    # Directory/profile extras
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)  # e.g., 4.85
    reviews_count = models.PositiveIntegerField(default=0)
    languages = models.CharField(max_length=200, blank=True, help_text="Comma separated list")
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    photo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)   # added
    updated_at = models.DateTimeField(auto_now=True)       # added

    def __str__(self):
        return f"{self.lname} ({self.specialization})"

# New model for detailed law reference entries (separate from LawInfo summary cards)
class LawDetail(models.Model):
    CATEGORY_CHOICES = [
        ("consumer", "Consumer Protection"),
        ("ipc", "Criminal / IPC"),
        ("labour", "Labour / Employment"),
        ("family", "Family / Domestic"),
        ("cyber", "Cyber Crime"),
        ("property", "Property / Tenancy"),
        ("corporate", "Corporate / Company"),
        ("civil", "Civil Law"),
    ]
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    statute_name = models.CharField(max_length=255, blank=True)
    section_reference = models.CharField(max_length=100, blank=True)
    summary = models.TextField(help_text="Short structured summary")
    full_text = models.TextField(blank=True)
    penalties = models.TextField(blank=True, help_text="Penalties/punishments applicable, free text")
    related_sections = models.CharField(max_length=300, blank=True, help_text="Comma separated section codes")
    tags = models.CharField(max_length=300, blank=True, help_text="Comma separated tags")
    source_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'title']

    def __str__(self):
        return f"{self.title} - {self.category}"


class LawList(models.Model):
    """A curated or category-based list of laws.

    This model lets you group multiple LawDetail records under a single list
    (e.g., "Criminal Law" list), optionally tying it to a category key that
    matches LawDetail.CATEGORY_CHOICES.
    """
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    # Optional: tie to a category key from LawDetail
    category = models.CharField(max_length=30, blank=True)
    items = models.ManyToManyField('LawDetail', related_name='law_lists', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

# Complaint model capturing user-submitted complaints
class Complaint(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("reviewing", "Under Review"),
        ("closed", "Closed"),
    ]
    TYPE_CHOICES = [
        ("consumer", "Consumer Protection"),
        ("ipc", "Criminal / IPC"),
        ("labour", "Labour / Employment"),
        ("family", "Family / Domestic"),
        ("cyber", "Cyber Crime"),
        ("property", "Property / Tenancy"),
        ("corporate", "Corporate / Company"),
        ("other", "Other"),
    ]
    user = models.ForeignKey(User, related_name='complaints', on_delete=models.CASCADE)
    complaint_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    # Party details
    complainant_name = models.CharField(max_length=200)
    complainant_phone = models.CharField(max_length=20, blank=True)
    complainant_email = models.EmailField(blank=True)
    complainant_address = models.TextField(blank=True)
    respondent_name = models.CharField(max_length=200, blank=True)
    respondent_address = models.TextField(blank=True)
    # Incident details
    incident_date = models.DateField(blank=True, null=True)
    incident_location = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    damages_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    evidence_summary = models.TextField(blank=True, help_text="Textual description of evidence provided")
    relief_sought = models.TextField(blank=True)
    # Meta / system
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    assigned_lawyer = models.ForeignKey(Lawyer, related_name='assigned_complaints', on_delete=models.SET_NULL, blank=True, null=True)
    law_references = models.ManyToManyField(LawDetail, blank=True, related_name='complaints')
    # Optional JSON for flexible structured data (e.g., dynamic fields)
    extra_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.complaint_type})"

    def mark_submitted(self):
        self.status = 'submitted'
        self.save(update_fields=['status'])

    def close(self):
        self.status = 'closed'
        self.save(update_fields=['status'])

# Separate lightweight draft storage for generator stage before creating a full Complaint
class ComplaintDraft(models.Model):
    user = models.ForeignKey(User, related_name='complaint_drafts', on_delete=models.CASCADE)
    complaint_type = models.CharField(max_length=30, blank=True)
    title = models.CharField(max_length=255, blank=True)
    complainant_name = models.CharField(max_length=200, blank=True)
    complainant_phone = models.CharField(max_length=20, blank=True)
    complainant_email = models.EmailField(blank=True)
    complainant_address = models.TextField(blank=True)
    respondent_name = models.CharField(max_length=200, blank=True)
    respondent_address = models.TextField(blank=True)
    incident_date = models.DateField(blank=True, null=True)
    incident_location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    damages_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    evidence_summary = models.TextField(blank=True)
    relief_sought = models.TextField(blank=True)
    # For potential dynamic additions
    extra_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Draft #{self.id} - {self.title or 'Untitled'}"

# Appointments booked by users with basic details
class Appointment(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    user = models.ForeignKey(User, related_name='appointments', on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    case_type = models.CharField(max_length=100)
    lawyer_type = models.CharField(max_length=120, help_text="Type of lawyer/specialization needed")
    lawyer = models.ForeignKey(Lawyer, related_name='appointments', on_delete=models.SET_NULL, null=True, blank=True)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-appointment_date', '-appointment_time', '-created_at']

    def __str__(self):
        return f"{self.name} - {self.case_type} on {self.appointment_date} {self.appointment_time}"

# General user feedback for platform/app (optionally can reference a lawyer)
class Feedback(models.Model):
    FEEDBACK_TYPES = [
        ("lawyer_review", "Lawyer Review"),
        ("platform", "Platform Feedback"),
        ("assistant", "AI Assistant Feedback"),
        ("bug", "Bug Report"),
        ("feature", "Feature Request"),
        ("general", "General Inquiry"),
    ]

    user = models.ForeignKey(User, related_name='feedbacks', on_delete=models.SET_NULL, null=True, blank=True)
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPES)
    rating = models.PositiveSmallIntegerField(help_text="Overall rating 1-5")
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    # Optional linkage if feedback is about a specific lawyer
    lawyer = models.ForeignKey(Lawyer, related_name='feedbacks', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.feedback_type} - {self.rating} by {self.name}"
