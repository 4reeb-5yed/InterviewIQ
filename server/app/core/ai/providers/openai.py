"""OpenAI provider scaffold. Not implemented in Phase 1 (use AI_PROVIDER=anthropic)."""

from __future__ import annotations

from app.core.ai.base import AIMessage, AIProvider, AIRequest


class OpenAIProvider(AIProvider):
    """Placeholder; implement when multi-provider support is needed."""

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    async def generate(self, request: AIRequest) -> AIMessage:  # pragma: no cover
        raise NotImplementedError(
            "OpenAIProvider is a scaffold. Set AI_PROVIDER=anthropic for Phase 1."
        )
