import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for one-to-one chat between a client and a lawyer.
    URL: /ws/chat/<room_id>/?token=<authToken>
    Authentication is handled upstream by TokenAuthMiddleware (reads ?token=).
    """

    # ─── connection lifecycle ──────────────────────────────────────────────

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"
        self.user = self.scope.get("user", AnonymousUser())

        # Reject unauthenticated connections
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Verify the user is actually a participant in this room
        room = await self._get_room(self.room_id)
        if room is None:
            await self.close(code=4004)
            return

        if not await self._is_participant(room, self.user):
            await self.close(code=4003)
            return

        # Only allow active rooms — pending rooms are not yet open for messaging
        if room.status != 'active':
            await self.close(code=4005)
            return

        # Join the room channel group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Broadcast online presence to the room (partner will see this)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "presence_update",
                "user_id": self.user.id,
                "online": True,
            },
        )

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            # Notify partner before leaving the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "presence_update",
                    "user_id": self.user.id,
                    "online": False,
                },
            )
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # ─── receive ──────────────────────────────────────────────────────────

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            return

        message_text = (data.get("message") or "").strip()
        if not message_text:
            return

        user = self.user
        if not user or not user.is_authenticated:
            return

        # Persist message to DB
        msg = await self._save_message(self.room_id, user, message_text)
        if msg is None:
            return

        sender_info = await self._get_sender_info(user)

        # Broadcast to every member of the group (both participants)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": msg.id,
                "room_id": int(self.room_id),
                "sender_id": user.id,
                "sender_name": sender_info["name"],
                "sender_role": sender_info["role"],
                "message": message_text,
                "created_at": msg.created_at.isoformat(),
            },
        )

    # ─── group event handlers ──────────────────────────────────────────────

    async def chat_message(self, event):
        """Called when the group sends a 'chat_message' event to this consumer."""
        await self.send(
            text_data=json.dumps(
                {
                    "type": "message",
                    "id": event["id"],
                    "room_id": event["room_id"],
                    "sender_id": event["sender_id"],
                    "sender_name": event["sender_name"],
                    "sender_role": event["sender_role"],
                    "message": event["message"],
                    "created_at": event["created_at"],
                }
            )
        )

    async def presence_update(self, event):
        """Forward presence events to the WebSocket client."""
        await self.send(
            text_data=json.dumps(
                {
                    "type": "presence",
                    "user_id": event["user_id"],
                    "online": event["online"],
                }
            )
        )

    # ─── database helpers ──────────────────────────────────────────────────

    @database_sync_to_async
    def _get_room(self, room_id):
        from .models import ChatRoom
        try:
            return ChatRoom.objects.select_related("client", "lawyer", "lawyer__user").get(
                id=room_id
            )
        except ChatRoom.DoesNotExist:
            return None

    @database_sync_to_async
    def _is_participant(self, room, user):
        lawyer_user = getattr(room.lawyer, "user", None)
        return room.client_id == user.id or (lawyer_user and lawyer_user.id == user.id)

    @database_sync_to_async
    def _save_message(self, room_id, user, message_text):
        from .models import ChatRoom, ChatMessage
        try:
            room = ChatRoom.objects.get(id=room_id)
        except ChatRoom.DoesNotExist:
            return None

        msg = ChatMessage.objects.create(room=room, sender=user, message=message_text)

        # Update room-level preview fields
        room.last_message = message_text[:200]
        room.last_message_at = timezone.now()
        room.save(update_fields=["last_message", "last_message_at", "updated_at"])

        return msg

    @database_sync_to_async
    def _get_sender_info(self, user):
        if hasattr(user, "lawyer_profile"):
            return {"name": user.lawyer_profile.lname or user.username, "role": "lawyer"}
        if hasattr(user, "client_profile"):
            return {"name": user.client_profile.cname or user.username, "role": "client"}
        return {"name": user.username, "role": "unknown"}


# ────────────────────────────────────────────────────────────────────────────
# PRESENCE CONSUMER
# ────────────────────────────────────────────────────────────────────────────

class PresenceConsumer(AsyncWebsocketConsumer):
    """
    Lightweight global presence tracker. The frontend opens ONE connection
    per page load at ws/presence/?token=<authToken>.

    On connect  → broadcasts 'online'  to every chat room the user participates in,
                  and to each partner's personal presence group.
    On disconnect → broadcasts 'offline' the same way.

    This allows the sidebar to show live green/grey dots for all rooms.
    """

    async def connect(self):
        self.user = self.scope.get("user", AnonymousUser())

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Add to personal group so partners can reach this consumer directly
        self.personal_group = f"presence_{self.user.id}"
        await self.channel_layer.group_add(self.personal_group, self.channel_name)
        await self.accept()

        # Tell all room partners the user is now online
        await self._broadcast_presence(online=True)

    async def disconnect(self, close_code):
        if hasattr(self, "personal_group"):
            await self._broadcast_presence(online=False)
            await self.channel_layer.group_discard(self.personal_group, self.channel_name)

    # ─── incoming group events ─────────────────────────────────────────────

    async def presence_update(self, event):
        """
        Forward a partner's presence change to the frontend.
        Includes room_id so the sidebar can update the correct row.
        """
        await self.send(
            text_data=json.dumps(
                {
                    "type": "presence",
                    "user_id": event["user_id"],
                    "online": event["online"],
                    "room_id": event.get("room_id"),
                }
            )
        )

    # ─── helpers ──────────────────────────────────────────────────────────

    async def _broadcast_presence(self, online: bool):
        rooms = await self._get_user_rooms()
        for room in rooms:
            # 1. Notify the live chat WS group for this room
            await self.channel_layer.group_send(
                f"chat_{room['id']}",
                {
                    "type": "presence_update",
                    "user_id": self.user.id,
                    "online": online,
                    "room_id": room["id"],
                },
            )
            # 2. Notify the partner's presence consumer (for sidebar dots)
            partner_id = room["partner_id"]
            if partner_id:
                await self.channel_layer.group_send(
                    f"presence_{partner_id}",
                    {
                        "type": "presence_update",
                        "user_id": self.user.id,
                        "online": online,
                        "room_id": room["id"],
                    },
                )

    @database_sync_to_async
    def _get_user_rooms(self):
        """
        Return a list of dicts: {id, partner_id} for all rooms this user is in.
        """
        from .models import ChatRoom
        user = self.user
        results = []

        if hasattr(user, "lawyer_profile"):
            qs = ChatRoom.objects.filter(
                lawyer=user.lawyer_profile,
                status=ChatRoom.STATUS_ACTIVE,
            ).select_related("client")
            for room in qs:
                results.append({"id": room.id, "partner_id": room.client_id})
        else:
            qs = ChatRoom.objects.filter(
                client=user,
                status=ChatRoom.STATUS_ACTIVE,
            ).select_related("lawyer", "lawyer__user")
            for room in qs:
                lawyer_user = getattr(room.lawyer, "user", None)
                results.append({
                    "id": room.id,
                    "partner_id": lawyer_user.id if lawyer_user else None,
                })

        return results
