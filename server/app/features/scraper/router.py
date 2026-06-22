"""Scraper routes and dependency wiring."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import Settings, get_settings
from app.core.ai.base import AIProvider
from app.db.dependencies import get_db
from app.dependencies import get_ai_provider
from app.features.scraper.controller import ScraperController
from app.features.scraper.repository import JobRepository
from app.features.scraper.schemas import JobIngestRequest, JobIngestResponse
from app.features.scraper.service import ScraperService
from app.schemas.api import ApiResponse
from app.utils.logger import get_logger

router = APIRouter(prefix="/api/v1", tags=["scraper"])


def get_scraper_service(
    db: AsyncSession = Depends(get_db),
    ai: AIProvider = Depends(get_ai_provider),
    settings: Settings = Depends(get_settings),
) -> ScraperService:
    return ScraperService(
        ai_provider=ai,
        repository=JobRepository(db),
        settings=settings,
        logger=get_logger("scraper"),
    )


def get_scraper_controller(
    service: ScraperService = Depends(get_scraper_service),
) -> ScraperController:
    return ScraperController(service)


@router.post("/scrape/job", response_model=ApiResponse[JobIngestResponse])
async def scrape_job(
    body: JobIngestRequest,
    controller: ScraperController = Depends(get_scraper_controller),
):
    return await controller.ingest_job(body)
