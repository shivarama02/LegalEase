from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from io import BytesIO

from .models import Client, Lawyer, Complaint, ComplaintDraft, Appointment, Feedback, ChatRoom, ChatMessage, Notification, LawDomain, LawCategory, Law, LawSection, LawSectionDetail
from .serializers import (
    ClientSerializer,
    LawyerSerializer,
    ClientSignupSerializer,
    LawyerSignupSerializer,
    LoginSerializer,
    ComplaintSerializer,
    ComplaintDraftSerializer,
    AppointmentSerializer,
    FeedbackSerializer,
    ChatRoomSerializer,
    ChatMessageSerializer,
    NotificationSerializer,
    LawDomainSerializer,
    LawCategorySerializer,
    LawSerializer,
    LawSectionSerializer,
    LawSectionDetailSerializer,
)
from legal_backend.openrouter_client import get_gemini_response   # switched from gemini_client


def _ensure_all_rooms(user):
    """
    Idempotently create a ChatRoom for every (client_user, lawyer) pair
    that involves this user.  Called on signup and login so the frontend
    never has to manually create rooms.
    """
    if hasattr(user, 'lawyer_profile'):
        # Lawyer logging in / signing up → pair with every client user
        lawyer = user.lawyer_profile
        client_users = User.objects.filter(
            client_profile__isnull=False
        ).exclude(id=user.id)
        for cu in client_users:
            ChatRoom.objects.get_or_create(client=cu, lawyer=lawyer)
    else:
        # Client user logging in / signing up → pair with every lawyer
        for lawyer in Lawyer.objects.select_related('user').all():
            ChatRoom.objects.get_or_create(client=user, lawyer=lawyer)


class LawDomainViewSet(viewsets.ModelViewSet):
    queryset = LawDomain.objects.prefetch_related('categories').all()
    serializer_class = LawDomainSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['domain_name', 'description']


class LawCategoryViewSet(viewsets.ModelViewSet):
    queryset = LawCategory.objects.select_related('domain').all()
    serializer_class = LawCategorySerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['category_name', 'description']
    filterset_fields = ['domain', 'slug']


class LawViewSet(viewsets.ModelViewSet):
    queryset = Law.objects.select_related('category').all()
    serializer_class = LawSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['law_title', 'short_title', 'summary']
    filterset_fields = ['category']


class LawSectionViewSet(viewsets.ModelViewSet):
    queryset = LawSection.objects.select_related('detail').all()
    serializer_class = LawSectionSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['section_number', 'section_title', 'chapter']
    filterset_fields = ['law']


class LawSectionDetailViewSet(viewsets.ModelViewSet):
    queryset = LawSectionDetail.objects.select_related('section').all()
    serializer_class = LawSectionDetailSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['simplified_explanation', 'offence_description']


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['cname', 'email', 'phone', 'username']
    filterset_fields = ['dob']
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user if self.request.user.is_authenticated else None
        if not user:
            return qs.none()
        # Admin / staff can see all clients
        if getattr(user, 'is_staff', False):
            return qs
        # Ensure the authenticated user's Client profile is linked
        existing = qs.filter(user=user).first()
        if not existing:
            # Try to find an unlinked profile by username or email and attach it
            linked = None
            try:
                linked = Client.objects.get(username=user.username)
            except Client.DoesNotExist:
                if getattr(user, 'email', None):
                    try:
                        linked = Client.objects.get(email=user.email)
                    except Client.DoesNotExist:
                        linked = None
            if linked and (linked.user_id is None):
                linked.user = user
                linked.save(update_fields=['user'])
            elif (not linked) or (linked and linked.user_id != user.id):
                # As a last resort, auto-create a minimal client profile for this user
                # Ensure unique, valid placeholders for required unique fields
                uname = user.username or f"user{user.id}"
                # Construct a unique synthetic email if missing or already taken
                email_candidate = user.email or f"{uname}+{user.id}@example.local"
                if Client.objects.filter(email=email_candidate).exists():
                    email_candidate = f"{uname}+{user.id}@example.local"
                # Unique numeric phone within 15 chars
                phone_candidate = f"000000{user.id}"
                phone_candidate = phone_candidate[:15]
                # If collision, append last digits of id
                i = 0
                while Client.objects.filter(phone=phone_candidate).exists():
                    i += 1
                    suffix = str(i)
                    phone_candidate = (f"000000{user.id}" + suffix)[:15]
                Client.objects.create(
                    user=user,
                    cname=getattr(user, 'get_full_name', lambda: '')() or uname,
                    email=email_candidate,
                    phone=phone_candidate,
                    username=uname,
                )
        # Only expose the authenticated user's client profile
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_client_photo(request, client_id):
    """Upload or replace the profile photo for a client."""
    try:
        client = Client.objects.select_related('user').get(id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=404)
    if client.user != request.user:
        return Response({'error': 'Unauthorized'}, status=403)
    photo_file = request.FILES.get('photo')
    if not photo_file:
        return Response({'error': 'No photo file provided'}, status=400)
    if client.photo:
        client.photo.delete(save=False)
    client.photo = photo_file
    client.save(update_fields=['photo'])
    serializer = ClientSerializer(client, context={'request': request})
    return Response(serializer.data)


