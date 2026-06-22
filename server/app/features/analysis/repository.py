"""Persistence for analyses. Only place that touches the DB for this aggregate."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Analysis


class AnalysisRepository:
    """Data access for :class:`Analysis` rows."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_pending(self, resume_id: UUID, job_id: UUID | None) -> Analysis:
        analysis = Analysis(resume_id=resume_id, job_id=job_id, status="pending")
        self._session.add(analysis)
        await self._session.commit()
        await self._session.refresh(analysis)
        return analysis

    async def update_result(
        self,
        analysis_id: UUID,
        *,
        career_report: dict | None,
        readiness_score: int | None,
        skill_gaps: list[dict] | None,
        predicted_questions: list[dict] | None,
        summary: str | None,
        status: str,
        error: str | None,
    ) -> Analysis | None:
        analysis = await self._session.get(Analysis, analysis_id)
        if analysis is None:
            return None
        analysis.career_report = career_report
        analysis.readiness_score = readiness_score
        analysis.skill_gaps = skill_gaps
        analysis.predicted_questions = predicted_questions
        analysis.summary = summary
        analysis.status = status
        analysis.error = error
        await self._session.commit()
        await self._session.refresh(analysis)
        return analysis

    async def get_by_id(self, analysis_id: UUID) -> Analysis | None:
        return await self._session.get(Analysis, analysis_id)

    async def find_existing(self, resume_id: UUID, job_id: UUID | None) -> Analysis | None:
        """Latest completed analysis for a resume + (optional) job pair."""
        stmt = select(Analysis).where(
            Analysis.resume_id == resume_id,
            Analysis.status == "completed",
        )
        if job_id is None:
            stmt = stmt.where(Analysis.job_id.is_(None))
        else:
            stmt = stmt.where(Analysis.job_id == job_id)
        stmt = stmt.order_by(Analysis.created_at.desc()).limit(1)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
