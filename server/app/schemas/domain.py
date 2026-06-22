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
