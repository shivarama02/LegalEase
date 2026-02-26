from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from io import BytesIO

from .models import LawInfo, Client, Lawyer, Complaint, LawDetail, ComplaintDraft, Appointment, Feedback, LawList, ChatRoom, ChatMessage
from .serializers import (
    LawInfoSerializer,
    ClientSerializer,
    LawyerSerializer,
    ClientSignupSerializer,
    LawyerSignupSerializer,
    LoginSerializer,
    ComplaintSerializer,
    LawDetailSerializer,
    ComplaintDraftSerializer,
    AppointmentSerializer,
    FeedbackSerializer,
    LawListSerializer,
    ChatRoomSerializer,
    ChatMessageSerializer,
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user if self.request.user.is_authenticated else None
        if not user:
            return qs.none()
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


class LawyerViewSet(viewsets.ModelViewSet):
    queryset = Lawyer.objects.all().order_by('-rating', '-reviews_count', '-experience_years')
    serializer_class = LawyerSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['lname', 'email', 'specialization', 'location', 'languages']
    filterset_fields = ['specialization', 'location', 'is_verified']
    ordering_fields = ['experience_years', 'charge', 'rating', 'reviews_count']


class LawDetailViewSet(viewsets.ModelViewSet):
    queryset = LawDetail.objects.all().order_by('title')
    serializer_class = LawDetailSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'statute_name', 'section_reference', 'category']
    filterset_fields = ['category']
class LawListViewSet(viewsets.ModelViewSet):
    queryset = LawList.objects.all().prefetch_related('items').order_by('title')
    serializer_class = LawListSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'description', 'category']
    filterset_fields = ['category']


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().select_related('user', 'assigned_lawyer').order_by('-created_at')
    serializer_class = ComplaintSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'complainant_name', 'respondent_name', 'complaint_type']
    filterset_fields = ['complaint_type', 'status']

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
    queryset = Appointment.objects.all().select_related('user').order_by('-appointment_date', '-appointment_time')
    serializer_class = AppointmentSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'email', 'case_type', 'lawyer_type', 'status']
    filterset_fields = ['status', 'case_type', 'lawyer_type', 'appointment_date']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user if self.request.user.is_authenticated else None
        if user:
            return qs.filter(user=user)
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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
        # Users see only their own feedback
        if user and not getattr(user, 'is_staff', False):
            return qs.filter(user=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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
    # Derive case types from LawDetail choices to drive the dropdown list
    case_map = dict(LawDetail.CATEGORY_CHOICES)
    items = [
        {"key": key, "label": label}
        for key, label in case_map.items()
    ]
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


