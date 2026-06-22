"""Factory selecting a concrete :class:`AIProvider` from configuration."""

from __future__ import annotations

from app.core.ai.base import AIProvider
from app.core.ai.providers.anthropic import AnthropicProvider
from app.core.ai.providers.gemini import GeminiProvider
from app.core.ai.providers.openai import OpenAIProvider


class AIProviderFactory:
    """Builds the provider named by ``AI_PROVIDER``."""

    @staticmethod
    def create(provider: str, api_key: str) -> AIProvider:
        match provider:
            case "anthropic":
                return AnthropicProvider(api_key)
            case "openai":
                return OpenAIProvider(api_key)
            case "gemini":
                return GeminiProvider(api_key)
            case _:
                raise ValueError(f"Unknown AI provider: {provider!r}")
