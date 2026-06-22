"""structlog configuration.

Console renderer in development, JSON in other environments. The codebase logs
exclusively through structlog (never ``print``), per docs/AGENT_HANDOFF.md.
"""

from __future__ import annotations

import logging
from typing import Any

import structlog


def configure_logging(environment: str = "development") -> None:
    """Configure structlog once at application startup."""
    renderer: structlog.types.Processor = (
        structlog.dev.ConsoleRenderer()
        if environment == "development"
        else structlog.processors.JSONRenderer()
    )
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str | None = None) -> Any:
    """Return a bound structlog logger."""
    return structlog.get_logger(name)
