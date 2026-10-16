
import time

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.settings import api_settings


@database_sync_to_async
def get_user_from_token(raw_token):
    try:
        token = AccessToken(raw_token)
        user_id = token[api_settings.USER_ID_CLAIM]
        user = get_user_model().objects.get(
            **{api_settings.USER_ID_FIELD: user_id}
        )

        if not user.is_active:
            return None, None

        return user, int(token["exp"])
    except Exception:
        return None, None


class WebSocketJWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        protocols = scope.get("subprotocols", [])

        # The client sends "zenve" followed by its JWT access token.
        raw_token = next(
            (
                protocol
                for protocol in protocols
                if protocol != "zenve"
            ),
            None,
        )

        scope["user"] = AnonymousUser()
        scope["zenve_token"] = None
        scope["zenve_token_exp"] = None
        scope["zenve_subprotocol_auth"] = False

        if raw_token:
            user, expires_at = await get_user_from_token(raw_token)

            if user is not None and expires_at > time.time():
                scope["user"] = user
                scope["zenve_token"] = raw_token
                scope["zenve_token_exp"] = expires_at
                scope["zenve_subprotocol_auth"] = True

        return await self.app(scope, receive, send)
