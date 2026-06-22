"""Resume routes and dependency wiring."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import Settings, get_settings
from app.core.ai.base import AIProvider
from app.db.dependencies import get_db
from app.dependencies import get_ai_provider
from app.features.resume.controller import ResumeController
from app.features.resume.repository import ResumeRepository
from app.features.resume.schemas import ResumeUploadResponse
from app.features.resume.service import ResumeService
from app.schemas.api import ApiResponse
from app.utils.logger import get_logger

router = APIRouter(prefix="/api/v1", tags=["resume"])


def get_resume_service(
    db: AsyncSession = Depends(get_db),
    ai: AIProvider = Depends(get_ai_provider),
    settings: Settings = Depends(get_settings),
) -> ResumeService:
    return ResumeService(
        ai_provider=ai,
        repository=ResumeRepository(db),
        settings=settings,
        logger=get_logger("resume"),
    )


def get_resume_controller(
    service: ResumeService = Depends(get_resume_service),
) -> ResumeController:
    return ResumeController(service)


@router.post("/upload/resume", response_model=ApiResponse[ResumeUploadResponse])
async def upload_resume(
    file: UploadFile = File(...),
    controller: ResumeController = Depends(get_resume_controller),
):
    return await controller.upload_resume(file)
