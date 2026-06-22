"""Parse-or-retry wrapper for JSON-returning model calls.

Agents call :func:`generate_json` instead of the provider directly. On invalid
JSON it retries (up to ``max_attempts``) appending a stricter reminder, then
raises :class:`AIProviderError`, which maps to the ``AI_PROVIDER_ERROR`` code.
"""

from __future__ import annotations

import json
from typing import Any

from app.core.ai.base import AIProvider, AIRequest


class AIProviderError(Exception):
    """Raised when the provider fails to return valid JSON after retries."""


_JSON_REMINDER = "\n\nReturn ONLY valid JSON. No markdown fences, no prose."


def _extract_json(content: str) -> str:
    """Strip common markdown code fences before parsing."""
    text = content.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1] if "\n" in text else text
        if text.endswith("```"):
            text = text[: -len("```")]
        text = text.removeprefix("json").strip()
    return text


async def generate_json(
    provider: AIProvider,
    request: AIRequest,
    *,
    max_attempts: int = 3,
) -> dict[str, Any]:
    """Call the provider and return parsed JSON, retrying on parse failure."""
    last_error: Exception | None = None
    attempt_request = request
    for _ in range(max_attempts):
        message = await provider.generate(attempt_request)
        try:
            parsed = json.loads(_extract_json(message.content))
        except (json.JSONDecodeError, ValueError) as exc:
            last_error = exc
            attempt_request = AIRequest(
                system_prompt=request.system_prompt,
                user_message=request.user_message + _JSON_REMINDER,
                model=request.model,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
            )
            continue
        if not isinstance(parsed, dict):
            last_error = ValueError("Expected a JSON object at the top level.")
            continue
        return parsed
    raise AIProviderError(
        f"Model did not return valid JSON after {max_attempts} attempts: {last_error}"
    )
