from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# ──────────────────────────────────────────
# LAW MODULE – Five-level hierarchy
# ──────────────────────────────────────────

class LawDomain(models.Model):
    domain_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'domain_name']

    def __str__(self):
        return self.domain_name


class LawCategory(models.Model):
    domain = models.ForeignKey(LawDomain, related_name='categories', on_delete=models.CASCADE)
    category_name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category_name']

    def __str__(self):
        return self.category_name


class Law(models.Model):
    category = models.ForeignKey(LawCategory, related_name='laws', on_delete=models.CASCADE)
    law_title = models.CharField(max_length=300)
    short_title = models.CharField(max_length=200, blank=True)
    enactment_year = models.PositiveIntegerField(blank=True, null=True)
    law_type = models.CharField(max_length=100, blank=True)
    authority = models.CharField(max_length=200, blank=True)
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['law_title']

    def __str__(self):
        return self.law_title


class LawSection(models.Model):
    law = models.ForeignKey(Law, related_name='sections', on_delete=models.CASCADE)
    section_number = models.CharField(max_length=50)
    section_title = models.CharField(max_length=300)
    chapter = models.CharField(max_length=200, blank=True)
    section_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['section_number']

    def __str__(self):
        return f"Section {self.section_number} – {self.section_title}"


class LawSectionDetail(models.Model):
    section = models.OneToOneField(LawSection, related_name='detail', on_delete=models.CASCADE)
    simplified_explanation = models.TextField(blank=True)
    offence_description = models.TextField(blank=True)
    imprisonment_term = models.CharField(max_length=300, blank=True)
    fine_amount = models.CharField(max_length=300, blank=True)
    compensation = models.TextField(blank=True)
    bailable_status = models.CharField(max_length=50, blank=True)
    cognizable_status = models.CharField(max_length=50, blank=True)
    example_scenario = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Details for {self.section}"


class EmailOTP(models.Model):
    email = models.EmailField(unique=True)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    used_for_signup = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP<{self.email}> verified={self.is_verified}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class PreVerifiedLawyer(models.Model):
    lawyer_id = models.CharField(max_length=30, unique=True)
    is_registered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['lawyer_id']

    def __str__(self):
        return f"{self.lawyer_id} (registered={self.is_registered})"

class Client(models.Model):
    user = models.OneToOneField(User, related_name='client_profile',
                                on_delete=models.CASCADE, null=True, blank=True)  # new
    cname = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    dob = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    username = models.CharField(max_length=100, unique=True)
    photo = models.ImageField(upload_to='client_photos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)   # added
    updated_at = models.DateTimeField(auto_now=True)       # added

    def __str__(self):
        return self.cname

class Lawyer(models.Model):
    user = models.OneToOneField(User, related_name='lawyer_profile',
                                on_delete=models.CASCADE, null=True, blank=True)  # new
    pre_verified_lawyer = models.OneToOneField(
        PreVerifiedLawyer,
        related_name='registered_lawyer',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
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
    photo = models.ImageField(upload_to='lawyer_photos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)   # added
    updated_at = models.DateTimeField(auto_now=True)       # added

    def __str__(self):
        return f"{self.lname} ({self.specialization})"

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
    complainant_id_proof = models.CharField(max_length=255, blank=True, default='')
    respondent_name = models.CharField(max_length=200, blank=True)
    respondent_phone = models.CharField(max_length=20, blank=True, default='')
    respondent_address = models.TextField(blank=True)
    # Incident details
    incident_date = models.DateField(blank=True, null=True)
    incident_time = models.TimeField(blank=True, null=True)
    incident_location = models.CharField(max_length=255, blank=True)
    police_station = models.CharField(max_length=255, blank=True, null=True)
    subject = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    damages_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    evidence_summary = models.TextField(blank=True, help_text="Textual description of evidence provided")
    relief_sought = models.TextField(blank=True)
    # Meta / system
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    assigned_lawyer = models.ForeignKey(Lawyer, related_name='assigned_complaints', on_delete=models.SET_NULL, blank=True, null=True)
    law_references = models.ManyToManyField(LawSection, blank=True, related_name='complaints')
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
    complainant_id_proof = models.CharField(max_length=255, blank=True, default='')
    respondent_name = models.CharField(max_length=200, blank=True)
    respondent_phone = models.CharField(max_length=20, blank=True, default='')
    respondent_address = models.TextField(blank=True)
    incident_date = models.DateField(blank=True, null=True)
    incident_time = models.TimeField(blank=True, null=True)
    incident_location = models.CharField(max_length=255, blank=True)
    police_station = models.CharField(max_length=255, blank=True, null=True)
    subject = models.CharField(max_length=255, blank=True, null=True)
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
        ("accepted", "Accepted"),
        ("rescheduled", "Rescheduled"),
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
    name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True, default='')
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


# ──────────────────────────────────────────
# CHAT SYSTEM
# ──────────────────────────────────────────

class ChatRoom(models.Model):
    """One unique room per Client (Django User) ↔ Lawyer pair.

    Lifecycle:  pending → active
      pending : user sent a chat request, waiting for lawyer to accept.
      active  : lawyer accepted — messaging is enabled.
    The room id is permanent (unique_together ensures one room per pair forever).
    """
    STATUS_PENDING = 'pending'
    STATUS_ACTIVE  = 'active'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACTIVE,  'Active'),
    ]

    client = models.ForeignKey(
        User,
        related_name='chat_rooms_as_client',
        on_delete=models.CASCADE,
    )
    lawyer = models.ForeignKey(
        'Lawyer',
        related_name='chat_rooms_as_lawyer',
        on_delete=models.CASCADE,
    )
    # Denormalised preview shown in the conversation list
    last_message = models.TextField(blank=True, default='')
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('client', 'lawyer')
        ordering = ['-last_message_at', '-id']

    def __str__(self):
        return f"Room {self.id}: {self.client.username} ↔ {self.lawyer.lname}"


class ChatMessage(models.Model):
    """Individual message inside a ChatRoom."""
    room = models.ForeignKey(
        ChatRoom,
        related_name='messages',
        on_delete=models.CASCADE,
    )
    sender = models.ForeignKey(
        User,
        related_name='sent_chat_messages',
        on_delete=models.CASCADE,
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Msg {self.id} in Room {self.room_id} by {self.sender.username}"


# ──────────────────────────────────────────
# NOTIFICATION SYSTEM
# ──────────────────────────────────────────

class Notification(models.Model):
    NOTIF_TYPES = [
        ('appointment', 'Appointment'),
        ('feedback', 'Feedback'),
        ('chat', 'Chat'),
        ('system', 'System'),
        ('verification', 'Verification'),
        ('reminder', 'Reminder'),
    ]

    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIF_TYPES, default='system')
    is_read = models.BooleanField(default=False)
    related_id = models.PositiveIntegerField(null=True, blank=True, help_text="Optional ID of related object")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.title} → {self.user.username}"


# ──────────────────────────────────────────
# CONTACT / QUERIES
# ──────────────────────────────────────────

class ContactQuery(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]

    user = models.ForeignKey(User, related_name='contact_queries', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_notes = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} ({self.email})"
