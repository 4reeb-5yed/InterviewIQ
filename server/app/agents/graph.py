"""LangGraph analysis pipeline (career intelligence + optional job match).

The graph always runs the career-intelligence node on the parsed resume. A
conditional edge then routes into the job-match branch (skill gap -> questions)
only when a job description was provided; otherwise it ends. This extends the
existing pipeline rather than introducing a separate workflow.

    career_agent ──(job_data?)──> skill_gap_agent -> question_agent -> END
                 └──(no job)────> END
"""

from __future__ import annotations

from typing import Literal

from langgraph.graph import END, StateGraph

from app.agents.career_agent import CareerIntelligenceAgent
from app.agents.question_agent import QuestionAgent
from app.agents.skill_gap_agent import SkillGapAgent
from app.agents.state import AgentState
from app.config.settings import Settings
from app.core.ai.base import AIProvider


def _route_after_career(state: AgentState) -> Literal["job", "end"]:
    return "job" if state.get("job_data") is not None else "end"


def build_analysis_graph(ai_provider: AIProvider, settings: Settings):
    """Compile career -> (optional) skill-gap -> question graph."""
    career_agent = CareerIntelligenceAgent(ai_provider, settings.career_agent_model)
    skill_gap_agent = SkillGapAgent(ai_provider, settings.skill_gap_agent_model)
    question_agent = QuestionAgent(ai_provider, settings.question_agent_model)

    graph = StateGraph(AgentState)
    graph.add_node("career_agent", career_agent.run)
    graph.add_node("skill_gap_agent", skill_gap_agent.run)
    graph.add_node("question_agent", question_agent.run)

    graph.set_entry_point("career_agent")
    graph.add_conditional_edges(
        "career_agent",
        _route_after_career,
        {"job": "skill_gap_agent", "end": END},
    )
    graph.add_edge("skill_gap_agent", "question_agent")
    graph.add_edge("question_agent", END)
    return graph.compile()
