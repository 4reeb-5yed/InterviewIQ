"""Domain models shared across agents, services, and API responses.

Pydantic v2 with camelCase aliasing on the wire (``populate_by_name`` allows
snake_case construction internally). Mirrors docs/DATABASE.md section 4 and
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


# --- Analysis outputs --------------------------------------------------------
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



# --- Career Intelligence Report (resume-only, always produced) ---------------
# Every score is 0-100 and MUST be accompanied by reasoning + supporting
# evidence drawn from the actual resume (no generic scores).


class EvidenceScore(CamelModel):
    """A 0-100 score with a label, reasoning, and resume-derived evidence."""

    score: int = Field(ge=0, le=100)
    rating: str
    reasoning: str
    evidence: list[str] = Field(default_factory=list)


class ATSIssue(CamelModel):
    issue: str
    severity: Literal["high", "medium", "low"]
    reasoning: str
    fix: str


class ATSReadiness(CamelModel):
    score: int = Field(ge=0, le=100)
    rating: str
    reasoning: str
    evidence: list[str] = Field(default_factory=list)
    issues: list[ATSIssue] = Field(default_factory=list)


class StrengthsWeaknesses(CamelModel):
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    reasoning: str


class CareerLevel(CamelModel):
    level: Literal["intern", "junior", "mid", "senior", "lead", "principal"]
    reasoning: str
    evidence: list[str] = Field(default_factory=list)


class RoleFit(CamelModel):
    role: str
    fit_score: int = Field(ge=0, le=100)
    reasoning: str


class GapItem(CamelModel):
    area: str
    action: str
    reasoning: str


class GapToNextLevel(CamelModel):
    target_level: str
    reasoning: str
    gaps: list[GapItem] = Field(default_factory=list)


class ROIImprovement(CamelModel):
    change: str
    impact: Literal["high", "medium", "low"]
    reasoning: str
    example_before: str | None = None
    example_after: str | None = None


class RoadmapStep(CamelModel):
    timeframe: str
    focus: str
    actions: list[str] = Field(default_factory=list)


class MissingSection(CamelModel):
    section: str
    importance: Literal["critical", "recommended", "optional"]
    reasoning: str


class HiddenStrength(CamelModel):
    strength: str
    evidence: str
    how_to_leverage: str


class CareerReport(CamelModel):
    """Comprehensive, evidence-based résumé intelligence (resume-only)."""

    ats_readiness: ATSReadiness
    resume_quality: EvidenceScore
    strengths_weaknesses: StrengthsWeaknesses
    career_level: CareerLevel
    role_matches: list[RoleFit] = Field(default_factory=list)
    employability: EvidenceScore
    interview_probability: EvidenceScore
    gap_to_next_level: GapToNextLevel
    roi_improvements: list[ROIImprovement] = Field(default_factory=list)
    career_roadmap: list[RoadmapStep] = Field(default_factory=list)
    missing_sections: list[MissingSection] = Field(default_factory=list)
    hidden_strengths: list[HiddenStrength] = Field(default_factory=list)
    overall_summary: str


class JobMatch(CamelModel):
    """The job-specific analysis, included only when a job description is given."""

    readiness_score: int | None = None
    summary: str | None = None
    skill_gaps: list[SkillGap] = Field(default_factory=list)
    predicted_questions: list[InterviewQuestion] = Field(default_factory=list)
