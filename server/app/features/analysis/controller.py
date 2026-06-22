"""Analysis controller: submit/poll/fetch. Errors map via the central handler."""

from __future__ import annotations

from uuid import UUID, uuid4

from fastapi import BackgroundTasks

from app.core.exceptions import ResourceNotFoundError
from app.features.analysis.schemas import (
    AnalysisResultResponse,
    RunAnalysisRequest,
    RunAnalysisResponse,
    TaskStatusResponse,
)
from app.features.analysis.service import AnalysisService
from app.schemas.api import ApiResponse
from app.utils.response import ok


class AnalysisController:
    """Thin orchestration over :class:`AnalysisService`."""

    def __init__(self, service: AnalysisService) -> None:
        self._service = service

    async def run(
        self, body: RunAnalysisRequest, background_tasks: BackgroundTasks
    ) -> ApiResponse[RunAnalysisResponse]:
        # job_id is optional (resume-only mode). Raises ResourceNotFoundError
        # -> NOT_FOUND via the central handler when an id is unknown.
        await self._service.ensure_inputs_exist(body.resume_id, body.job_id)
        task_id = uuid4()
        await self._service.create_task(task_id)
        background_tasks.add_task(
            self._service.run_and_store, task_id, body.resume_id, body.job_id
        )
        return ok(RunAnalysisResponse(task_id=task_id))

    async def get_task(self, task_id: UUID) -> ApiResponse[TaskStatusResponse]:
        status = await self._service.get_task(task_id)
        if status is None:
            raise ResourceNotFoundError(f"Unknown task id: {task_id}")
        return ok(
            TaskStatusResponse(
                task_id=status.task_id,
                status=status.status,
                result=status.result,
                error=status.error,
            )
        )

    async def get_analysis(self, analysis_id: UUID) -> ApiResponse[AnalysisResultResponse]:
        analysis = await self._service.get_analysis(analysis_id)
        if analysis is None:
            raise ResourceNotFoundError(f"Unknown analysis id: {analysis_id}")
        return ok(AnalysisResultResponse.from_model(analysis))
