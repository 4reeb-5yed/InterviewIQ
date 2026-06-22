# InterviewIQ — Phase 1 Implementation Plan

> A sequenced, acceptance-criteria-driven task list for building the MVP. Designed for **handoff to an IDE coding agent** (Roo / Kiro IDE / VS Code agent). Implement **one task block at a time**, in order — each block is self-contained to keep context windows (and token cost) small.

**Phase 1 goal:** deployed app where a user uploads a resume + supplies a job → gets skill gaps, a readiness score, and ranked predicted questions.

**Conventions for every task:** typed contracts (Pydantic / TS), no hardcoded config, no business logic in routers/components, AI only via `AIProvider`, DB only via repositories. Mark a task done only when its acceptance criteria pass.

---

## Block 0 — Backend bootstrap

**Tasks**
- [ ] 0.1 Init `server/` with `pyproject.toml` (FastAPI, uvicorn, pydantic v2, pydantic-settings, sqlalchemy[asyncio], asyncpg, alembic, httpx, beautifulsoup4, pdfplumber, python-multipart, slowapi, structlog, langgraph, anthropic; dev: pytest, pytest-asyncio, ruff, black, mypy).
- [ ] 0.2 `app/config/settings.py` — Pydantic `Settings` reading `.env`: server, `ALLOWED_ORIGINS`, `AI_PROVIDER`, `AI_API_KEY`, per-agent model vars, `DATABASE_URL`, `MAX_FILE_SIZE_MB`, rate-limit vars, optional `REDIS_URL`, feature flags.
- [ ] 0.3 `app/utils/logger.py` (structlog) and `app/schemas/api.py` (`ApiResponse[T]`, `ApiError`) + `app/utils/response.py` builders.
- [ ] 0.4 `app/main.py` app factory; register CORS, rate-limit, global error handler; include `/health`.
- [ ] 0.5 `.env.example` with every variable documented.

**Acceptance:** `uvicorn app.main:app` boots; `GET /api/v1/health` returns the success envelope.

---

## Block 1 — Database & migrations

**Tasks**
- [ ] 1.1 `app/db/base.py` — async engine + `async_sessionmaker` from `DATABASE_URL`.
- [ ] 1.2 `app/db/models.py` — `Resume`, `Job`, `Analysis` ORM (per DATABASE.md), UUID PKs, timestamps, JSONB columns, index on `analyses(resume_id, job_id)`.
- [ ] 1.3 `app/db/dependencies.py` — `get_db()` FastAPI dependency yielding a session.
- [ ] 1.4 Alembic init + `0001_initial_schema` migration (async env).

**Acceptance:** `alembic upgrade head` creates the three tables on a local Postgres; app connects on startup.

---

## Block 2 — Core abstractions (AI, cache, tasks, flags)

**Tasks**
- [ ] 2.1 `core/ai/base.py` (`AIProvider`, `AIRequest`, `AIMessage`) + `core/ai/json_retry.py` (parse JSON, retry ≤3 with a "return valid JSON only" reminder, raise `AI_PROVIDER_ERROR` on final failure).
- [ ] 2.2 `core/ai/providers/anthropic.py` (real) + `openai.py`/`gemini.py` stubs raising `NotImplementedError`.
- [ ] 2.3 `core/ai/factory.py` — `AIProviderFactory.create(provider, api_key)`.
- [ ] 2.4 `core/cache/` — `CacheStore` ABC, `InMemoryCacheStore` (TTL via timestamps), `RedisCacheStore` stub, `build_cache(settings)` (Redis only if `REDIS_URL`).
- [ ] 2.5 `core/tasks/` — `TaskStore` ABC + `TaskStatus`, `InMemoryTaskStore`, `RedisTaskStore` stub, `build_task_store(settings)`.
- [ ] 2.6 `core/flags/feature_flags.py` — typed wrapper over Settings flags.
- [ ] 2.7 `core/rag/base.py` + `no_knowledge.py` (returns `[]`); `core/memory/base.py` stub.

**Acceptance:** unit test — `InMemoryCacheStore.set/get` respects TTL; `json_retry` returns parsed dict on valid JSON and raises after 3 bad responses (mock provider).

---

## Block 3 — Domain schemas & prompts

