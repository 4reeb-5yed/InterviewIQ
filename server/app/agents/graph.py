"""LangGraph analysis pipeline.

Phase 1 enters at the skill-gap node because resumes and jobs are already parsed
at ingest time (Blocks 4/5). Nodes are composable, so a future full graph can
prepend the resume/job agents without changing these nodes.
"""

from __future__ import annotations

from langgraph.graph import END, StateGraph

from app.agents.question_agent import QuestionAgent
from app.agents.skill_gap_agent import SkillGapAgent
from app.agents.state import AgentState
from app.config.settings import Settings
from app.core.ai.base import AIProvider


def build_analysis_graph(ai_provider: AIProvider, settings: Settings):
    """Compile the skill-gap -> question analysis graph."""
    skill_gap_agent = SkillGapAgent(ai_provider, settings.skill_gap_agent_model)
    question_agent = QuestionAgent(ai_provider, settings.question_agent_model)

    graph = StateGraph(AgentState)
    graph.add_node("skill_gap_agent", skill_gap_agent.run)
    graph.add_node("question_agent", question_agent.run)
    graph.set_entry_point("skill_gap_agent")
    graph.add_edge("skill_gap_agent", "question_agent")
    graph.add_edge("question_agent", END)
    return graph.compile()
