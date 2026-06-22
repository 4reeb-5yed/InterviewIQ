"""Persistence for resumes. Only place that touches the DB for this aggregate."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Resume


class ResumeRepository:
    """Data access for :class:`Resume` rows."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, resume: Resume) -> Resume:
        self._session.add(resume)
        await self._session.commit()
        await self._session.refresh(resume)
        return resume

    async def get_by_id(self, resume_id: UUID) -> Resume | None:
        return await self._session.get(Resume, resume_id)
