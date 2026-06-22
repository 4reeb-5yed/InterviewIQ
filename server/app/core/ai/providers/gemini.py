"""Google Gemini implementation of :class:`AIProvider`."""

from __future__ import annotations

import time

from app.core.ai.base import AIMessage, AIProvider, AIRequest


class GeminiProvider(AIProvider):
    """Calls the Google Generative AI (Gemini) API."""

    def __init__(self, api_key: str) -> None:
        try:
            import google.generativeai as genai
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "The 'google-generativeai' package is required for AI_PROVIDER=gemini."
            ) from exc
        if not api_key:
            raise RuntimeError("Gemini requires AI_API_KEY.")
        genai.configure(api_key=api_key)
        self._genai = genai

    async def generate(self, request: AIRequest) -> AIMessage:
        model = self._genai.GenerativeModel(
            model_name=request.model,
            system_instruction=request.system_prompt,
        )
        start = time.perf_counter()
        response = await model.generate_content_async(
            request.user_message,
            generation_config={
                "temperature": request.temperature,
                "max_output_tokens": request.max_tokens,
            },
        )
        latency_ms = (time.perf_counter() - start) * 1000
        usage = getattr(response, "usage_metadata", None)
        return AIMessage(
            content=response.text,
            model=request.model,
            input_tokens=getattr(usage, "prompt_token_count", 0) or 0,
            output_tokens=getattr(usage, "candidates_token_count", 0) or 0,
            latency_ms=latency_ms,
        )
