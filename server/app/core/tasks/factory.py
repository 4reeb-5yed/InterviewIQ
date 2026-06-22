"""Select the task store from settings (Redis only if REDIS_URL set)."""

from __future__ import annotations

from app.config.settings import Settings
from app.core.tasks.base import TaskStore
from app.core.tasks.memory import InMemoryTaskStore
from app.core.tasks.redis import RedisTaskStore


def build_task_store(settings: Settings) -> TaskStore:
    """Return a Redis task store when configured, otherwise the in-memory default."""
    if settings.redis_url:
        return RedisTaskStore(settings.redis_url)
    return InMemoryTaskStore()
