import os
import django

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "legal_backend.settings")

django.setup()

import legal_app.routing
from legal_backend.ws_auth_middleware import TokenAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware(
        URLRouter(
            legal_app.routing.websocket_urlpatterns
        )
    ),
})
