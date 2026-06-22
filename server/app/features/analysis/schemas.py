"""Request/response schemas for the analysis feature."""

from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from app.db.models import Analysis
from app.schemas.domain import (
    CamelModel,
    CareerReport,
    InterviewQuestion,
    JobMatch,
    SkillGap,
)


class RunAnalysisRequest(CamelModel):
    resume_id: UUID
    # Job description is optional: omit for a resume-only Career Intelligence Report.
    job_id: UUID | None = None


class RunAnalysisResponse(CamelModel):
    task_id: UUID


class TaskStatusResponse(CamelModel):
    task_id: UUID
    status: str
    result: dict | None = None
    error: str | None = None


class AnalysisResultResponse(CamelModel):
    analysis_id: UUID
    mode: Literal["resume_only", "job_match"]
    career_report: CareerReport | None
    job_match: JobMatch | None
    resume_id: UUID
    job_id: UUID | None
    created_at: datetime

    @classmethod
    def from_model(cls, analysis: Analysis) -> "AnalysisResultResponse":
        career_report = (
            CareerReport.model_validate(analysis.career_report)
            if analysis.career_report
            else None
        )
        job_match: JobMatch | None = None
        if analysis.job_id is not None:
            job_match = JobMatch(
                readiness_score=analysis.readiness_score,
                summary=analysis.summary,
                skill_gaps=[SkillGap.model_validate(g) for g in (analysis.skill_gaps or [])],
                predicted_questions=[
                    InterviewQuestion.model_validate(q)
                    for q in (analysis.predicted_questions or [])
                ],
            )
        return cls(
            analysis_id=analysis.id,
            mode="job_match" if analysis.job_id is not None else "resume_only",
            career_report=career_report,
            job_match=job_match,
            resume_id=analysis.resume_id,
            job_id=analysis.job_id,
            created_at=analysis.created_at,
        )
