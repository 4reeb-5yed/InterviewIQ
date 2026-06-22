"""Integration test: the analysis graph end-to-end with a fake provider.

Exercises the analyze happy path (skill_gap -> question) without a database.
The full HTTP + Postgres end-to-end is verified in an environment with those
dependencies available.
"""

from __future__ import annotations

import json

from app.agents.graph import build_analysis_graph
from app.agents.state import AgentState
from app.config.settings import Settings
from app.schemas.domain import JobData, ResumeData, Skills


async def test_graph_produces_gaps_and_questions(make_provider):
    skill_gap_json = json.dumps(
        {
            "skill_gaps": [
                {
                    "skill": "SQL",
                    "status": "partial",
                    "importance": "moderate",
                    "confidence_score": 0.5,
                }
            ],
            "readiness_score": 70,
            "summary": "Good foundation.",
        }
    )
    questions_json = json.dumps(
        {
            "questions": [
                {
                    "text": "Explain database indexing.",
                    "type": "technical",
                    "difficulty": "medium",
                    "topic": "databases",
                    "likelihood_score": 0.8,
                }
            ]
        }
    )
    provider = make_provider([skill_gap_json, questions_json])
    graph = build_analysis_graph(provider, Settings())

    state: AgentState = {
        "resume_text": "r",
        "job_description": "j",
        "resume_data": ResumeData(name="Jane", skills=Skills(technical=["Python"], soft=[])),
        "job_data": JobData(
            title="Backend Engineer",
            company="Acme",
            required_skills=["SQL"],
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

    final = await graph.ainvoke(state)

    assert final["readiness_score"] == 70
    assert len(final["skill_gaps"]) == 1
    assert len(final["predicted_questions"]) == 1
    assert final["predicted_questions"][0].topic == "databases"
