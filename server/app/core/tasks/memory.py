"""In-memory task store (default). Per-process; resets on restart."""

from __future__ import annotations

from uuid import UUID

from app.core.tasks.base import TaskStatus, TaskStore


class InMemoryTaskStore(TaskStore):
    """Dict-backed task-status store."""

    def __init__(self) -> None:
        self._store: dict[UUID, TaskStatus] = {}

    async def set_pending(self, task_id: UUID) -> None:
        self._store[task_id] = TaskStatus(task_id=task_id, status="pending")

    async def set_running(self, task_id: UUID) -> None:
        self._store[task_id] = TaskStatus(task_id=task_id, status="running")

    async def set_completed(self, task_id: UUID, result: dict) -> None:
        self._store[task_id] = TaskStatus(task_id=task_id, status="completed", result=result)

    async def set_failed(self, task_id: UUID, error: str) -> None:
        self._store[task_id] = TaskStatus(task_id=task_id, status="failed", error=error)

    async def get(self, task_id: UUID) -> TaskStatus | None:
        return self._store.get(task_id)
