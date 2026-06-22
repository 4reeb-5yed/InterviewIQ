"""slowapi limiter construction.

The limiter applies a per-IP default limit derived from settings. Combined with
SlowAPIMiddleware in the app factory, this protects the AI-backed routes.
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config.settings import Settings


def build_limiter(settings: Settings) -> Limiter:
    """Build a per-IP limiter using the configured rate limit."""
    return Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])
