"""Select the cache implementation from settings (Redis only if REDIS_URL set)."""

from __future__ import annotations

from app.config.settings import Settings
from app.core.cache.base import CacheStore
from app.core.cache.memory import InMemoryCacheStore
from app.core.cache.redis import RedisCacheStore


def build_cache(settings: Settings) -> CacheStore:
    """Return a Redis cache when configured, otherwise the in-memory default."""
    if settings.redis_url:
        return RedisCacheStore(settings.redis_url)
    return InMemoryCacheStore()
