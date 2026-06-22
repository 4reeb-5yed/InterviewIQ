"""Resume controller: orchestrates the use case. Errors map via the central handler."""

from __future__ import annotations

from fastapi import UploadFile

from app.features.resume.schemas import ResumeUploadResponse
from app.features.resume.service import ResumeService
from app.schemas.api import ApiResponse
from app.utils.response import ok


class ResumeController:
    """Thin orchestration layer over :class:`ResumeService`."""

    def __init__(self, service: ResumeService) -> None:
        self._service = service

    async def upload_resume(self, file: UploadFile) -> ApiResponse[ResumeUploadResponse]:
        data = await file.read()
        resume_id, parsed = await self._service.upload(
            file.filename or "resume.pdf", file.content_type, data
        )
        return ok(ResumeUploadResponse(resume_id=resume_id, parsed_data=parsed))