**Tasks**
- [ ] 3.1 `app/schemas/domain.py` — `ResumeData`, `Skills`, `ExperienceItem`, `EducationItem`, `ProjectItem`, `JobData`, `SkillGap`, `InterviewQuestion` (Pydantic v2, `Literal` enums, camelCase aliases).
- [ ] 3.2 `prompts/resume.prompt.py`, `job.prompt.py`, `skill_gap.prompt.py`, `question_gen.prompt.py` — each: persona, JSON-only instruction, inline schema, recommended temperature.

**Acceptance:** importing schemas validates a sample payload; each prompt module exposes a system prompt string + temperature constant.

---

## Block 4 — Resume feature (upload + parse)

**Tasks**
- [ ] 4.1 `utils/pdf_parser.py` — pdfplumber wrapper: bytes → text; raises on unreadable PDF.
- [ ] 4.2 `features/resume/repository.py` — `save`, `get_by_id`.
- [ ] 4.3 `features/resume/service.py` — parse PDF → call `ResumeAgent` (via `AIProvider`) → `ResumeData` → persist; size/type guard from settings.
- [ ] 4.4 `agents/resume_agent.py` — text → `ResumeData` using `resume.prompt` + `json_retry`.
- [ ] 4.5 `features/resume/controller.py` + `router.py` + `schemas.py` — `POST /upload/resume`.

**Acceptance:** uploading a sample PDF returns `200` with `resumeId` + populated `parsedData`; oversize/non-PDF → `422 VALIDATION_ERROR`/`RESUME_PARSE_FAILED`.

---

## Block 5 — Scraper feature (job ingest)

**Tasks**
- [ ] 5.1 `features/scraper/service.py` — if `url`: fetch via httpx + extract main text via BeautifulSoup; else use pasted `description`. Then `JobAgent` → `JobData` → persist.
- [ ] 5.2 `agents/job_agent.py` — text → `JobData`.
- [ ] 5.3 `features/scraper/repository.py`, `controller.py`, `router.py`, `schemas.py` — `POST /scrape/job` (url OR description, validated).

**Acceptance:** posting a job URL or pasted text returns `200` with `jobId` + structured `jobData`; unreachable URL → `422 JOB_SCRAPE_FAILED`.

---

## Block 6 — Analysis pipeline (LangGraph) + question prediction

**Tasks**
- [ ] 6.1 `agents/state.py` — `AgentState` TypedDict.
- [ ] 6.2 `agents/skill_gap_agent.py` — resume_data + job_data → `list[SkillGap]` + `readiness_score` + summary.
- [ ] 6.3 `agents/question_agent.py` — gaps + job → `list[InterviewQuestion]` with `likelihood_score`.
- [ ] 6.4 `agents/graph.py` — `build_analysis_graph(ai_provider)` wiring Resume→Job→SkillGap→Question (Resume/Job already produced for stored entities; graph entry can start at skill_gap when both exist — keep nodes composable).
- [ ] 6.5 `features/analysis/repository.py` — create/update analysis, get by id, find by `(resume_id, job_id)`.
- [ ] 6.6 `features/analysis/service.py` — cache lookup → load resume/job → run graph → persist → cache set; `run_and_store(task_id, body)` updates `TaskStore`.
- [ ] 6.7 `features/analysis/controller.py` + `router.py` — `POST /analysis/run` (`202` + BackgroundTask), `GET /tasks/{taskId}`, `GET /analysis/{analysisId}`.

**Acceptance:** submit `{resumeId, jobId}` → `202 {taskId}`; polling reaches `completed` with `skillGaps`, `readinessScore`, `predictedQuestions`; a second identical submit returns the cached result quickly.

---

## Block 7 — Backend cross-cutting & tests

**Tasks**
- [ ] 7.1 `middleware/error_handler.py` maps known exceptions → error codes in API_CONTRACTS §1.
- [ ] 7.2 `middleware/rate_limit.py` — slowapi limit on AI routes.
- [ ] 7.3 Unit tests: pdf parse, json_retry, skill-gap output shape (mock `AIProvider`).
- [ ] 7.4 One integration happy-path test (upload → scrape → analyze) with a fake provider.

**Acceptance:** `pytest` green; `ruff`/`mypy` clean.

---

## Block 8 — Frontend bootstrap

