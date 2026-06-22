"""Shared FastAPI dependency providers.

Centralizes construction of cross-feature collaborators (e.g. the AI provider)
so feature routers don't duplicate wiring. Per-request DB sessions come from
``app.db.dependencies.get_db``.
"""

from __future__ import annotations

from app.config.settings import Settings, get_settings
from app.core.ai.base import AIProvider
from app.core.ai.factory import AIProviderFactory


def get_ai_provider() -> AIProvider:
    """Build the configured AI provider from settings."""
    settings: Settings = get_settings()
    return AIProviderFactory.create(settings.ai_provider, settings.ai_api_key)
