"""Shared test fixtures: a deterministic fake AI provider."""

from __future__ import annotations

from collections.abc import Sequence

import pytest

from app.core.ai.base import AIMessage, AIProvider, AIRequest


class FakeAIProvider(AIProvider):
    """Returns canned responses in order; repeats the last one if exhausted."""

    def __init__(self, responses: Sequence[str]) -> None:
        self._responses = list(responses)
        self._index = 0

    async def generate(self, request: AIRequest) -> AIMessage:
        content = self._responses[min(self._index, len(self._responses) - 1)]
        self._index += 1
        return AIMessage(
            content=content,
            model=request.model,
            input_tokens=1,
            output_tokens=1,
            latency_ms=1.0,
        )


@pytest.fixture
def make_provider():
    """Factory fixture: build a FakeAIProvider from a list of response strings."""

    def _make(responses: Sequence[str]) -> FakeAIProvider:
        return FakeAIProvider(responses)

    return _make
