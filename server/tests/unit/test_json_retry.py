"""Unit tests for the JSON parse-or-retry wrapper."""

from __future__ import annotations

import pytest

from app.core.ai.base import AIRequest
from app.core.ai.json_retry import AIProviderError, generate_json


def _req() -> AIRequest:
    return AIRequest(system_prompt="s", user_message="u", model="m")


async def test_returns_dict_on_valid_json(make_provider):
    provider = make_provider(['{"a": 1}'])
    assert await generate_json(provider, _req()) == {"a": 1}


async def test_strips_code_fence(make_provider):
    provider = make_provider(['```json\n{"a": 2}\n```'])
    assert await generate_json(provider, _req()) == {"a": 2}


async def test_retries_then_succeeds(make_provider):
    provider = make_provider(["not json", '{"ok": true}'])
    assert await generate_json(provider, _req()) == {"ok": True}


async def test_raises_after_max_attempts(make_provider):
    provider = make_provider(["nope"])
    with pytest.raises(AIProviderError):
        await generate_json(provider, _req(), max_attempts=3)
