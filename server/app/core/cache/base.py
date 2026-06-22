"""Cache interface. Implementations: in-memory (default) and Redis (optional)."""

from __future__ import annotations

from abc import ABC, abstractmethod


class CacheStore(ABC):
    """Key/value cache for JSON-serializable payloads with TTL."""

    @abstractmethod
    async def get(self, key: str) -> dict | None:
        """Return the cached value, or ``None`` if missing/expired."""

    @abstractmethod
    async def set(self, key: str, value: dict, ttl_seconds: int) -> None:
        """Store a value with a time-to-live in seconds."""

    @abstractmethod
    async def invalidate(self, key: str) -> None:
        """Remove a key from the cache."""
