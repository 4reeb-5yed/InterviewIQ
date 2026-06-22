"""Interview memory interface (scaffold).

Defines the contract for the Phase 2 interview memory layer (weak topics,
repeated mistakes). Not implemented or wired in Phase 1.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any
from uuid import UUID


class MemoryStore(ABC):
    """Persists per-session interview memory. TODO: implement in Phase 2."""

    @abstractmethod
    async def get(self, session_id: UUID) -> Any: ...

    @abstractmethod
    async def update(self, session_id: UUID, memory: Any) -> None: ...
