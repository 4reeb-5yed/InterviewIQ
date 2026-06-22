"""Provider-agnostic AI interface.

Business logic depends only on :class:`AIProvider`; concrete vendor SDKs live
under ``providers/`` and are selected by the factory. The model identifier is
carried on :class:`AIRequest` (supplied by the caller from per-agent settings)
so no model string is hardcoded in business logic.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class AIRequest:
    """A single model invocation."""

    system_prompt: str
    user_message: str
    model: str
    temperature: float = 0.3
    max_tokens: int = 2000


@dataclass
class AIMessage:
    """A model response plus lightweight usage/latency telemetry."""

    content: str
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: float


class AIProvider(ABC):
    """Abstract chat-completion provider."""

    @abstractmethod
    async def generate(self, request: AIRequest) -> AIMessage:
        """Generate a completion for the given request."""
