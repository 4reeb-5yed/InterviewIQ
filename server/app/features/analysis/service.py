"""Analysis business logic: cache -> load -> run graph -> persist -> cache.

The Job Description is optional. The pipeline always produces a Career
Intelligence Report (resume-only); when a job is provided it additionally
produces the job-match analysis. This is one extended pipeline, not a separate
workflow.

Unlike the resume/scraper services (which use a request-scoped session), this
service is injected with a session *factory* because the pipeline runs in a
FastAPI BackgroundTask that outlives the request.
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.agents.graph import build_analysis_graph
from app.agents.state import AgentState
from app.config.settings import Settings
from app.core.ai.base import AIProvider
from app.core.cache.base import CacheStore
from app.core.exceptions import ResourceNotFoundError
from app.core.tasks.base import TaskStatus, TaskStore
from app.db.models import Analysis
from app.features.analysis.repository import AnalysisRepository
from app.features.resume.repository import ResumeRepository
from app.features.scraper.repository import JobRepository
from app.schemas.domain import CareerReport, InterviewQuestion, JobData, ResumeData, SkillGap


class AnalysisService:
    """Runs and stores the analysis pipeline; exposes task/analysis lookups."""

    def __init__(
        self,
        *,
        ai_provider: AIProvider,
        settings: Settings,
        cache: CacheStore,
        task_store: TaskStore,
        session_factory: async_sessionmaker[AsyncSession],
        logger: Any,
    ) -> None:
        self._graph = build_analysis_graph(ai_provider, settings)
        self._settings = settings
        self._cache = cache
        self._tasks = task_store
        self._session_factory = session_factory
        self._log = logger

    # --- request-scoped helpers ---------------------------------------------
    async def ensure_inputs_exist(self, resume_id: UUID, job_id: UUID | None) -> None:
        async with self._session_factory() as session:
            resume = await ResumeRepository(session).get_by_id(resume_id)
            job = await JobRepository(session).get_by_id(job_id) if job_id else None
        if resume is None:
            raise ResourceNotFoundError(f"Unknown resumeId: {resume_id}")
        if job_id is not None and job is None:
            raise ResourceNotFoundError(f"Unknown jobId: {job_id}")

    async def create_task(self, task_id: UUID) -> None:
        await self._tasks.set_pending(task_id)

    async def get_task(self, task_id: UUID) -> TaskStatus | None:
        return await self._tasks.get(task_id)

    async def get_analysis(self, analysis_id: UUID) -> Analysis | None:
        async with self._session_factory() as session:
            return await AnalysisRepository(session).get_by_id(analysis_id)

    # --- background execution -----------------------------------------------
    async def run_and_store(self, task_id: UUID, resume_id: UUID, job_id: UUID | None) -> None:
        await self._tasks.set_running(task_id)
        try:
            result = await self._execute(resume_id, job_id)
            await self._tasks.set_completed(task_id, result)
        except ResourceNotFoundError as exc:
            await self._tasks.set_failed(task_id, f"NOT_FOUND: {exc}")
        except Exception as exc:  # noqa: BLE001 - record any pipeline failure on the task
            self._log.error("analysis_failed", error=str(exc), exc_info=True)
            await self._tasks.set_failed(task_id, f"ANALYSIS_FAILED: {exc}")

    async def _execute(self, resume_id: UUID, job_id: UUID | None) -> dict:
        cache_key = f"analysis:{resume_id}:{job_id or 'none'}"
        cached = await self._cache.get(cache_key)
        if cached is not None:
            return cached

        async with self._session_factory() as session:
            resume = await ResumeRepository(session).get_by_id(resume_id)
            if resume is None:
                raise ResourceNotFoundError(f"Unknown resumeId: {resume_id}")
            job = await JobRepository(session).get_by_id(job_id) if job_id else None
            if job_id is not None and job is None:
                raise ResourceNotFoundError(f"Unknown jobId: {job_id}")

            analysis_repo = AnalysisRepository(session)

            existing = await analysis_repo.find_existing(resume_id, job_id)
            if existing is not None:
                result = self._result_dict(existing)
                await self._cache.set(cache_key, result, self._settings.cache_analysis_ttl_seconds)
                return result

            analysis = await analysis_repo.create_pending(resume_id, job_id)
            state: AgentState = {
                "resume_text": resume.raw_text,
                "job_description": job.raw_text if job else "",
                "resume_data": ResumeData.model_validate(resume.parsed_data),
                "job_data": JobData.model_validate(job.parsed_data) if job else None,
                "career_report": None,
                "skill_gaps": None,
                "readiness_score": None,
                "summary": None,
                "predicted_questions": None,
                "errors": [],
            }
            final: dict = await self._graph.ainvoke(state)

            career_report: CareerReport | None = final.get("career_report")
            has_job = job is not None
            skill_gaps: list[SkillGap] = final.get("skill_gaps") or []
            questions: list[InterviewQuestion] = final.get("predicted_questions") or []

            updated = await analysis_repo.update_result(
                analysis.id,
                career_report=(
                    career_report.model_dump(mode="json", by_alias=True) if career_report else None
                ),
                readiness_score=final.get("readiness_score") if has_job else None,
                skill_gaps=(
                    [g.model_dump(mode="json", by_alias=True) for g in skill_gaps]
                    if has_job
                    else None
                ),
                predicted_questions=(
                    [q.model_dump(mode="json", by_alias=True) for q in questions]
                    if has_job
                    else None
                ),
                summary=final.get("summary") if has_job else None,
                status="completed",
                error=None,
            )
            result = self._result_dict(updated or analysis)

        await self._cache.set(cache_key, result, self._settings.cache_analysis_ttl_seconds)
        self._log.info("analysis_completed", analysis_id=result["analysisId"], mode=result["mode"])
        return result

    @staticmethod
    def _result_dict(analysis: Analysis) -> dict:
        mode = "job_match" if analysis.job_id is not None else "resume_only"
        result: dict = {
            "analysisId": str(analysis.id),
            "mode": mode,
            "careerReport": analysis.career_report,
            "jobMatch": None,
        }
        if analysis.job_id is not None:
            result["jobMatch"] = {
                "readinessScore": analysis.readiness_score,
                "summary": analysis.summary,
                "skillGaps": analysis.skill_gaps or [],
                "predictedQuestions": analysis.predicted_questions or [],
            }
        return result