class LawyerFilter(django_filters.FilterSet):
    specialization = django_filters.CharFilter(field_name='specialization', lookup_expr='iexact')
    location = django_filters.CharFilter(field_name='location', lookup_expr='iexact')
    is_verified = django_filters.BooleanFilter(field_name='is_verified')

    class Meta:
        model = Lawyer
        fields = ['specialization', 'location', 'is_verified']


class LawyerViewSet(viewsets.ModelViewSet):
    queryset = Lawyer.objects.all().order_by('-rating', '-reviews_count', '-experience_years')
    serializer_class = LawyerSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['lname', 'email', 'specialization', 'location', 'languages']
    filterset_class = LawyerFilter
    ordering_fields = ['experience_years', 'charge', 'rating', 'reviews_count']


@api_view(['GET'])
@permission_classes([AllowAny])
def lawyer_filter_options(request):
    """Return distinct non-empty specializations and locations from the Lawyer table."""
    specs = (
        Lawyer.objects.exclude(specialization='')
        .values_list('specialization', flat=True)
        .distinct()
        .order_by('specialization')
    )
    locs = (
        Lawyer.objects.exclude(location='')
        .values_list('location', flat=True)
        .distinct()
        .order_by('location')
    )
    return Response({
        'specializations': list(specs),
        'locations': list(locs),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_lawyer_photo(request, lawyer_id):
    """Upload or replace the profile photo for a lawyer. Only the lawyer themselves can do this."""
    try:
        lawyer = Lawyer.objects.select_related('user').get(id=lawyer_id)
    except Lawyer.DoesNotExist:
        return Response({'error': 'Lawyer not found'}, status=404)

    if lawyer.user != request.user:
        return Response({'error': 'Unauthorized'}, status=403)

    photo_file = request.FILES.get('photo')
    if not photo_file:
        return Response({'error': 'No photo file provided'}, status=400)

    # Delete old file if exists
    if lawyer.photo:
        lawyer.photo.delete(save=False)

    lawyer.photo = photo_file
    lawyer.save(update_fields=['photo'])
    serializer = LawyerSerializer(lawyer, context={'request': request})
    return Response(serializer.data)



class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().select_related('user', 'assigned_lawyer').order_by('-created_at')
    serializer_class = ComplaintSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'complainant_name', 'respondent_name', 'complaint_type']
    filterset_fields = ['complaint_type', 'status']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user if self.request.user.is_authenticated else None
        if not user:
            return qs.none()
        if getattr(user, 'is_staff', False):
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ComplaintDraftViewSet(viewsets.ModelViewSet):
    queryset = ComplaintDraft.objects.all().select_related('user').order_by('-updated_at')
    serializer_class = ComplaintDraftSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'complainant_name', 'respondent_name', 'complaint_type']
    filterset_fields = ['complaint_type']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user if self.request.user.is_authenticated else None
        if user:
            return qs.filter(user=user)
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().select_related('user', 'lawyer', 'lawyer__user').order_by('-appointment_date', '-appointment_time')
    serializer_class = AppointmentSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'email', 'case_type', 'lawyer_type', 'status']
    filterset_fields = ['status', 'case_type', 'lawyer_type', 'appointment_date']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user if self.request.user.is_authenticated else None
        if not user:
            return qs.none()
        if getattr(user, 'is_staff', False):
            return qs
        # Lawyers see appointments assigned to them
        if hasattr(user, 'lawyer_profile'):
            return qs.filter(lawyer=user.lawyer_profile)
        return qs.filter(user=user)

    def perform_create(self, serializer):
        appointment = serializer.save(user=self.request.user)
        # Notify the assigned lawyer about new appointment
        if appointment.lawyer and appointment.lawyer.user:
            Notification.objects.create(
                user=appointment.lawyer.user,
                title='New Appointment Request',
                message=f'{appointment.name} has booked a {appointment.case_type} appointment on {appointment.appointment_date}.',
                notification_type='appointment',
                related_id=appointment.id,
            )

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        old_date = serializer.instance.appointment_date
        appointment = serializer.save()
        new_status = appointment.status
        user = self.request.user
        is_lawyer = hasattr(user, 'lawyer_profile')

        # Lawyer changed status → notify the user
        if is_lawyer and old_status != new_status:
            if new_status == 'accepted':
                Notification.objects.create(
                    user=appointment.user,
                    title='Appointment Accepted',
                    message=f'Your {appointment.case_type} appointment on {appointment.appointment_date} has been accepted by the lawyer.',
                    notification_type='appointment',
                    related_id=appointment.id,
                )
            elif new_status == 'cancelled':
                Notification.objects.create(
                    user=appointment.user,
                    title='Appointment Cancelled',
                    message=f'Your {appointment.case_type} appointment on {appointment.appointment_date} has been cancelled by the lawyer.',
                    notification_type='appointment',
                    related_id=appointment.id,
                )
            elif new_status == 'rescheduled':
                Notification.objects.create(
                    user=appointment.user,
                    title='Appointment Rescheduled',
                    message=f'Your {appointment.case_type} appointment has been rescheduled to {appointment.appointment_date}.',
                    notification_type='appointment',
                    related_id=appointment.id,
                )
            elif new_status == 'completed':
                Notification.objects.create(
                    user=appointment.user,
                    title='Appointment Completed',
                    message=f'Your {appointment.case_type} appointment on {appointment.appointment_date} has been marked as completed.',
                    notification_type='appointment',
                    related_id=appointment.id,
                )

        # User changed status → notify the lawyer
        if not is_lawyer and appointment.lawyer and appointment.lawyer.user:
            if old_status != new_status:
                if new_status == 'cancelled':
                    Notification.objects.create(
                        user=appointment.lawyer.user,
                        title='Appointment Cancelled by Client',
                        message=f'{appointment.name} has cancelled the {appointment.case_type} appointment on {appointment.appointment_date}.',
                        notification_type='appointment',
                        related_id=appointment.id,
                    )
                elif new_status == 'rescheduled':
                    Notification.objects.create(
                        user=appointment.lawyer.user,
                        title='Appointment Rescheduled by Client',
                        message=f'{appointment.name} has rescheduled the {appointment.case_type} appointment to {appointment.appointment_date}.',
                        notification_type='appointment',
                        related_id=appointment.id,
                    )


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().select_related('user', 'lawyer').order_by('-created_at')
    serializer_class = FeedbackSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'email', 'subject', 'message']
    filterset_fields = ['feedback_type', 'rating', 'lawyer']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user if self.request.user.is_authenticated else None
        if not user:
            return qs.none()
        if getattr(user, 'is_staff', False):
            return qs
        # Lawyers can see feedback addressed to them
        if hasattr(user, 'lawyer_profile'):
            return qs.filter(lawyer=user.lawyer_profile)
        # Regular users see only their own feedback
        return qs.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user
        # Auto-fill name and email from the user's profile
        name = ''
        email = user.email or ''
        if hasattr(user, 'client_profile'):
            name = user.client_profile.cname or ''
            email = email or user.client_profile.email or ''
        elif hasattr(user, 'lawyer_profile'):
            name = user.lawyer_profile.lname or ''
            email = email or user.lawyer_profile.email or ''
        save_kwargs = {'user': user}
        if not serializer.validated_data.get('name'):
            save_kwargs['name'] = name
        if not serializer.validated_data.get('email'):
            save_kwargs['email'] = email
        feedback = serializer.save(**save_kwargs)
        # Notify the lawyer when they receive a review
        if feedback.lawyer and feedback.lawyer.user and feedback.feedback_type == 'lawyer_review':
            Notification.objects.create(
                user=feedback.lawyer.user,
                title='New Review Received',
                message=f'{feedback.name or "A user"} left a {feedback.rating}-star review for you.',
                notification_type='feedback',
                related_id=feedback.id,
            )


