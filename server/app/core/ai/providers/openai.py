"""OpenAI (and OpenAI-compatible) implementation of :class:`AIProvider`.

Works with the OpenAI API and any OpenAI-compatible endpoint via ``base_url``:
OpenRouter, Ollama, vLLM, LM Studio, Together, etc. The SDK is imported lazily
so unused providers impose no import cost.
"""

from __future__ import annotations

import time

from app.core.ai.base import AIMessage, AIProvider, AIRequest


class OpenAIProvider(AIProvider):
    """Calls the OpenAI Chat Completions API (or a compatible endpoint)."""

    def __init__(
        self,
        api_key: str,
        base_url: str | None = None,
        organization: str | None = None,
    ) -> None:
        try:
            from openai import AsyncOpenAI
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "The 'openai' package is required for AI_PROVIDER=openai. Install dependencies."
            ) from exc

        # Local/compatible endpoints often accept any key; default to a placeholder.
        self._client = AsyncOpenAI(
            api_key=api_key or "not-needed",
            base_url=base_url or None,
            organization=organization or None,
        )

    async def generate(self, request: AIRequest) -> AIMessage:
        start = time.perf_counter()
        response = await self._client.chat.completions.create(
            model=request.model,
            messages=[
                {"role": "system", "content": request.system_prompt},
                {"role": "user", "content": request.user_message},
            ],
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )
        latency_ms = (time.perf_counter() - start) * 1000
        content = response.choices[0].message.content or ""
        usage = response.usage
        return AIMessage(
            content=content,
            model=request.model,
            input_tokens=getattr(usage, "prompt_tokens", 0) or 0,
            output_tokens=getattr(usage, "completion_tokens", 0) or 0,
            latency_ms=latency_ms,
        )
