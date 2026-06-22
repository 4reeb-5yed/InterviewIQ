"""Resume business logic: validate -> extract text -> parse -> persist."""

from __future__ import annotations

from typing import Any
from uuid import UUID

from app.config.settings import Settings
from app.core.ai.base import AIProvider
from app.agents.resume_agent import ResumeAgent
from app.db.models import Resume
from app.features.resume.repository import ResumeRepository
from app.schemas.domain import ResumeData
from app.utils.pdf_parser import extract_text_from_pdf


class InvalidUploadError(Exception):
    """Raised when the uploaded file fails type/size validation."""


class ResumeService:
    """Orchestrates resume upload: guards, parsing, AI extraction, persistence."""

    def __init__(
        self,
        ai_provider: AIProvider,
        repository: ResumeRepository,
        settings: Settings,
        logger: Any,
    ) -> None:
        self._agent = ResumeAgent(ai_provider, settings.resume_agent_model)
        self._repo = repository
        self._settings = settings
        self._log = logger

    async def upload(
        self, filename: str, content_type: str | None, data: bytes
    ) -> tuple[UUID, ResumeData]:
        self._validate(filename, content_type, data)
        text = extract_text_from_pdf(data)  # may raise ResumeParseError
        parsed = await self._agent.run(text)
        resume = Resume(
            filename=filename,
            raw_text=text,
            parsed_data=parsed.model_dump(mode="json", by_alias=True),
        )
        saved = await self._repo.save(resume)
        self._log.info("resume_uploaded", resume_id=str(saved.id), filename=filename)
        return saved.id, parsed

    def _validate(self, filename: str, content_type: str | None, data: bytes) -> None:
        is_pdf = (content_type == "application/pdf") or filename.lower().endswith(".pdf")
        if not is_pdf:
            raise InvalidUploadError("Only PDF resumes are accepted.")
        max_bytes = self._settings.max_file_size_mb * 1024 * 1024
        if len(data) > max_bytes:
            raise InvalidUploadError(
                f"File exceeds the {self._settings.max_file_size_mb} MB limit."
            )
        if not data:
            raise InvalidUploadError("Uploaded file is empty.")
