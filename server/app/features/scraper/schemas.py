"""Request/response schemas for the scraper feature."""

from __future__ import annotations

from uuid import UUID

from app.schemas.domain import CamelModel, JobData


class JobIngestRequest(CamelModel):
    """Provide exactly one of ``url`` or ``description`` (camelCase on wire)."""

    url: str | None = None
    description: str | None = None
    company_name: str | None = None
    role_title: str | None = None


class JobIngestResponse(CamelModel):
    """Payload for a successful job ingestion."""

    job_id: UUID
    job_data: JobData
