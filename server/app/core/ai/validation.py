"""Startup validation of provider-specific AI configuration.

Called once at application startup so misconfiguration fails fast with a clear
message instead of erroring on the first analysis request.
"""

from __future__ import annotations

from app.config.settings import Settings

_OPENAI_COMPATIBLE = {"openai", "openai_compatible", "openrouter", "local"}
_GEMINI = {"gemini", "google"}
_BEDROCK = {"bedrock", "aws"}
_KNOWN = {"anthropic"} | _OPENAI_COMPATIBLE | _GEMINI | _BEDROCK


class AIConfigError(RuntimeError):
    """Raised when the selected AI provider is missing required configuration."""


def validate_ai_config(settings: Settings) -> None:
    """Validate that the selected provider has the credentials it needs."""
    provider = settings.ai_provider.strip().lower()

    if provider not in _KNOWN:
        raise AIConfigError(
            f"AI_PROVIDER={settings.ai_provider!r} is not supported. "
            "Choose anthropic, openai, gemini, or bedrock "
            "(aliases: openrouter, local, google, aws)."
        )

    if provider == "anthropic":
        _require(settings.ai_api_key, "AI_API_KEY", "Anthropic")

    elif provider in _OPENAI_COMPATIBLE:
        # A hosted endpoint needs a key; a local one may not, but then needs a base URL.
        if not settings.ai_api_key and not settings.ai_base_url:
            raise AIConfigError(
                "OpenAI-compatible provider requires AI_API_KEY, or AI_BASE_URL "
                "for a local endpoint that does not require a key (e.g. Ollama)."
            )

    elif provider in _GEMINI:
        _require(settings.ai_api_key, "AI_API_KEY", "Gemini")

    elif provider in _BEDROCK:
        if not settings.aws_region:
            raise AIConfigError(
                "Bedrock requires AWS_REGION. Provide AWS_ACCESS_KEY_ID and "
                "AWS_SECRET_ACCESS_KEY, or rely on the default AWS credential chain."
            )


def _require(value: str, env_name: str, provider_label: str) -> None:
    if not value:
        raise AIConfigError(f"{provider_label} requires {env_name} to be set.")
