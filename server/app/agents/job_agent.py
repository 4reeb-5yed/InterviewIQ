"""Job agent: raw job description text -> structured JobData."""

from __future__ import annotations

from app.core.ai.base import AIProvider, AIRequest
from app.core.ai.json_retry import generate_json
from app.prompts.job_prompt import SYSTEM_PROMPT, TEMPERATURE
from app.schemas.domain import JobData


class JobAgent:
    """Parses job text into :class:`JobData` via the AI provider."""

    def __init__(self, ai_provider: AIProvider, model: str) -> None:
        self._ai = ai_provider
        self._model = model

    async def run(self, job_text: str) -> JobData:
        request = AIRequest(
            system_prompt=SYSTEM_PROMPT,
            user_message=job_text,
            model=self._model,
            temperature=TEMPERATURE,
        )
        data = await generate_json(self._ai, request)
        return JobData.model_validate(data)
