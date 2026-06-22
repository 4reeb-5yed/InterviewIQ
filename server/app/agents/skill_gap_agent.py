"""Skill gap agent: resume_data + job_data -> skill gaps + readiness + summary."""

from __future__ import annotations

import json

from app.agents.state import AgentState
from app.core.ai.base import AIProvider, AIRequest
from app.core.ai.json_retry import generate_json
from app.prompts.skill_gap_prompt import SYSTEM_PROMPT, TEMPERATURE
from app.schemas.domain import SkillGap


class SkillGapAgent:
    """LangGraph node assessing the candidate against the job."""

    def __init__(self, ai_provider: AIProvider, model: str) -> None:
        self._ai = ai_provider
        self._model = model

    async def run(self, state: AgentState) -> AgentState:
        resume_data = state.get("resume_data")
        job_data = state.get("job_data")
        if resume_data is None or job_data is None:
            state["errors"].append("skill_gap_agent: missing resume_data or job_data")
            return state

        payload = json.dumps(
            {
                "resume": resume_data.model_dump(mode="json"),
                "job": job_data.model_dump(mode="json"),
            },
            ensure_ascii=False,
        )
        data = await generate_json(
            self._ai,
            AIRequest(
                system_prompt=SYSTEM_PROMPT,
                user_message=payload,
                model=self._model,
                temperature=TEMPERATURE,
            ),
        )
        state["skill_gaps"] = [SkillGap.model_validate(g) for g in data.get("skill_gaps", [])]
        score = data.get("readiness_score")
        state["readiness_score"] = int(score) if score is not None else None
        state["summary"] = data.get("summary")
        return state
