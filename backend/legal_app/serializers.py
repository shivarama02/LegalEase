from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from django.db.models import Avg
from .models import Client, Lawyer, LawInfo, Complaint, LawDetail, ComplaintDraft, Appointment, Feedback, LawList


class LawInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawInfo
        fields = '__all__'


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            'id', 'user', 'cname', 'email', 'phone', 'dob', 'address', 'username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'username', 'created_at', 'updated_at']

    def validate_phone(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone must contain only digits")
        return value


class LawyerSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    rating = serializers.SerializerMethodField(read_only=True)
    reviews_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lawyer
        fields = [
            'id', 'full_name', 'lname', 'email', 'phone', 'specialization', 'experience_years',
            'location', 'charge', 'username', 'lawyer_id', 'rating', 'reviews_count', 'languages',
            'bio', 'is_verified', 'photo_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['rating', 'reviews_count', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        # If model later adds first/last name, adapt this.
        return obj.lname

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
                raise serializers.ValidationError('Invalid lawyer credentials')
        elif role == 'admin':
            # Simplistic: treat no admin model yet
            raise serializers.ValidationError('Admin auth not implemented')

        if hasattr(user_obj, 'password') and not check_password(password, user_obj.password):
            raise serializers.ValidationError('Invalid credentials')

        attrs['obj'] = user_obj
        return attrs


class LawDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawDetail
        fields = '__all__'
        # Note: includes 'penalties' TextField introduced for detailed punishments


class LawListSerializer(serializers.ModelSerializer):
    items = LawDetailSerializer(many=True, read_only=True)
    item_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=LawDetail.objects.all(), write_only=True, required=False, source='items'
    )

    class Meta:
        model = LawList
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'items', 'item_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ComplaintSerializer(serializers.ModelSerializer):
    law_references = LawDetailSerializer(many=True, read_only=True)
    law_reference_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=LawDetail.objects.all(), write_only=True, required=False, source='law_references'
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
    class Meta:
        model = Feedback
        fields = [
            'id', 'user', 'feedback_type', 'rating', 'name', 'email', 'subject', 'message', 'lawyer',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if not (1 <= int(value) <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value