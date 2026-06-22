"""Question agent: job + skill gaps -> ranked predicted interview questions."""

from __future__ import annotations

import json

from app.agents.state import AgentState
from app.core.ai.base import AIProvider, AIRequest
from app.core.ai.json_retry import generate_json
from app.prompts.question_gen_prompt import SYSTEM_PROMPT, TEMPERATURE
from app.schemas.domain import InterviewQuestion


class QuestionAgent:
    """LangGraph node predicting likely interview questions."""

    def __init__(self, ai_provider: AIProvider, model: str) -> None:
        self._ai = ai_provider
        self._model = model

    async def run(self, state: AgentState) -> AgentState:
        job_data = state.get("job_data")
        if job_data is None:
            state["errors"].append("question_agent: missing job_data")
            return state

        skill_gaps = state.get("skill_gaps") or []
        payload = json.dumps(
            {
                "job": job_data.model_dump(mode="json"),
                "skill_gaps": [gap.model_dump(mode="json") for gap in skill_gaps],
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
        state["predicted_questions"] = [
            InterviewQuestion.model_validate(q) for q in data.get("questions", [])
        ]
        return state
