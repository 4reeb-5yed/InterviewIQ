"""Anthropic implementation of :class:`AIProvider` (Phase 1 default)."""

from __future__ import annotations

import time

from anthropic import AsyncAnthropic

from app.core.ai.base import AIMessage, AIProvider, AIRequest


class AnthropicProvider(AIProvider):
    """Calls the Anthropic Messages API."""

    def __init__(self, api_key: str) -> None:
        self._client = AsyncAnthropic(api_key=api_key)

    async def generate(self, request: AIRequest) -> AIMessage:
        start = time.perf_counter()
        response = await self._client.messages.create(
            model=request.model,
            system=request.system_prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            messages=[{"role": "user", "content": request.user_message}],
        )
        latency_ms = (time.perf_counter() - start) * 1000
        content = "".join(
            block.text for block in response.content if getattr(block, "type", None) == "text"
        )
        return AIMessage(
            content=content,
            model=request.model,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            latency_ms=latency_ms,
        )
