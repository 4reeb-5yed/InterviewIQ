"""Analysis controller: orchestrates submit/poll/fetch; maps not-found errors."""

from __future__ import annotations

from uuid import UUID, uuid4

from fastapi import BackgroundTasks
from fastapi.responses import JSONResponse

from app.core.exceptions import ResourceNotFoundError
from app.features.analysis.schemas import (
    AnalysisResultResponse,
    RunAnalysisRequest,
    RunAnalysisResponse,
    TaskStatusResponse,
)
from app.features.analysis.service import AnalysisService
from app.schemas.api import ApiResponse
from app.utils.response import error_response, ok


class AnalysisController:
    """Thin orchestration over :class:`AnalysisService`."""

    def __init__(self, service: AnalysisService) -> None:
        self._service = service

    async def run(
        self, body: RunAnalysisRequest, background_tasks: BackgroundTasks
    ) -> ApiResponse[RunAnalysisResponse] | JSONResponse:
        try:
            await self._service.ensure_inputs_exist(body.resume_id, body.job_id)
        except ResourceNotFoundError as exc:
            return error_response("NOT_FOUND", str(exc), status_code=404)

        task_id = uuid4()
        await self._service.create_task(task_id)
        background_tasks.add_task(
            self._service.run_and_store, task_id, body.resume_id, body.job_id
        )
        return ok(RunAnalysisResponse(task_id=task_id))

    async def get_task(self, task_id: UUID) -> ApiResponse[TaskStatusResponse] | JSONResponse:
        status = await self._service.get_task(task_id)
        if status is None:
            return error_response("NOT_FOUND", f"Unknown task id: {task_id}", status_code=404)
        return ok(
            TaskStatusResponse(
                task_id=status.task_id,
                status=status.status,
                result=status.result,
                error=status.error,
            )
        )

    async def get_analysis(
        self, analysis_id: UUID
    ) -> ApiResponse[AnalysisResultResponse] | JSONResponse:
        analysis = await self._service.get_analysis(analysis_id)
        if analysis is None:
            return error_response(
                "NOT_FOUND", f"Unknown analysis id: {analysis_id}", status_code=404
            )
        return ok(AnalysisResultResponse.from_model(analysis))
