"""Unit test for SkillGapAgent output shape (mock AIProvider)."""

from __future__ import annotations

import json

from app.agents.skill_gap_agent import SkillGapAgent
from app.agents.state import AgentState
from app.schemas.domain import JobData, ResumeData, Skills, SkillGap


def _seed_state() -> AgentState:
    return {
        "resume_text": "...",
        "job_description": "...",
        "resume_data": ResumeData(name="Jane", skills=Skills(technical=["Python"], soft=[])),
        "job_data": JobData(
            title="Backend Engineer",
            company="Acme",
            required_skills=["Python", "PostgreSQL"],
            nice_to_have_skills=[],
            seniority_level="junior",
            domain="fintech",
        ),
        "skill_gaps": None,
        "readiness_score": None,
        "summary": None,
        "predicted_questions": None,
        "errors": [],
    }


async def test_skill_gap_output_shape(make_provider):
    payload = json.dumps(
        {
            "skill_gaps": [
                {
                    "skill": "PostgreSQL",
                    "status": "missing",
                    "importance": "critical",
                    "confidence_score": 0.9,
                }
            ],
            "readiness_score": 65,
            "summary": "Solid Python; close the SQL gap.",
        }
    )
    agent = SkillGapAgent(make_provider([payload]), "model-x")

    state = await agent.run(_seed_state())

    assert state["readiness_score"] == 65
    assert state["summary"] == "Solid Python; close the SQL gap."
    assert len(state["skill_gaps"]) == 1
    gap = state["skill_gaps"][0]
    assert isinstance(gap, SkillGap)
    assert gap.skill == "PostgreSQL"
    assert gap.status == "missing"
