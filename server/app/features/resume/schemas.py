"""Request/response schemas for the resume feature."""

from __future__ import annotations

from uuid import UUID

from app.schemas.domain import CamelModel, ResumeData


class ResumeUploadResponse(CamelModel):
    """Payload for a successful resume upload (camelCase on the wire)."""

    resume_id: UUID
    parsed_data: ResumeData
