"""Central exception handlers mapping domain errors to the ApiError envelope.

This is the single authority for error -> code mapping (API_CONTRACTS section 1).
Controllers raise domain exceptions and return success envelopes; mapping lives
here.
"""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.core.ai.json_retry import AIProviderError
from app.core.exceptions import InputValidationError, ResourceNotFoundError
from app.features.resume.service import InvalidUploadError
from app.features.scraper.service import JobScrapeError
from app.utils.logger import get_logger
from app.utils.pdf_parser import ResumeParseError
from app.utils.response import error_response

log = get_logger("errors")


def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception -> ApiError handlers on the app."""

    @app.exception_handler(RequestValidationError)
    async def _request_validation(request: Request, exc: RequestValidationError) -> JSONResponse:
        return error_response("VALIDATION_ERROR", "Request failed validation.", status_code=422)

    @app.exception_handler(InputValidationError)
    async def _input_validation(request: Request, exc: InputValidationError) -> JSONResponse:
        return error_response("VALIDATION_ERROR", str(exc), status_code=422)

    @app.exception_handler(InvalidUploadError)
    async def _invalid_upload(request: Request, exc: InvalidUploadError) -> JSONResponse:
        return error_response("VALIDATION_ERROR", str(exc), status_code=422)

    @app.exception_handler(ResumeParseError)
    async def _resume_parse(request: Request, exc: ResumeParseError) -> JSONResponse:
        return error_response("RESUME_PARSE_FAILED", str(exc), status_code=422)

    @app.exception_handler(JobScrapeError)
    async def _job_scrape(request: Request, exc: JobScrapeError) -> JSONResponse:
        return error_response("JOB_SCRAPE_FAILED", str(exc), status_code=422)

    @app.exception_handler(ResourceNotFoundError)
    async def _not_found(request: Request, exc: ResourceNotFoundError) -> JSONResponse:
        return error_response("NOT_FOUND", str(exc), status_code=404)

    @app.exception_handler(AIProviderError)
    async def _ai_provider(request: Request, exc: AIProviderError) -> JSONResponse:
        return error_response("AI_PROVIDER_ERROR", str(exc), status_code=502)

    @app.exception_handler(RateLimitExceeded)
    async def _rate_limited(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        return error_response("RATE_LIMITED", "Too many requests.", status_code=429)

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        log.error("unhandled_error", path=request.url.path, error=str(exc))
        return error_response(
            "INTERNAL_ERROR", "An unexpected error occurred.", status_code=500
        )
