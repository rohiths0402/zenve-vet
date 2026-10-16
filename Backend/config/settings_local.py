from .settings import *

INSTALLED_APPS = ["daphne", "channels", *INSTALLED_APPS]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "local_test.sqlite3",
    }
}

MESSAGING_REQUIRES_CONNECTION = False