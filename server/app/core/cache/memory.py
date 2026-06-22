"""In-memory cache (default). No external dependencies; per-process state."""

from __future__ import annotations

import time

from app.core.cache.base import CacheStore


class InMemoryCacheStore(CacheStore):
    """Dict-backed cache with per-key expiry using a monotonic clock."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[float, dict]] = {}

    async def get(self, key: str) -> dict | None:
        item = self._store.get(key)
        if item is None:
            return None
        expires_at, value = item
        if expires_at < time.monotonic():
            self._store.pop(key, None)
            return None
        return value

    async def set(self, key: str, value: dict, ttl_seconds: int) -> None:
        self._store[key] = (time.monotonic() + ttl_seconds, value)

    async def invalidate(self, key: str) -> None:
        self._store.pop(key, None)
