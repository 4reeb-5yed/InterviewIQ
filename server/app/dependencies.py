"""Shared FastAPI dependency providers.

Centralizes construction of cross-feature collaborators (e.g. the AI provider)
so feature routers don't duplicate wiring. Per-request DB sessions come from
``app.db.dependencies.get_db``.
"""

from __future__ import annotations

from app.config.settings import Settings, get_settings
from app.core.ai.base import AIProvider
from app.core.ai.factory import AIProviderFactory
from app.core.cache.base import CacheStore
from app.core.cache.factory import build_cache
from app.core.tasks.base import TaskStore
from app.core.tasks.factory import build_task_store
from functools import lru_cache


def get_ai_provider() -> AIProvider:
    """Build the configured AI provider from settings."""
    settings: Settings = get_settings()
    return AIProviderFactory.create(settings.ai_provider, settings.ai_api_key)


@lru_cache
def get_cache() -> CacheStore:
    """Process-wide cache singleton (shared across requests and background tasks)."""
    return build_cache(get_settings())


@lru_cache
def get_task_store() -> TaskStore:
    """Process-wide task store singleton (so submit and poll share state)."""
    return build_task_store(get_settings())
