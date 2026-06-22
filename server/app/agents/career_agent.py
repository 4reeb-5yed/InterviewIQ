"""Career intelligence agent: resume_data -> evidence-based CareerReport.

Always runs (resume-only). Independent of any job description, so the report is
produced whether or not a JD is provided.
"""

from __future__ import annotations

import json

from app.agents.state import AgentState
from app.core.ai.base import AIProvider, AIRequest
from app.core.ai.json_retry import generate_json
from app.prompts.career_prompt import SYSTEM_PROMPT, TEMPERATURE
from app.schemas.domain import CareerReport

# The report is large; allow more output tokens than the default.
_MAX_TOKENS = 4000
# Cap raw-text evidence context to keep prompts bounded.
_MAX_RESUME_TEXT = 8000


class CareerIntelligenceAgent:
    """Produces the comprehensive, evidence-based career report."""

    def __init__(self, ai_provider: AIProvider, model: str) -> None:
        self._ai = ai_provider
        self._model = model

    async def run(self, state: AgentState) -> AgentState:
        resume_data = state.get("resume_data")
        if resume_data is None:
            state["errors"].append("career_agent: missing resume_data")
            return state

        payload = json.dumps(
            {
                "resume": resume_data.model_dump(mode="json"),
                "resume_text": (state.get("resume_text") or "")[:_MAX_RESUME_TEXT],
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
                max_tokens=_MAX_TOKENS,
            ),
        )
        state["career_report"] = CareerReport.model_validate(data)
        return state
