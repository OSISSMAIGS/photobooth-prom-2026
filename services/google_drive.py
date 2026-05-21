import logging
from datetime import datetime

import requests

import config

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT = 15
MAX_RETRIES = 3


def _parse_created_time(value):
    if not value:
        return datetime.min
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return datetime.min


def _normalize_photo(item):
    if not isinstance(item, dict):
        return None
    url = item.get("url") or item.get("link") or ""
    thumbnail = item.get("thumbnail") or item.get("thumb") or url
    name = item.get("name") or item.get("title") or "Photo"
    created = item.get("createdTime") or item.get("created") or ""
    if not url and not thumbnail:
        return None
    return {
        "name": name,
        "url": url,
        "thumbnail": thumbnail,
        "createdTime": created,
    }


def fetch_photos():
    """Fetch photos from Google Apps Script. Returns newest first; empty list on error."""
    url = config.GOOGLE_APPS_SCRIPT_URL
    if not url or "YOUR_SCRIPT_ID" in url:
        logger.warning("Google Apps Script URL not configured")
        return []

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(
                url,
                timeout=REQUEST_TIMEOUT,
                headers={"Accept": "application/json"},
            )
            response.raise_for_status()
            data = response.json()

            if isinstance(data, dict):
                data = data.get("photos") or data.get("data") or data.get("items") or []

            if not isinstance(data, list):
                logger.error("Unexpected API response format")
                return []

            photos = []
            for item in data:
                normalized = _normalize_photo(item)
                if normalized:
                    photos.append(normalized)

            photos.sort(
                key=lambda p: _parse_created_time(p.get("createdTime")),
                reverse=True,
            )
            return photos

        except requests.Timeout as exc:
            last_error = exc
            logger.warning("Request timeout (attempt %s/%s)", attempt, MAX_RETRIES)
        except requests.RequestException as exc:
            last_error = exc
            logger.warning("Request failed (attempt %s/%s): %s", attempt, MAX_RETRIES, exc)
        except ValueError as exc:
            last_error = exc
            logger.error("Invalid JSON response: %s", exc)
            break

    if last_error:
        logger.error("Failed to fetch photos after retries: %s", last_error)
    return []
