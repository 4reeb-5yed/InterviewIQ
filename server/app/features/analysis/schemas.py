"""Request/response schemas for the analysis feature."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.db.models import Analysis
from app.schemas.domain import CamelModel, InterviewQuestion, SkillGap


class RunAnalysisRequest(CamelModel):
    resume_id: UUID
    job_id: UUID


class RunAnalysisResponse(CamelModel):
    task_id: UUID


class TaskStatusResponse(CamelModel):
    task_id: UUID
    status: str
    result: dict | None = None
    error: str | None = None


class AnalysisResultResponse(CamelModel):
    analysis_id: UUID
    readiness_score: int | None
    skill_gaps: list[SkillGap]
    predicted_questions: list[InterviewQuestion]
    summary: str | None
    resume_id: UUID
    job_id: UUID
    created_at: datetime

    @classmethod
    def from_model(cls, analysis: Analysis) -> "AnalysisResultResponse":
        return cls(
            analysis_id=analysis.id,
            readiness_score=analysis.readiness_score,
            skill_gaps=[SkillGap.model_validate(g) for g in (analysis.skill_gaps or [])],
            predicted_questions=[
                InterviewQuestion.model_validate(q) for q in (analysis.predicted_questions or [])
            ],
            summary=analysis.summary,
            resume_id=analysis.resume_id,
            job_id=analysis.job_id,
            created_at=analysis.created_at,
        )
