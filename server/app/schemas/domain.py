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

Confidence = Literal["high", "medium", "low"]


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
# Career Intelligence Report — recruiter + ATS + hiring-manager audit.
# Strict evidence + confidence on every conclusion. Context-aware (fair to
# students / personal / portfolio / academic work). Never fabricates metrics;
# uses status="insufficient_data" instead of guessing.
# =============================================================================


class ScoredDimension(CamelModel):
    """A 0-100 score that must trace to resume content, with a confidence level."""

    status: Literal["ok", "insufficient_data"] = "ok"
    score: int | None = Field(default=None, ge=0, le=100)
    confidence: Confidence = "low"
    reasoning: str
    evidence_found: list[str] = Field(default_factory=list)
    evidence_missing: list[str] = Field(default_factory=list)
    reason: str | None = None  # populated when status == "insufficient_data"


class CandidateContext(CamelModel):
    """Detected stage so evaluation standards fit the candidate."""

    stage: Literal["student", "early_career", "mid", "senior", "unknown"]
    reasoning: str
    evidence: list[str] = Field(default_factory=list)


# --- True ATS analysis -------------------------------------------------------
class ATSField(CamelModel):
    field: str
    status: Literal["pass", "fail", "at_risk"]
    reason: str


class ATSAnalysis(CamelModel):
    score: int | None = Field(default=None, ge=0, le=100)
    confidence: Confidence = "low"
    reasoning: str
    evidence: list[str] = Field(default_factory=list)
    fields: list[ATSField] = Field(default_factory=list)
    blockers: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    interpretation: str  # how an ATS is likely to read this resume


# --- Section-by-section review ----------------------------------------------
class SectionReview(CamelModel):
    section: Literal[
        "Contact Information",
        "Summary",
        "Education",
        "Experience",
        "Projects",
        "Skills",
        "Certifications",
        "Achievements",
        "Portfolio / Links",
    ]
    status: Literal["present", "missing"]
    score: int | None = Field(default=None, ge=0, le=100)
    confidence: Confidence = "low"
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    missing_elements: list[str] = Field(default_factory=list)
    evidence: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


# --- Project context awareness ----------------------------------------------
ProjectCategory = Literal[
    "Learning",
    "Academic",
    "Personal",
    "Portfolio",
    "Open Source",
    "Freelance",
    "Startup",
    "Commercial",
    "Enterprise",
    "Unknown",
]


class ProjectAssessment(CamelModel):
    """Evaluate a project by its likely purpose; separate engineering vs business impact."""

    name: str
    category: ProjectCategory
    category_confidence: Confidence = "low"
    engineering_impact: str
    engineering_signals: list[str] = Field(default_factory=list)
    # "Insufficient Evidence" unless the project was clearly for real users/commercial use.
    business_impact: str | None = None
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    missing_evidence: list[str] = Field(default_factory=list)
    score: int | None = Field(default=None, ge=0, le=100)
    confidence: Confidence = "low"


# --- Recruiter simulation ----------------------------------------------------
class TenSecondScan(CamelModel):
    first_impression: str
    most_noticeable_strength: str
    most_noticeable_weakness: str
    keeps_reading_probability: int = Field(ge=0, le=100)
    confidence: Confidence = "low"


class ThirtySecondScan(CamelModel):
    what_recruiter_learns: list[str] = Field(default_factory=list)
    concerns: list[str] = Field(default_factory=list)
    positive_signals: list[str] = Field(default_factory=list)


class FullReview(CamelModel):
    overall_assessment: str
    hireability: str
    risks: list[str] = Field(default_factory=list)
    strong_points: list[str] = Field(default_factory=list)


class RecruiterSimulation(CamelModel):
    ten_second: TenSecondScan
    thirty_second: ThirtySecondScan
    full_review: FullReview
    verdict: Literal["Strong Shortlist", "Shortlist", "Maybe", "Weak Maybe", "Reject"]
    verdict_reasoning: str
    confidence: Confidence = "low"


# --- Job-market positioning ---------------------------------------------------
class RoleFit(CamelModel):
    role: str
    tier: Literal["realistic", "stretch", "unlikely"]
    fit_score: int = Field(ge=0, le=100)
    confidence: Confidence = "low"
    why_fits: list[str] = Field(default_factory=list)
    why_not: list[str] = Field(default_factory=list)


class MarketPositioning(CamelModel):
    current_level: str
    reasoning: str
    roles: list[RoleFit] = Field(default_factory=list)


# --- Gap analysis ------------------------------------------------------------
class Gap(CamelModel):
    gap: str
    why_employers_care: str
    how_evaluated: str
    how_to_acquire: str
    expected_impact: str


class GapAnalysis(CamelModel):
    current_level: str
    target_level: str
    gaps: list[Gap] = Field(default_factory=list)


# --- Credibility -------------------------------------------------------------
class CredibilityIssue(CamelModel):
    issue_type: Literal[
        "Buzzword",
        "Skill Without Evidence",
        "Claim Without Proof",
        "Weak Project Description",
        "Overstated Achievement",
        "Missing Supporting Detail",
    ]
    flagged_text: str
    why_flagged: str
    evidence_issue: str
    suggested_improvement: str


# --- Resume-to-career projection ---------------------------------------------
class CareerProjection(CamelModel):
    employability: ScoredDimension
    internship_probability: ScoredDimension
    entry_level_probability: ScoredDimension
    interview_probability: ScoredDimension
    startup_suitability: ScoredDimension
    enterprise_suitability: ScoredDimension


# --- Improvement prioritization ----------------------------------------------
class ROIImprovement(CamelModel):
    priority: Literal["high", "medium", "low"]
    change: str
    why_it_matters: str
    expected_benefit: str
    before: str
    after: str
    estimated_impact: str


class Strength(CamelModel):
    strength: str
    evidence: str
    confidence: Confidence = "low"


class CareerReport(CamelModel):
    """Combined recruiter / ATS / hiring-manager / career-intelligence audit."""

    candidate_context: CandidateContext
    ats: ATSAnalysis
    section_reviews: list[SectionReview] = Field(default_factory=list)
    project_assessments: list[ProjectAssessment] = Field(default_factory=list)
    recruiter_simulation: RecruiterSimulation
    market_positioning: MarketPositioning
    gap_analysis: GapAnalysis
    credibility_issues: list[CredibilityIssue] = Field(default_factory=list)
    career_projection: CareerProjection
    roi_improvements: list[ROIImprovement] = Field(default_factory=list)
    strengths: list[Strength] = Field(default_factory=list)
    overall_summary: str


class JobMatch(CamelModel):
    """The job-specific analysis, included only when a job description is given."""

    readiness_score: int | None = None
    summary: str | None = None
    skill_gaps: list[SkillGap] = Field(default_factory=list)
    predicted_questions: list[InterviewQuestion] = Field(default_factory=list)