class ClientSignupView(APIView):
    def post(self, request):
        ser = ClientSignupSerializer(data=request.data)
        if ser.is_valid():
            client = ser.save()
            token = Token.objects.get(user=client.user)
            return Response({'id': client.id, 'token': token.key}, status=201)
        return Response(ser.errors, status=400)


class LawyerSignupView(APIView):
    def post(self, request):
        ser = LawyerSignupSerializer(data=request.data)
        if ser.is_valid():
            lawyer = ser.save()
            token = Token.objects.get(user=lawyer.user)
            return Response({'id': lawyer.id, 'token': token.key}, status=201)
        return Response(ser.errors, status=400)


class LoginView(APIView):
    def post(self, request):
        ser = LoginSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        data = ser.validated_data
        user = authenticate(username=data['identifier'], password=data['password'])
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=400)
        token, _ = Token.objects.get_or_create(user=user)
        # Superuser / staff → admin role
        if user.is_staff or user.is_superuser:
            return Response({'token': token.key, 'role': 'admin', 'user_id': user.id}, status=200)
        role = 'user'
        if hasattr(user, 'lawyer_profile'):
            role = 'lawyer'
        return Response({'token': token.key, 'role': role, 'user_id': user.id}, status=200)


@api_view(["POST"])
def chat_with_gemini(request):
    """Simple proxy endpoint to Gemini model.

    Expected JSON body: {"query": "your question"}
    Optional: future enhancement can include conversation history.
    """
    user_query = request.data.get("query", "").strip()
    if not user_query:
        return Response({"error": "No query provided"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        reply = get_gemini_response(user_query)
        return Response({"response": reply}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Failed to get AI response", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def generate_complaint_pdf(request):
    """Generate a simple PDF from posted complaint data.

    Expected JSON body contains the same keys used in the frontend preview.
    If reportlab is available we'll render a basic PDF, otherwise we fallback
    to returning a plain text file with application/pdf content type.
    """
    data = request.data or {}

    def gv(key):
        return str(data.get(key, '') or '')

    current_date = gv('current_date') or ''
    # Build letter text (mirror frontend logic)
    letter = (
        f"COMPLAINT LETTER\n\nDate: {current_date}\n\n"
        f"To,\nThe Consumer Forum / Appropriate Authority\n{gv('respondent_address')}\n\n"
        f"Subject: {gv('complaint_type')} - Complaint against {gv('respondent_name')}\n\n"
        f"Respected Sir/Madam,\n\n"
        f"I, {gv('complainant_name')}, resident of {gv('complainant_address')}, hereby file this complaint against {gv('respondent_name')}, located at {gv('respondent_address')}.\n\n"
        f"DETAILS OF THE COMPLAINT:\n\n"
        f"1. Type of Complaint: {gv('complaint_type')}\n\n"
        f"2. Date of Incident: {gv('incident_date')}\n\n"
        f"3. Location of Incident: {gv('incident_location')}\n\n"
        f"4. Detailed Description of the Incident:\n{gv('description')}\n\n"
        f"5. Financial Loss/Damages: {gv('damages_amount')}\n\n"
        f"6. Evidence Available:\n{gv('evidence_summary')}\n\n"
        f"7. Relief Sought:\n{gv('relief_sought')}\n\n"
        f"PRAYER:\n\n"
        f"In view of the above facts and circumstances, I humbly request this honorable forum to:\n"
        f"- Take appropriate action against the respondent\n"
        f"- Direct the respondent to provide the relief sought\n"
        f"- Award compensation for the mental agony and harassment caused\n"
        f"- Any other relief deemed fit and proper\n\n"
        f"Thanking you,\n\n"
        f"Yours faithfully,\n{gv('complainant_name')}\n"
        f"Contact: {gv('complainant_phone')}\n"
        f"Email: {gv('complainant_email')}\n\n---\n\n"
        f"VERIFICATION:\n\n"
        f"I, {gv('complainant_name')}, do hereby verify that the contents of the above complaint are true and correct to the best of my knowledge.\n\n"
        f"Date: {current_date}\n"
        f"Place: {gv('incident_location')}\n\n"
        f"Signature: ________________\n{gv('complainant_name')}"
    )

    buffer = BytesIO()
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import mm

        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 20 * mm
        for line in letter.split('\n'):
            # basic wrapping: manually split long lines
            if len(line) > 110:
                while len(line) > 110:
                    part = line[:110]
                    c.drawString(20 * mm, y, part)
                    y -= 6 * mm
                    line = line[110:]
            c.drawString(20 * mm, y, line)
            y -= 6 * mm
            if y < 20 * mm:
                c.showPage()
                y = height - 20 * mm
        c.showPage()
        c.save()
        pdf = buffer.getvalue()
        buffer.close()
        response = HttpResponse(pdf, content_type='application/pdf')
        filename = (gv('complaint_type') or 'complaint').replace(' ', '_') + '_preview.pdf'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    except Exception:
        # fallback plain text as pdf mime
        txt = letter.encode('utf-8')
        response = HttpResponse(txt, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="complaint_preview.txt"'
        return response


@api_view(["GET"])
@permission_classes([AllowAny])
def list_case_types(request):
    # Derive case types from LawCategory entries
    categories = LawCategory.objects.values_list('slug', 'category_name')
    items = [{"key": slug, "label": name} for slug, name in categories]
    return Response(items)


# ──────────────────────────────────────────
# CHAT REST APIs
# ──────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_or_get_chat_room(request, lawyer_id):
    """
    Client sends a chat request to a lawyer.
    - Creates the room with status='pending' if it doesn't exist yet.
    - If the room already exists (in any state), returns it as-is.
    - Only clients can call this endpoint.
    """
    actor = request.user

    if hasattr(actor, 'lawyer_profile'):
        return Response(
            {"error": "Lawyers cannot send chat requests. Clients initiate chats."},
            status=403,
        )

    try:
        lawyer = Lawyer.objects.get(id=lawyer_id)
    except Lawyer.DoesNotExist:
        return Response({"error": "Lawyer not found"}, status=404)

    room, created = ChatRoom.objects.get_or_create(
        client=actor,
        lawyer=lawyer,
        defaults={'status': ChatRoom.STATUS_PENDING},
    )
    # Notify the lawyer about the new chat request
    if created and lawyer.user:
        client_name = actor.client_profile.cname if hasattr(actor, 'client_profile') else actor.username
        Notification.objects.create(
            user=lawyer.user,
            title='New Chat Request',
            message=f'{client_name} has sent you a chat request.',
            notification_type='chat',
            related_id=room.id,
        )
    serializer = ChatRoomSerializer(room)
    return Response(serializer.data, status=201 if created else 200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_chat_request(request, room_id):
    """
    Lawyer accepts a pending chat request — sets room status to 'active'.
    Only the lawyer of that specific room can call this.
    """
    user = request.user

    if not hasattr(user, 'lawyer_profile'):
        return Response({"error": "Only lawyers can accept chat requests."}, status=403)

    try:
        room = ChatRoom.objects.select_related('lawyer', 'lawyer__user').get(
            id=room_id, lawyer=user.lawyer_profile
        )
    except ChatRoom.DoesNotExist:
        return Response({"error": "Room not found or not yours."}, status=404)

    if room.status == ChatRoom.STATUS_ACTIVE:
        return Response(ChatRoomSerializer(room).data)  # already active, idempotent

    room.status = ChatRoom.STATUS_ACTIVE
    room.save(update_fields=['status', 'updated_at'])
    # Notify the client that their chat was accepted
    lawyer_name = user.lawyer_profile.lname if hasattr(user, 'lawyer_profile') else user.username
    Notification.objects.create(
        user=room.client,
        title='Chat Request Accepted',
        message=f'{lawyer_name} has accepted your chat request.',
        notification_type='chat',
        related_id=room.id,
    )
    return Response(ChatRoomSerializer(room).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, room_id):
    """
    Returns the message history for a given room.
    Only the client and the lawyer of that room can access it.
    """
    user = request.user

    try:
        room = ChatRoom.objects.select_related('client', 'lawyer', 'lawyer__user').get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    # Access control
    lawyer_user = getattr(room.lawyer, 'user', None)
    if room.client != user and lawyer_user != user:
        return Response({"error": "Unauthorized"}, status=403)

    messages = room.messages.select_related(
        'sender', 'sender__client_profile', 'sender__lawyer_profile'
    ).all()
    serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_chat_rooms(request):
    """
    Returns all chat rooms for the logged-in user.
    Lawyers get rooms where they are the lawyer.
    Clients get rooms where they are the client.
    """
    user = request.user

    if hasattr(user, 'lawyer_profile'):
        rooms = ChatRoom.objects.filter(
            lawyer=user.lawyer_profile
        ).select_related(
            'client', 'client__client_profile',
            'lawyer', 'lawyer__user',
        ).order_by('-last_message_at', '-id')
    else:
        rooms = ChatRoom.objects.filter(
            client=user
        ).select_related(
            'client', 'client__client_profile',
            'lawyer', 'lawyer__user',
        ).order_by('-last_message_at', '-id')

    serializer = ChatRoomSerializer(rooms, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_chat_messages(request, room_id):
    """
    Deletes all messages in a room.
    Only the client or lawyer of that room can do this.
    """
    user = request.user
    try:
        room = ChatRoom.objects.select_related('lawyer', 'lawyer__user').get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    lawyer_user = getattr(room.lawyer, 'user', None)
    if room.client != user and lawyer_user != user:
        return Response({"error": "Unauthorized"}, status=403)

    room.messages.all().delete()
    # Reset the preview fields on the room
    room.last_message = ''
    room.last_message_at = None
    room.save(update_fields=['last_message', 'last_message_at'])
    return Response({"detail": "Messages cleared"}, status=200)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chat_room(request, room_id):
    """
    Permanently deletes the chat room and all its messages.
    Only the client or lawyer of that room can do this.
    """
    user = request.user
    try:
        room = ChatRoom.objects.select_related('lawyer', 'lawyer__user').get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    lawyer_user = getattr(room.lawyer, 'user', None)
    if room.client != user and lawyer_user != user:
        return Response({"error": "Unauthorized"}, status=403)

    # Notify the other party before deleting
    lawyer_user_obj = getattr(room.lawyer, 'user', None)
    if user == room.client and lawyer_user_obj:
        # Client deleted → notify lawyer
        client_name = user.client_profile.cname if hasattr(user, 'client_profile') else user.username
        Notification.objects.create(
            user=lawyer_user_obj,
            title='Chat Deleted by Client',
            message=f'{client_name} has deleted the chat room.',
            notification_type='chat',
            related_id=room.id,
        )
    elif lawyer_user_obj == user and room.client:
        # Lawyer deleted → notify client
        lawyer_name = user.lawyer_profile.lname if hasattr(user, 'lawyer_profile') else user.username
        Notification.objects.create(
            user=room.client,
            title='Chat Deleted by Lawyer',
            message=f'{lawyer_name} has deleted the chat room.',
            notification_type='chat',
            related_id=room.id,
        )

    room.delete()
    return Response({"detail": "Chat deleted"}, status=200)


# ──────────────────────────────────────────
# NOTIFICATION VIEWS
# ──────────────────────────────────────────

class NotificationViewSet(viewsets.ModelViewSet):
    """Notifications for the authenticated user."""
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'message']
    filterset_fields = ['notification_type', 'is_read']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Notification.objects.none()
        if getattr(user, 'is_staff', False):
            return Notification.objects.all().order_by('-created_at')
        return Notification.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notif_id):
    """Mark a single notification as read."""
    try:
        notif = Notification.objects.get(id=notif_id, user=request.user)
    except Notification.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    notif.is_read = True
    notif.save(update_fields=['is_read'])
    return Response({"detail": "Marked as read"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the authenticated user."""
    count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"detail": f"Marked {count} notifications as read"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats(request):
    """Get notification counts."""
    qs = Notification.objects.filter(user=request.user)
    return Response({
        "total": qs.count(),
        "unread": qs.filter(is_read=False).count(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def broadcast_notification(request):
    """
    Admin broadcasts a notification to all users (or by role).
    POST body: { "title": "...", "message": "...", "role": "all"|"client"|"lawyer" }
    """
    if not request.user.is_staff:
        return Response({"error": "Admin only"}, status=403)

    title = request.data.get('title', '').strip()
    message = request.data.get('message', '').strip()
    role = request.data.get('role', 'all')  # all, client, lawyer

    if not title or not message:
        return Response({"error": "Title and message are required"}, status=400)

    users = User.objects.filter(is_active=True)
    if role == 'client':
        users = users.filter(client_profile__isnull=False)
    elif role == 'lawyer':
        users = users.filter(lawyer_profile__isnull=False)
    else:
        # exclude staff from broadcasts (they send them)
        users = users.exclude(is_staff=True)

    notifications = [
        Notification(
            user=u,
            title=title,
            message=message,
            notification_type='system',
        )
        for u in users
    ]
    Notification.objects.bulk_create(notifications)
    return Response({"detail": f"Broadcast sent to {len(notifications)} users"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_feedback_count(request):
    """Return count of unread feedback for a lawyer (feedback received since last check)."""
    user = request.user
    if not hasattr(user, 'lawyer_profile'):
        return Response({"unread": 0})
    # Count feedback that is newer than the lawyer's last profile update
    # Simple approach: count feedback created in last 7 days that hasn't been 'seen'
    from django.utils import timezone
    from datetime import timedelta
    last_seen = request.query_params.get('since', None)
    if last_seen:
        try:
            from django.utils.dateparse import parse_datetime
            dt = parse_datetime(last_seen)
            if dt:
                count = Feedback.objects.filter(lawyer=user.lawyer_profile, created_at__gt=dt).count()
                return Response({"unread": count})
        except Exception:
            pass
    count = Feedback.objects.filter(
        lawyer=user.lawyer_profile,
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    return Response({"unread": count})