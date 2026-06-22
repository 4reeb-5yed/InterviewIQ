"""Scraper controller: validates input and maps errors to envelopes."""

from __future__ import annotations

from fastapi.responses import JSONResponse

from app.features.scraper.schemas import JobIngestRequest, JobIngestResponse
from app.features.scraper.service import JobScrapeError, ScraperService
from app.schemas.api import ApiResponse
from app.utils.response import error_response, ok


class ScraperController:
    """Thin orchestration layer over :class:`ScraperService`."""

    def __init__(self, service: ScraperService) -> None:
        self._service = service

    async def ingest_job(
        self, body: JobIngestRequest
    ) -> ApiResponse[JobIngestResponse] | JSONResponse:
        has_url = bool(body.url and body.url.strip())
        has_description = bool(body.description and body.description.strip())
        if not has_url and not has_description:
            return error_response(
                "VALIDATION_ERROR", "Provide either 'url' or 'description'.", status_code=422
            )
        if has_url and has_description:
            return error_response(
                "VALIDATION_ERROR",
                "Provide only one of 'url' or 'description'.",
                status_code=422,
            )

        try:
            job_id, parsed = await self._service.ingest(
                url=body.url,
                description=body.description,
                company_name=body.company_name,
                role_title=body.role_title,
            )
        except JobScrapeError as exc:
            return error_response("JOB_SCRAPE_FAILED", str(exc), status_code=422)
        return ok(JobIngestResponse(job_id=job_id, job_data=parsed))
