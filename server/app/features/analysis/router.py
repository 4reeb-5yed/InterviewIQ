"""Analysis routes and dependency wiring."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends

from app.config.settings import Settings, get_settings
from app.core.ai.base import AIProvider
from app.core.cache.base import CacheStore
from app.core.tasks.base import TaskStore
from app.db.base import SessionLocal
from app.dependencies import get_ai_provider, get_cache, get_task_store
from app.features.analysis.controller import AnalysisController
from app.features.analysis.schemas import (
    AnalysisResultResponse,
    RunAnalysisRequest,
    RunAnalysisResponse,
    TaskStatusResponse,
)
from app.features.analysis.service import AnalysisService
from app.schemas.api import ApiResponse
from app.utils.logger import get_logger

router = APIRouter(prefix="/api/v1", tags=["analysis"])


def get_analysis_service(
    ai: AIProvider = Depends(get_ai_provider),
    settings: Settings = Depends(get_settings),
    cache: CacheStore = Depends(get_cache),
    task_store: TaskStore = Depends(get_task_store),
) -> AnalysisService:
    return AnalysisService(
        ai_provider=ai,
        settings=settings,
        cache=cache,
        task_store=task_store,
        session_factory=SessionLocal,
        logger=get_logger("analysis"),
    )


def get_analysis_controller(
    service: AnalysisService = Depends(get_analysis_service),
) -> AnalysisController:
    return AnalysisController(service)


@router.post(
    "/analysis/run", response_model=ApiResponse[RunAnalysisResponse], status_code=202
)
async def run_analysis(
    body: RunAnalysisRequest,
    background_tasks: BackgroundTasks,
    controller: AnalysisController = Depends(get_analysis_controller),
):
    return await controller.run(body, background_tasks)


@router.get("/tasks/{task_id}", response_model=ApiResponse[TaskStatusResponse])
async def get_task(
    task_id: UUID,
    controller: AnalysisController = Depends(get_analysis_controller),
):
    return await controller.get_task(task_id)


@router.get("/analysis/{analysis_id}", response_model=ApiResponse[AnalysisResultResponse])
async def get_analysis(
    analysis_id: UUID,
    controller: AnalysisController = Depends(get_analysis_controller),
):
    return await controller.get_analysis(analysis_id)
