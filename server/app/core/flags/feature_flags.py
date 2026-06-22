"""Typed wrapper over settings flags, so behavior is easily mockable in tests."""

from __future__ import annotations

from app.config.settings import Settings


class FeatureFlags:
    """Read-only accessors for Phase-gated features (all disabled in Phase 1)."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @property
    def rag_enabled(self) -> bool:
        return self._settings.enable_rag

    @property
    def memory_enabled(self) -> bool:
        return self._settings.enable_memory

    @property
    def company_intelligence_enabled(self) -> bool:
        return self._settings.enable_company_intelligence
