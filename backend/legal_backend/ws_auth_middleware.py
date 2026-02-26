"""
TokenAuthMiddleware
───────────────────
Authenticates WebSocket connections using a DRF token passed as a query
parameter: ws://host/ws/chat/<id>/?token=<authToken>

Sets scope['user'] to the matching Django User, or AnonymousUser on failure.
"""

from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def get_user_from_token(token_key):
    from rest_framework.authtoken.models import Token
    try:
        token = Token.objects.select_related("user").get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    """
    Reads ?token=<key> from the WebSocket URL query string,
    resolves it to a Django User, and stores it in scope['user'].
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        params = parse_qs(query_string)
        token_list = params.get("token", [])

        if token_list:
            scope["user"] = await get_user_from_token(token_list[0])
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
