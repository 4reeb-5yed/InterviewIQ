"""Scraper controller: validates input; errors map via the central handler."""

from __future__ import annotations

from app.core.exceptions import InputValidationError
from app.features.scraper.schemas import JobIngestRequest, JobIngestResponse
from app.features.scraper.service import ScraperService
from app.schemas.api import ApiResponse
from app.utils.response import ok


class ScraperController:
    """Thin orchestration layer over :class:`ScraperService`."""

    def __init__(self, service: ScraperService) -> None:
        self._service = service

    async def ingest_job(self, body: JobIngestRequest) -> ApiResponse[JobIngestResponse]:
        has_url = bool(body.url and body.url.strip())
        has_description = bool(body.description and body.description.strip())
        if not has_url and not has_description:
            raise InputValidationError("Provide either 'url' or 'description'.")
        if has_url and has_description:
            raise InputValidationError("Provide only one of 'url' or 'description'.")

        job_id, parsed = await self._service.ingest(
            url=body.url,
            description=body.description,
            company_name=body.company_name,
            role_title=body.role_title,
        )
        return ok(JobIngestResponse(job_id=job_id, job_data=parsed))
