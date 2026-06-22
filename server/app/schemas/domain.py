"""Domain models shared across agents, services, and API responses.

Pydantic v2 with camelCase aliasing on the wire (``populate_by_name`` allows
snake_case construction internally). Mirrors docs/DATABASE.md and
docs/API_CONTRACTS.md.
"""

from __future__ import annotations

from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base model emitting camelCase aliases while accepting snake_case."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# --- Resume ------------------------------------------------------------------
class Skills(CamelModel):
    technical: list[str] = Field(default_factory=list)
    soft: list[str] = Field(default_factory=list)


class ExperienceItem(CamelModel):
    title: str
    company: str
    years: float | None = None


class EducationItem(CamelModel):
    degree: str
    institution: str


class ProjectItem(CamelModel):
    name: str
    description: str | None = None


class ResumeData(CamelModel):
    name: str
    skills: Skills = Field(default_factory=Skills)
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)


# --- Job ---------------------------------------------------------------------
class JobData(CamelModel):
    title: str
    company: str
    required_skills: list[str] = Field(default_factory=list)
    nice_to_have_skills: list[str] = Field(default_factory=list)
    seniority_level: Literal["junior", "mid", "senior"]
    domain: str


# --- Job-match outputs -------------------------------------------------------
class SkillGap(CamelModel):
    skill: str
    status: Literal["matched", "partial", "missing"]
    importance: Literal["critical", "moderate", "low"]
    confidence_score: float = Field(ge=0.0, le=1.0)


class InterviewQuestion(CamelModel):
    id: UUID = Field(default_factory=uuid4)
    text: str
    type: Literal["technical", "behavioral", "system-design", "trap"]
    difficulty: Literal["easy", "medium", "hard"]
    topic: str
    likelihood_score: float = Field(ge=0.0, le=1.0)


# =============================================================================
# Career Intelligence Report (resume-only, evidence-driven)
# Every scored dimension carries reasoning + what evidence was found AND what
# was missing. When a field cannot be evaluated, status="insufficient_data".
# =============================================================================


class ScoredDimension(CamelModel):
    """A 0-100 score that must trace back to actual resume content."""

    status: Literal["ok", "insufficient_data"] = "ok"
    score: int | None = Field(default=None, ge=0, le=100)
    reasoning: str
    evidence_found: list[str] = Field(default_factory=list)
    evidence_missing: list[str] = Field(default_factory=list)
    # Populated only when status == "insufficient_data".
    reason: str | None = None


class CareerLevelAssessment(ScoredDimension):
    """Career level classification (with the four scored fields + a label)."""

    level: str = ""


class ATSField(CamelModel):
    field: str
    status: Literal["pass", "fail", "at_risk"]
    reason: str


class ATSSimulation(CamelModel):
    """Field-by-field ATS parse simulation + parsing risks."""

    fields: list[ATSField] = Field(default_factory=list)
    parsing_risks: list[str] = Field(default_factory=list)


class RoleFit(CamelModel):
    """A realistic-now role match with explicit drivers and blockers."""

    role: str
    fit_score: int = Field(ge=0, le=100)
    tier: Literal["realistic", "stretch"]
    reasoning: str
    fit_drivers: list[str] = Field(default_factory=list)
    fit_blockers: list[str] = Field(default_factory=list)


class Gap(CamelModel):
    gap: str
    why_it_matters: str
    how_to_acquire: str


class GapAnalysis(CamelModel):
    current_level: str
    target_level: str
    gaps: list[Gap] = Field(default_factory=list)


class CredibilityIssue(CamelModel):
    issue_type: Literal[
        "Skills Without Evidence",
        "Unproven Claim",
        "Weak Project",
        "Buzzword",
        "Missing Metric",
    ]
    flagged_text: str
    problem: str
    fix: str


class ROIImprovement(CamelModel):
    priority: Literal["high", "medium", "low"]
    change: str
    reason: str
    expected_impact: str
    before: str
    after: str


class Strength(CamelModel):
    strength: str
    evidence: str


class CareerReport(CamelModel):
    """Comprehensive, evidence-based résumé intelligence (resume-only)."""

    ats_readiness: ScoredDimension
    resume_quality: ScoredDimension
    employability: ScoredDimension
    interview_probability: ScoredDimension
    career_level: CareerLevelAssessment
    ats_simulation: ATSSimulation
    market_fit: list[RoleFit] = Field(default_factory=list)
    gap_analysis: GapAnalysis
    credibility_issues: list[CredibilityIssue] = Field(default_factory=list)
    roi_improvements: list[ROIImprovement] = Field(default_factory=list)
    strengths: list[Strength] = Field(default_factory=list)
    overall_summary: str


class JobMatch(CamelModel):
    """The job-specific analysis, included only when a job description is given."""

    readiness_score: int | None = None
    summary: str | None = None
    skill_gaps: list[SkillGap] = Field(default_factory=list)
    predicted_questions: list[InterviewQuestion] = Field(default_factory=list)
