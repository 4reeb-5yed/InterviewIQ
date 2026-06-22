"""Redis cache scaffold. Used only when REDIS_URL is set; implement in a later phase."""

from __future__ import annotations

from app.core.cache.base import CacheStore


class RedisCacheStore(CacheStore):
    """Placeholder Redis-backed cache.

    Wiring exists so the factory can select it when ``REDIS_URL`` is configured,
    but the MVP runs on the in-memory store. Implement with ``redis.asyncio``
    when cross-instance caching is required.
    """

    def __init__(self, redis_url: str) -> None:
        self._redis_url = redis_url

    async def get(self, key: str) -> dict | None:  # pragma: no cover
        raise NotImplementedError("RedisCacheStore not implemented; unset REDIS_URL for MVP.")

    async def set(self, key: str, value: dict, ttl_seconds: int) -> None:  # pragma: no cover
        raise NotImplementedError("RedisCacheStore not implemented; unset REDIS_URL for MVP.")

    async def invalidate(self, key: str) -> None:  # pragma: no cover
        raise NotImplementedError("RedisCacheStore not implemented; unset REDIS_URL for MVP.")
