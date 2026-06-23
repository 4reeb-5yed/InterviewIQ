"""Typed application settings loaded from environment / .env.

All configuration comes from environment variables (see docs/SETUP_GUIDE.md and
docs/TASKS.md T02). No values are hardcoded in business logic; modules read from
the singleton returned by :func:`get_settings`.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Backend configuration.

    Defaults are chosen so the application boots in local development. Production
    overrides every value via environment variables (Render dashboard, etc.).
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Server ---------------------------------------------------------------
    port: int = 8000
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"

    # --- AI provider (provider-agnostic) -------------------------------------
    # AI_PROVIDER selects the implementation: anthropic | openai | gemini | bedrock.
    # Aliases mapping to the OpenAI-compatible client: openrouter | local |
    # openai_compatible (use AI_BASE_URL to point at OpenRouter, Ollama, vLLM,
    # LM Studio, Together, etc.).
    ai_provider: str = "anthropic"
    ai_api_key: str = ""

    # Optional connection overrides for OpenAI-compatible endpoints (OpenRouter,
    # local LLMs). When AI_BASE_URL is set, the OpenAI client targets it.
    ai_base_url: str | None = None
    ai_organization: str | None = None

    # AWS Bedrock credentials/region. If access key/secret are omitted, boto3's
    # default chain (env vars, shared config, instance role) is used.
    aws_region: str | None = None
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None

    # --- Per-agent model identifiers (no hardcoding in business logic) -------
    resume_agent_model: str = "gemini-3.1-flash-lite"
    job_agent_model: str = "gemini-3.1-flash-lite"
    career_agent_model: str = "gemini-3.1-flash-lite"
    skill_gap_agent_model: str = "gemini-3.1-flash-lite"
    question_agent_model: str = "gemini-3.1-flash-lite"

    # --- Database -------------------------------------------------------------
    database_url: str = (
        "postgresql+asyncpg://interviewiq:interviewiq@localhost:5432/interviewiq"
    )

    # --- Uploads --------------------------------------------------------------
    max_file_size_mb: int = 5

    # --- Rate limiting --------------------------------------------------------
    rate_limit_window_seconds: int = 60
    rate_limit_max_requests: int = 30

    # --- Cache ----------------------------------------------------------------
    cache_analysis_ttl_seconds: int = 86400

    # --- Optional Redis (unset => in-memory cache/task implementations) ------
    redis_url: str | None = None

    # --- Feature flags (all disabled for Phase 1) ----------------------------
    enable_rag: bool = False
    enable_memory: bool = False
    enable_company_intelligence: bool = False

    @property
    def allowed_origins_list(self) -> list[str]:
        """CORS origins parsed from the comma-separated ``ALLOWED_ORIGINS`` value."""
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def rate_limit(self) -> str:
        """slowapi-compatible limit string, e.g. ``"30/60 seconds"``."""
        return f"{self.rate_limit_max_requests}/{self.rate_limit_window_seconds} seconds"


@lru_cache
def get_settings() -> Settings:
    """Return the cached settings singleton."""
    return Settings()