**Tasks**
- [ ] 8.1 Init `client/` (Vite + React + TS), Tailwind + shadcn/ui, TanStack Query, React Router, axios.
- [ ] 8.2 `config/env.config.ts` (typed `VITE_API_BASE_URL`), `services/api.client.ts` (axios + interceptors unwrapping the envelope / surfacing `ApiError`).
- [ ] 8.3 `types/api.types.ts`, `types/analysis.types.ts` mirroring backend.
- [ ] 8.4 `components/layout/AppShell` + router with `/` (upload) and `/analysis/:id`.

**Acceptance:** dev server runs; a health ping through `api.client` succeeds against the local backend.

---

## Block 9 — Upload screen

**Tasks**
- [ ] 9.1 `services/upload.service.ts` + `scraper.service.ts`.
- [ ] 9.2 `features/upload` — `DropZone` (PDF), `JobInputCard` (URL or paste toggle), `Stepper`; `useResumeUpload`, `useJobIngest` (TanStack mutations).
- [ ] 9.3 On both complete, enable "Run Analysis" → submit and navigate to analysis view with `taskId`.

**Acceptance:** user uploads a PDF and a job, clicks Run, and is taken to the analysis screen showing a loading state.

---

## Block 10 — Analysis screen

**Tasks**
- [ ] 10.1 `services/analysis.service.ts` (submit + getTask + getAnalysis).
- [ ] 10.2 `useAnalysis` — submit, then poll `GET /tasks/{id}` via `refetchInterval` until terminal.
- [ ] 10.3 Components: `ReadinessGauge`, `SkillGapCard` (status/importance colors), `QuestionTable` (sorted by likelihood), `SkillBadge`, `StatusPill`.
- [ ] 10.4 Error + empty states; subtle fade-in (Framer Motion optional).

**Acceptance:** after polling completes, the screen renders readiness score, skill-gap cards, and a ranked question table from real API data.

---

## Block 11 — Containerization & one-command setup

**Tasks**
- [ ] 11.1 `docker/server.Dockerfile` (python:3.11-slim, uvicorn).
- [ ] 11.2 `docker/docker-compose.yml` — `postgres` + `server` (+ optional `redis` profile, **off by default**). Frontend runs via Vite locally (not required in compose).
- [ ] 11.3 `scripts/setup.sh` — copy `.env.example`→`.env` (both apps), install deps, run migrations, print next steps.

**Acceptance:** fresh clone → `./scripts/setup.sh` then `docker compose -f docker/docker-compose.yml up` brings up Postgres + backend with **no Redis**; frontend `npm run dev` talks to it end-to-end.

---

## Block 12 — Deployment docs & wiring

**Tasks**
- [ ] 12.1 `DEPLOYMENT.md` — Neon (create DB, copy `DATABASE_URL` with SSL), Render (web service, build/start commands, env vars, run `alembic upgrade head`), Vercel (root `client/`, `VITE_API_BASE_URL`, build settings).
- [ ] 12.2 Verify CORS: backend `ALLOWED_ORIGINS` includes the Vercel domain.
- [ ] 12.3 `.github/workflows/ci.yml` stub (lint + type-check + test) — not blocking until Phase 4.

**Acceptance:** deployed Vercel frontend successfully runs a full analysis against the Render backend + Neon DB, configured only through env vars (no code changes between local and prod).

---

## Definition of Done (Phase 1)

- [ ] End-to-end demo works locally (no Redis) and on the deployed stack.
- [ ] All `[MVP]` files from FOLDER_STRUCTURE.md exist; `[stub]` files are safe no-ops; no `[defer]` files created.
- [ ] `pytest`, `ruff`, `mypy` pass on the backend; frontend type-checks.
- [ ] README + DEPLOYMENT accurately describe setup and deploy.
- [ ] No hardcoded secrets/models/URLs; everything via env.

---

## Suggested handoff prompt for the IDE coding agent

> Implement **Block N** from `docs/PHASE_1_PLAN.md` for InterviewIQ. Follow `docs/ARCHITECTURE.md` (layering, AIProvider abstraction, in-memory cache/task defaults — no Redis), `docs/API_CONTRACTS.md` (exact request/response shapes), and `docs/DATABASE.md`. Create only `[MVP]` files for this block, keep modules small and typed, and stop when the block's acceptance criteria pass. Do not implement later blocks or `[defer]` features.
