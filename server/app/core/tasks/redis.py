"""Redis task store scaffold. Used only when REDIS_URL is set; implement later."""

from __future__ import annotations

from uuid import UUID

from app.core.tasks.base import TaskStatus, TaskStore


class RedisTaskStore(TaskStore):
    """Placeholder durable task store for multi-instance deployments."""

    def __init__(self, redis_url: str) -> None:
        self._redis_url = redis_url

    async def set_pending(self, task_id: UUID) -> None:  # pragma: no cover
        raise NotImplementedError("RedisTaskStore not implemented; unset REDIS_URL for MVP.")

    async def set_running(self, task_id: UUID) -> None:  # pragma: no cover
        raise NotImplementedError("RedisTaskStore not implemented; unset REDIS_URL for MVP.")

    async def set_completed(self, task_id: UUID, result: dict) -> None:  # pragma: no cover
        raise NotImplementedError("RedisTaskStore not implemented; unset REDIS_URL for MVP.")

    async def set_failed(self, task_id: UUID, error: str) -> None:  # pragma: no cover
        raise NotImplementedError("RedisTaskStore not implemented; unset REDIS_URL for MVP.")

    async def get(self, task_id: UUID) -> TaskStatus | None:  # pragma: no cover
        raise NotImplementedError("RedisTaskStore not implemented; unset REDIS_URL for MVP.")
