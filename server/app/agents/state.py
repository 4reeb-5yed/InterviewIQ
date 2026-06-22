"""Typed state flowing through the LangGraph analysis pipeline."""

from __future__ import annotations

from typing import TypedDict

from app.schemas.domain import InterviewQuestion, JobData, ResumeData, SkillGap


class AgentState(TypedDict):
    """Shared state for the analysis graph.

    ``resume_data`` / ``job_data`` are seeded by the service (resumes and jobs
    are parsed at ingest time in Blocks 4/5), so the Phase 1 graph enters at the
    skill-gap node. ``summary`` carries the skill-gap agent's prose summary
    through to persistence.
    """

    resume_text: str
    job_description: str
    resume_data: ResumeData | None
    job_data: JobData | None
    skill_gaps: list[SkillGap] | None
    readiness_score: int | None
    summary: str | None
    predicted_questions: list[InterviewQuestion] | None
    errors: list[str]
