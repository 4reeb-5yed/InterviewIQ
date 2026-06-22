"""Job ingestion business logic: fetch/accept text -> parse -> persist."""

from __future__ import annotations

from typing import Any
from uuid import UUID

import httpx
from bs4 import BeautifulSoup

from app.agents.job_agent import JobAgent
from app.config.settings import Settings
from app.core.ai.base import AIProvider
from app.db.models import Job
from app.features.scraper.repository import JobRepository
from app.schemas.domain import JobData

_STRIP_TAGS = ["script", "style", "noscript", "header", "footer", "nav"]


class JobScrapeError(Exception):
    """Raised when a job URL cannot be fetched or yields no readable text."""


class ScraperService:
    """Ingests a job by URL (scrape) or pasted text, then parses to JobData."""

    def __init__(
        self,
        ai_provider: AIProvider,
        repository: JobRepository,
        settings: Settings,
        logger: Any,
    ) -> None:
        self._agent = JobAgent(ai_provider, settings.job_agent_model)
        self._repo = repository
        self._settings = settings
        self._log = logger

    async def ingest(
        self,
        *,
        url: str | None,
        description: str | None,
        company_name: str | None,
        role_title: str | None,
    ) -> tuple[UUID, JobData]:
        if url:
            raw_text = await self._fetch(url)
            source_url: str | None = url
        else:
            raw_text = (description or "").strip()
            source_url = None

        parsed = await self._agent.run(self._with_hints(raw_text, company_name, role_title))
        job = Job(
            source_url=source_url,
            raw_text=raw_text,
            parsed_data=parsed.model_dump(mode="json", by_alias=True),
        )
        saved = await self._repo.save(job)
        self._log.info("job_ingested", job_id=str(saved.id), source_url=source_url)
        return saved.id, parsed

    @staticmethod
    def _with_hints(text: str, company_name: str | None, role_title: str | None) -> str:
        if not company_name and not role_title:
            return text
        hint = f"Company: {company_name or 'unknown'}\nRole: {role_title or 'unknown'}\n\n"
        return hint + text

    async def _fetch(self, url: str) -> str:
        try:
            async with httpx.AsyncClient(
                timeout=15.0,
                follow_redirects=True,
                headers={"User-Agent": "InterviewIQ/0.1"},
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise JobScrapeError(f"Could not fetch job URL: {exc}") from exc

        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(_STRIP_TAGS):
            tag.decompose()
        text = " ".join(soup.get_text(separator=" ").split())
        if not text:
            raise JobScrapeError("No readable text found at the job URL.")
        return text
