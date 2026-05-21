import os

GOOGLE_APPS_SCRIPT_URL = os.environ.get(
    "GOOGLE_APPS_SCRIPT_URL",
    "https://script.google.com/macros/s/AKfycbz-gFM0CY87SohYZfypRaMVNBFH6fV6g2lXrIm1s_i8EU4_0bpzF8ZlDWpDBp5l-aLdTw/exec",
)

REFRESH_INTERVAL = int(os.environ.get("REFRESH_INTERVAL", "5"))

EVENT_NAME = os.environ.get("EVENT_NAME", "Prom Night 2026")

ENABLE_DOWNLOAD = os.environ.get("ENABLE_DOWNLOAD", "true").lower() in (
    "true",
    "1",
    "yes",
)

DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() in ("true", "1", "yes")
