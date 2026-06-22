"""Task-status interface for the submit -> poll background flow."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

TaskState = Literal["pending", "running", "completed", "failed"]


class TaskStatus(BaseModel):
    """Current state of a background task."""

    task_id: UUID
    status: TaskState
    result: dict | None = None
    error: str | None = None


class TaskStore(ABC):
    """Persists background-task lifecycle for polling by the client."""

    @abstractmethod
    async def set_pending(self, task_id: UUID) -> None: ...

    @abstractmethod
    async def set_running(self, task_id: UUID) -> None: ...

    @abstractmethod
    async def set_completed(self, task_id: UUID, result: dict) -> None: ...

    @abstractmethod
    async def set_failed(self, task_id: UUID, error: str) -> None: ...

    @abstractmethod
    async def get(self, task_id: UUID) -> TaskStatus | None: ...
