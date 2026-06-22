"""SQLAlchemy 2.0 async engine, session factory, and declarative base.

The engine reads ``DATABASE_URL`` (async driver, e.g. ``postgresql+asyncpg://``)
from settings. Repositories receive an ``AsyncSession`` via the ``get_db``
dependency; nothing else touches the engine directly.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config.settings import get_settings


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


def _build_engine() -> AsyncEngine:
    settings = get_settings()
    return create_async_engine(settings.database_url, future=True, echo=False)


engine: AsyncEngine = _build_engine()

SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)
