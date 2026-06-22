"""Resume agent: raw resume text -> structured ResumeData."""

from __future__ import annotations

from app.core.ai.base import AIProvider, AIRequest
from app.core.ai.json_retry import generate_json
from app.prompts.resume_prompt import SYSTEM_PROMPT, TEMPERATURE
from app.schemas.domain import ResumeData


class ResumeAgent:
    """Parses resume text into :class:`ResumeData` via the AI provider."""

    def __init__(self, ai_provider: AIProvider, model: str) -> None:
        self._ai = ai_provider
        self._model = model

    async def run(self, resume_text: str) -> ResumeData:
        request = AIRequest(
            system_prompt=SYSTEM_PROMPT,
            user_message=resume_text,
            model=self._model,
            temperature=TEMPERATURE,
        )
        data = await generate_json(self._ai, request)
        return ResumeData.model_validate(data)
