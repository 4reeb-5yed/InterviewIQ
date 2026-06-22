"""Persistence for jobs. Only place that touches the DB for this aggregate."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Job


class JobRepository:
    """Data access for :class:`Job` rows."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, job: Job) -> Job:
        self._session.add(job)
        await self._session.commit()
        await self._session.refresh(job)
        return job

    async def get_by_id(self, job_id: UUID) -> Job | None:
        return await self._session.get(Job, job_id)
