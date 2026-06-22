"""Factory selecting a concrete :class:`AIProvider` from configuration.

Selection is entirely configuration-driven: switching providers requires only
changing environment variables (AI_PROVIDER plus the provider's credentials).
"""

from __future__ import annotations

from app.config.settings import Settings
from app.core.ai.base import AIProvider
from app.core.ai.providers.anthropic import AnthropicProvider
from app.core.ai.providers.bedrock import BedrockProvider
from app.core.ai.providers.gemini import GeminiProvider
from app.core.ai.providers.openai import OpenAIProvider

# OpenAI-compatible aliases (OpenRouter / local LLMs) route to OpenAIProvider.
_OPENAI_COMPATIBLE = {"openai", "openai_compatible", "openrouter", "local"}
_GEMINI = {"gemini", "google"}
_BEDROCK = {"bedrock", "aws"}


class AIProviderFactory:
    """Builds the provider named by ``AI_PROVIDER`` using settings."""

    @staticmethod
    def create(settings: Settings) -> AIProvider:
        provider = settings.ai_provider.strip().lower()

        if provider == "anthropic":
            return AnthropicProvider(settings.ai_api_key)
        if provider in _OPENAI_COMPATIBLE:
            return OpenAIProvider(
                api_key=settings.ai_api_key,
                base_url=settings.ai_base_url,
                organization=settings.ai_organization,
            )
        if provider in _GEMINI:
            return GeminiProvider(settings.ai_api_key)
        if provider in _BEDROCK:
            return BedrockProvider(
                region=settings.aws_region,
                access_key=settings.aws_access_key_id,
                secret_key=settings.aws_secret_access_key,
            )
        raise ValueError(
            f"Unknown AI provider: {settings.ai_provider!r}. "
            "Supported: anthropic, openai, gemini, bedrock "
            "(aliases: openrouter, local, openai_compatible, google, aws)."
        )
