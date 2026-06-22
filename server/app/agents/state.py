"""Typed state flowing through the LangGraph analysis pipeline."""

from __future__ import annotations

from typing import TypedDict

from app.schemas.domain import CareerReport, InterviewQuestion, JobData, ResumeData, SkillGap


class AgentState(TypedDict):
    """Shared state for the analysis graph.

    The graph always runs the career-intelligence node on ``resume_data``. When
    ``job_data`` is present it additionally runs the skill-gap and question
    nodes. ``summary`` carries the skill-gap agent's prose summary, and
    ``career_report`` carries the resume-only intelligence report, through to
    persistence.
    """

    resume_text: str
    job_description: str
    resume_data: ResumeData | None
    job_data: JobData | None
    career_report: CareerReport | None
    skill_gaps: list[SkillGap] | None
    readiness_score: int | None
    summary: str | None
    predicted_questions: list[InterviewQuestion] | None
    errors: list[str]
