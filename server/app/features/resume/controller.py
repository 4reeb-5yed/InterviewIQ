"""Resume controller: orchestrates the use case and maps errors to envelopes."""

from __future__ import annotations

from fastapi import UploadFile
from fastapi.responses import JSONResponse

from app.features.resume.schemas import ResumeUploadResponse
from app.features.resume.service import InvalidUploadError, ResumeService
from app.schemas.api import ApiResponse
from app.utils.pdf_parser import ResumeParseError
from app.utils.response import error_response, ok


class ResumeController:
    """Thin orchestration layer over :class:`ResumeService`."""

    def __init__(self, service: ResumeService) -> None:
        self._service = service

    async def upload_resume(
        self, file: UploadFile
    ) -> ApiResponse[ResumeUploadResponse] | JSONResponse:
        data = await file.read()
        try:
            resume_id, parsed = await self._service.upload(
                file.filename or "resume.pdf", file.content_type, data
            )
        except InvalidUploadError as exc:
            return error_response("VALIDATION_ERROR", str(exc), status_code=422)
        except ResumeParseError as exc:
            return error_response("RESUME_PARSE_FAILED", str(exc), status_code=422)
        return ok(ResumeUploadResponse(resume_id=resume_id, parsed_data=parsed))
