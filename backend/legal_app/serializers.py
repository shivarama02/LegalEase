from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from django.db.models import Avg
from .models import Client, Lawyer, Complaint, ComplaintDraft, Appointment, Feedback, ChatRoom, ChatMessage, Notification, LawDomain, LawCategory, Law, LawSection, LawSectionDetail


# ──────────────────────────────────────────
# LAW MODULE SERIALIZERS
# ──────────────────────────────────────────

class LawSectionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawSectionDetail
        fields = '__all__'


class LawSectionSerializer(serializers.ModelSerializer):
    detail = LawSectionDetailSerializer(read_only=True)

    class Meta:
        model = LawSection
        fields = '__all__'


class LawSerializer(serializers.ModelSerializer):
    sections_count = serializers.IntegerField(source='sections.count', read_only=True)

    class Meta:
        model = Law
        fields = '__all__'


class LawCategorySerializer(serializers.ModelSerializer):
    laws_count = serializers.IntegerField(source='laws.count', read_only=True)
    domain_name = serializers.CharField(source='domain.domain_name', read_only=True)

    class Meta:
        model = LawCategory
        fields = '__all__'


class LawDomainSerializer(serializers.ModelSerializer):
    categories = LawCategorySerializer(many=True, read_only=True)

    class Meta:
        model = LawDomain
        fields = '__all__'


class ClientSerializer(serializers.ModelSerializer):
    photo_full_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'user', 'cname', 'email', 'phone', 'dob', 'address', 'username',
            'photo', 'photo_full_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'username', 'created_at', 'updated_at']

    def get_photo_full_url(self, obj):
        request = self.context.get('request')
        if obj.photo and hasattr(obj.photo, 'url'):
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return ''

    def validate_phone(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone must contain only digits")
        return value


class LawyerSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    rating = serializers.SerializerMethodField(read_only=True)
    reviews_count = serializers.SerializerMethodField(read_only=True)
    # Django User ID — used by the frontend for presence tracking
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    photo_full_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lawyer
        fields = [
            'id', 'user_id', 'full_name', 'lname', 'email', 'phone', 'specialization',
            'experience_years', 'location', 'charge', 'username', 'lawyer_id',
            'rating', 'reviews_count', 'languages', 'bio', 'is_verified',
            'photo_url', 'photo', 'photo_full_url', 'created_at', 'updated_at',
        ]
        read_only_fields = ['rating', 'reviews_count', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        # If model later adds first/last name, adapt this.
        return obj.lname

    def get_photo_full_url(self, obj):
        """Return absolute URL for the uploaded photo, or fall back to photo_url."""
        request = self.context.get('request')
        if obj.photo and hasattr(obj.photo, 'url'):
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return obj.photo_url or ''

    def validate_experience_years(self, value):
        if value < 0:
            raise serializers.ValidationError("experience_years cannot be negative")
        return value

    def get_rating(self, obj):
        # Compute from Feedback entries linked to this lawyer
        try:
            agg = Feedback.objects.filter(lawyer=obj).aggregate(avg=Avg('rating'))
            if agg and agg.get('avg') is not None:
                return round(float(agg['avg']), 2)
        except Exception:
            pass
        return float(obj.rating) if obj.rating is not None else 0.0

    def get_reviews_count(self, obj):
        try:
            return Feedback.objects.filter(lawyer=obj).count()
        except Exception:
            return int(obj.reviews_count or 0)


class ClientSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Client
        fields = ['cname', 'email', 'phone', 'username', 'password']

    def create(self, validated_data):
        pwd = validated_data.pop('password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=pwd
        )
        client = Client.objects.create(user=user, **validated_data)
        Token.objects.get_or_create(user=user)
        return client


class LawyerSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Lawyer
        fields = ['lname', 'email', 'phone', 'specialization', 'experience_years',
                  'location', 'charge', 'username', 'lawyer_id', 'password']

    def create(self, validated_data):
        pwd = validated_data.pop('password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=pwd
        )
        lawyer = Lawyer.objects.create(user=user, **validated_data)
        Token.objects.get_or_create(user=user)
        return lawyer


class LoginSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['user', 'lawyer'])
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        role = attrs['role']
        identifier = attrs['identifier']
        password = attrs['password']
        user_obj = None
        if role == 'user':
            try:
                user_obj = Client.objects.get(username=identifier)
            except Client.DoesNotExist:
                raise serializers.ValidationError('Invalid username or password')
        elif role == 'lawyer':
            try:
                # allow login via lawyer_id or username
                try:
                    user_obj = Lawyer.objects.get(lawyer_id=identifier)
                except Lawyer.DoesNotExist:
                    user_obj = Lawyer.objects.get(username=identifier)
            except Lawyer.DoesNotExist:
                # Allow superuser / staff login through the lawyer form
                from django.contrib.auth.models import User as AuthUser
                try:
                    admin_user = AuthUser.objects.get(username=identifier, is_staff=True)
                    attrs['obj'] = admin_user
                    attrs['is_admin'] = True
                    return attrs
                except AuthUser.DoesNotExist:
                    raise serializers.ValidationError('Invalid lawyer credentials')

        if hasattr(user_obj, 'password') and not check_password(password, user_obj.password):
            raise serializers.ValidationError('Invalid credentials')

        attrs['obj'] = user_obj
        return attrs


class ComplaintSerializer(serializers.ModelSerializer):
    law_references = LawSectionSerializer(many=True, read_only=True)
    law_reference_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=LawSection.objects.all(), write_only=True, required=False, source='law_references'
    )
    class Meta:
        model = Complaint
        fields = [
            'id','user','complaint_type','title','complainant_name','complainant_phone','complainant_email','complainant_address',
            'respondent_name','respondent_address','incident_date','incident_location','description','damages_amount',
            'evidence_summary','relief_sought','status','assigned_lawyer','law_references','law_reference_ids','extra_data',
            'created_at','updated_at'
        ]
        read_only_fields = ['status','created_at','updated_at','user']

    def create(self, validated_data):
        # user injected from view
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

class ComplaintDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintDraft
        fields = [
            'id','user','complaint_type','title','complainant_name','complainant_phone','complainant_email','complainant_address',
            'respondent_name','respondent_address','incident_date','incident_location','description','damages_amount',
            'evidence_summary','relief_sought','extra_data','created_at','updated_at'
        ]
        read_only_fields = ['user','created_at','updated_at']

    def create(self, validated_data):
        return super().create(validated_data)

    def validate(self, attrs):
        # Coerce empty strings to None for nullable fields
        if attrs.get('incident_date') in ['', None]:
            attrs['incident_date'] = None
        dmg = attrs.get('damages_amount')
        if dmg in ['', None]:
            attrs['damages_amount'] = None
        return attrs


class AppointmentSerializer(serializers.ModelSerializer):
    lawyer_name = serializers.SerializerMethodField(read_only=True)
    lawyer_specialization = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'user', 'name', 'email', 'case_type', 'lawyer_type', 'lawyer',
            'appointment_date', 'appointment_time', 'status', 'notes', 'lawyer_name', 'lawyer_specialization',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_lawyer_name(self, obj):
        return getattr(obj.lawyer, 'lname', None) if obj.lawyer_id else None

    def get_lawyer_specialization(self, obj):
        return getattr(obj.lawyer, 'specialization', None) if obj.lawyer_id else None


class FeedbackSerializer(serializers.ModelSerializer):
    lawyer_name = serializers.SerializerMethodField(read_only=True)
    lawyer_specialization = serializers.SerializerMethodField(read_only=True)
    client_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Feedback
        fields = [
            'id', 'user', 'feedback_type', 'rating', 'name', 'email', 'subject', 'message', 'lawyer',
            'lawyer_name', 'lawyer_specialization', 'client_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True},
        }

    def get_lawyer_name(self, obj):
        return obj.lawyer.lname if obj.lawyer else None

    def get_lawyer_specialization(self, obj):
        return obj.lawyer.specialization if obj.lawyer else None

    def get_client_name(self, obj):
        if obj.user and hasattr(obj.user, 'client_profile'):
            return obj.user.client_profile.cname
        return obj.name or (obj.user.get_full_name() if obj.user else None)

    def validate_rating(self, value):
        if not (1 <= int(value) <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value


# ──────────────────────────────────────────
# NOTIFICATION SERIALIZER
# ──────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'title', 'message', 'notification_type',
            'is_read', 'related_id', 'created_at', 'time_ago',
        ]
        read_only_fields = ['user', 'created_at']

    def get_time_ago(self, obj):
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        seconds = diff.total_seconds()
        if seconds < 60:
            return 'Just now'
        minutes = int(seconds // 60)
        if minutes < 60:
            return f'{minutes}m ago'
        hours = int(minutes // 60)
        if hours < 24:
            return f'{hours}h ago'
        days = int(hours // 24)
        if days < 7:
            return f'{days}d ago'
        weeks = int(days // 7)
        return f'{weeks}w ago'


# ──────────────────────────────────────────
# CHAT SERIALIZERS
# ──────────────────────────────────────────

class ChatRoomSerializer(serializers.ModelSerializer):
    # Lawyer side fields
    lawyer_name    = serializers.CharField(source='lawyer.lname', read_only=True)
    lawyer_id      = serializers.IntegerField(source='lawyer.id', read_only=True)
    # Django User ID of the lawyer (needed for presence tracking on the frontend)
    lawyer_user_id = serializers.IntegerField(source='lawyer.user.id', read_only=True)

    # Client side fields
    client_id    = serializers.IntegerField(source='client.id', read_only=True)
    client_name  = serializers.SerializerMethodField()
    client_email = serializers.EmailField(source='client.email', read_only=True)

    class Meta:
        model  = ChatRoom
        fields = [
            'id', 'status',
            'client_id', 'client_name', 'client_email',
            'lawyer_id', 'lawyer_user_id', 'lawyer_name',
            'last_message', 'last_message_at',
            'created_at',  'updated_at',
        ]

    def get_client_name(self, obj):
        """Prefer Client profile cname, then Django full_name, then username."""
        if hasattr(obj.client, 'client_profile') and obj.client.client_profile.cname:
            return obj.client.client_profile.cname
        full = obj.client.get_full_name()
        return full or obj.client.username


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_id   = serializers.IntegerField(source='sender.id', read_only=True)
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()
    # Convenience flag: True when the requesting user is the sender
    is_me       = serializers.SerializerMethodField()

    class Meta:
        model  = ChatMessage
        fields = [
            'id', 'room',
            'sender_id', 'sender_name', 'sender_role',
            'message', 'is_read', 'is_me',
            'created_at',
        ]
        read_only_fields = ['created_at']

    def get_sender_name(self, obj):
        u = obj.sender
        if hasattr(u, 'lawyer_profile'):
            return u.lawyer_profile.lname
        if hasattr(u, 'client_profile'):
            return u.client_profile.cname
        return u.get_full_name() or u.username

    def get_sender_role(self, obj):
        u = obj.sender
        if hasattr(u, 'lawyer_profile'):
            return 'lawyer'
        if hasattr(u, 'client_profile'):
            return 'client'
        return 'unknown'

    def get_is_me(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender_id == request.user.id
        return False
