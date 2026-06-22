# InterviewIQ — Phase 1 Task Breakdown

> The smallest reasonable, independently executable tasks for Phase 1. Each task is numbered, lists its dependencies, and has explicit acceptance criteria. A coding agent should pick one task, satisfy its acceptance criteria, then move on.

**Phase 1 scope (only):** Resume Upload · Job Description Input/Scraping · Skill Gap Analysis · Question Prediction.
**Scaffolded but NOT implemented:** Redis, Interview, Roadmap, Memory, RAG, Company Intelligence, Event Bus, Analytics, advanced observability.

**Legend:** `Deps:` task numbers that must be done first. `Critical` = on the critical path to a working demo.

---

## Group A — Backend foundation

### T01 — Initialize backend project `Critical`
- **Deps:** none
- **Do:** create `server/` with `pyproject.toml`; pin Python 3.11; add runtime deps (fastapi, uvicorn[standard], pydantic, pydantic-settings, sqlalchemy[asyncio], asyncpg, alembic, httpx, beautifulsoup4, pdfplumber, python-multipart, slowapi, structlog, langgraph, anthropic) and dev deps (pytest, pytest-asyncio, ruff, black, mypy); add tool config for ruff/black/mypy.
- **Acceptance:** `pip install -e .` (or `uv sync`) succeeds; `python -c "import fastapi, langgraph, anthropic"` runs clean.

### T02 — Settings & env contract `Critical`
- **Deps:** T01
- **Do:** `app/config/settings.py` Pydantic `Settings` reading `.env`: `PORT`, `ENVIRONMENT`, `ALLOWED_ORIGINS`, `AI_PROVIDER`, `AI_API_KEY`, per-agent model vars (`RESUME_AGENT_MODEL`, `JOB_AGENT_MODEL`, `SKILL_GAP_AGENT_MODEL`, `QUESTION_AGENT_MODEL`), `DATABASE_URL`, `MAX_FILE_SIZE_MB`, `RATE_LIMIT_WINDOW_SECONDS`, `RATE_LIMIT_MAX_REQUESTS`, optional `REDIS_URL`, flags (`ENABLE_RAG`, `ENABLE_MEMORY`, `ENABLE_COMPANY_INTELLIGENCE`, all default false). Create `.env.example` documenting all of them.
- **Acceptance:** settings load from a sample `.env`; missing required var raises a clear error; `REDIS_URL` defaults to `None`.

### T03 — Logging setup
- **Deps:** T01
- **Do:** `app/utils/logger.py` configure structlog (JSON in prod, console in dev); expose `get_logger()`.
- **Acceptance:** `get_logger().info("x")` emits structured output; no `print()` anywhere.

### T04 — API response envelope
- **Deps:** T01
- **Do:** `app/schemas/api.py` (`ApiResponse[T]`, `ApiError`, `ErrorBody`) + `app/utils/response.py` (`ok(data)`, `err(code, message, details)`).
- **Acceptance:** unit test serializes both envelopes to the exact JSON in API_CONTRACTS §1.

### T05 — App factory + health route `Critical`
- **Deps:** T02, T03, T04
- **Do:** `app/main.py` FastAPI factory; mount `/api/v1`; add `GET /health`; placeholders to register middleware later.
- **Acceptance:** `uvicorn app.main:app` boots; `GET /api/v1/health` returns success envelope.

---

## Group B — Database

### T06 — Async engine & session `Critical`
- **Deps:** T02
- **Do:** `app/db/base.py` async engine + `async_sessionmaker` from `DATABASE_URL`; declarative `Base`.
- **Acceptance:** engine constructs; a trivial `SELECT 1` works against local Postgres.

### T07 — ORM models `Critical`
- **Deps:** T06
- **Do:** `app/db/models.py` — `Resume`, `Job`, `Analysis` per DATABASE.md (UUID PK, timestamps, JSONB columns, `status`/`error` on Analysis, index on `analyses(resume_id, job_id)`).
- **Acceptance:** models import; metadata reflects 3 tables + index.

### T08 — DB dependency
- **Deps:** T06
- **Do:** `app/db/dependencies.py` `get_db()` async generator yielding a session with proper close.
- **Acceptance:** a temp route using `Depends(get_db)` executes a query and releases the session.

### T09 — Alembic initial migration `Critical`
- **Deps:** T07
- **Do:** init Alembic for async; author `0001_initial_schema` creating the three tables + index; `alembic.ini` reads `DATABASE_URL` from env.
- **Acceptance:** `alembic upgrade head` creates tables; `downgrade base` drops them cleanly.

---

## Group C — Core abstractions

### T10 — AI provider interface `Critical`
- **Deps:** T01
- **Do:** `core/ai/base.py` — `AIProvider` ABC, `AIRequest`, `AIMessage` dataclasses.
- **Acceptance:** a dummy in-test subclass implements `generate` and type-checks.

### T11 — JSON retry wrapper `Critical`
- **Deps:** T10
- **Do:** `core/ai/json_retry.py` — call provider, parse JSON; on parse failure retry up to 3 with a "valid JSON only" reminder; raise `AIProviderError` after final fail.
- **Acceptance:** unit test (mock provider) returns dict on valid JSON; raises after 3 invalid responses.

### T12 — Anthropic provider `Critical`
- **Deps:** T10
- **Do:** `core/ai/providers/anthropic.py` implementing `generate` (model from arg/config, capture tokens + latency). Add `openai.py`/`gemini.py` stubs raising `NotImplementedError`.
- **Acceptance:** with a valid key, a short prompt returns an `AIMessage`; stubs raise clearly.

### T13 — AI factory `Critical`
- **Deps:** T12
- **Do:** `core/ai/factory.py` `AIProviderFactory.create(provider, api_key)` (match statement; unknown → `ValueError`).
- **Acceptance:** `create("anthropic", key)` returns `AnthropicProvider`; `create("openai", key)` returns the stub; unknown raises.

### T14 — Cache abstraction `Critical`
- **Deps:** T02
- **Do:** `core/cache/base.py` (`CacheStore` ABC), `memory.py` (`InMemoryCacheStore` with TTL), `redis.py` (`RedisCacheStore` **stub**), `factory.py` `build_cache(settings)` → Redis only if `REDIS_URL` else in-memory.
- **Acceptance:** unit test — set/get honors TTL; expired key returns `None`; factory returns in-memory when `REDIS_URL` unset.

### T15 — Task store abstraction `Critical`
- **Deps:** T02
- **Do:** `core/tasks/base.py` (`TaskStore` ABC + `TaskStatus` model: status, result, error), `memory.py` (`InMemoryTaskStore`), `redis.py` stub, `factory.py` `build_task_store(settings)`.
- **Acceptance:** set_pending→running→completed transitions readable via `get`; factory returns in-memory when no `REDIS_URL`.

### T16 — Feature flags
- **Deps:** T02
- **Do:** `core/flags/feature_flags.py` typed wrapper exposing `rag_enabled`, `memory_enabled`, `company_intelligence_enabled`.
- **Acceptance:** flags read from Settings; trivially mockable in a test.

### T17 — Scaffold RAG & memory (no-op)
- **Deps:** T01
- **Do:** `core/rag/base.py` (`KnowledgeProvider` ABC), `core/rag/no_knowledge.py` (`retrieve()` returns `[]`), `core/memory/base.py` (`MemoryStore` ABC, `# TODO Phase 2`). Do NOT wire into pipeline.
- **Acceptance:** `NoKnowledgeProvider().retrieve("q")` returns `[]`; nothing imports these in MVP execution path.

---

## Group D — Domain schemas & prompts

### T18 — Domain schemas `Critical`
- **Deps:** T01
- **Do:** `app/schemas/domain.py` — `Skills`, `ExperienceItem`, `EducationItem`, `ProjectItem`, `ResumeData`, `JobData`, `SkillGap`, `InterviewQuestion` (Pydantic v2, `Literal` enums, camelCase aliases via `model_config`).
- **Acceptance:** sample payloads validate; invalid enum values rejected.

### T19 — Prompt modules `Critical`
- **Deps:** T18
- **Do:** `prompts/resume.prompt.py`, `job.prompt.py`, `skill_gap.prompt.py`, `question_gen.prompt.py` — each exports a system-prompt string (persona + JSON-only + inline schema) and a temperature constant (structured ~0.3).
- **Acceptance:** each module imports and exposes `SYSTEM_PROMPT` + `TEMPERATURE`; schema text matches domain models.

---

## Group E — Resume feature

### T20 — PDF parser util `Critical`
- **Deps:** T01
- **Do:** `utils/pdf_parser.py` — bytes → text via pdfplumber; raise `ResumeParseError` on unreadable/empty.
- **Acceptance:** sample PDF → non-empty text; corrupt bytes raise.

### T21 — Resume agent `Critical`
- **Deps:** T11, T13, T19
- **Do:** `agents/resume_agent.py` — `run(resume_text) -> ResumeData` using resume prompt + json_retry; model from config.
- **Acceptance:** with mock provider returning valid JSON, produces a `ResumeData`.

### T22 — Resume repository `Critical`
- **Deps:** T07, T08
- **Do:** `features/resume/repository.py` — `save(resume)`, `get_by_id(id)`.
- **Acceptance:** save then get returns persisted row with parsed_data JSONB.

### T23 — Resume service `Critical`
- **Deps:** T20, T21, T22, T02
- **Do:** `features/resume/service.py` — validate size/type from settings → parse → ResumeAgent → persist; DI for provider/repo/logger.
- **Acceptance:** valid PDF returns `(resumeId, ResumeData)`; oversize/non-PDF raises mapped errors.

### T24 — Resume router/controller/schemas `Critical`
- **Deps:** T23, T04, T05
- **Do:** `features/resume/{router,controller,schemas}.py` — `POST /upload/resume` (multipart), wired via `Depends`.
- **Acceptance:** endpoint returns `200` envelope with `resumeId`+`parsedData`; errors map to `RESUME_PARSE_FAILED`/`VALIDATION_ERROR`.

---

## Group F — Scraper feature

### T25 — Job agent `Critical`
- **Deps:** T11, T13, T19
- **Do:** `agents/job_agent.py` — `run(job_text) -> JobData`.
- **Acceptance:** mock provider valid JSON → `JobData`.

### T26 — Job repository `Critical`
- **Deps:** T07, T08
- **Do:** `features/scraper/repository.py` — `save`, `get_by_id`.
- **Acceptance:** save then get returns row.

### T27 — Scraper service `Critical`
- **Deps:** T25, T26
- **Do:** `features/scraper/service.py` — if `url`: httpx fetch + BeautifulSoup main-text extract; else use pasted `description`; then JobAgent → persist. Raise `JobScrapeError` on fetch/parse failure.
- **Acceptance:** URL or pasted text → `(jobId, JobData)`; unreachable URL raises.

### T28 — Scraper router/controller/schemas `Critical`
- **Deps:** T27, T04
- **Do:** `features/scraper/{router,controller,schemas}.py` — `POST /scrape/job`, validate exactly one of url/description provided.
- **Acceptance:** returns `200` with `jobId`+`jobData`; bad input → `422`; fetch fail → `JOB_SCRAPE_FAILED`.

---

## Group G — Analysis pipeline

### T29 — Agent state `Critical`
- **Deps:** T18
- **Do:** `agents/state.py` — `AgentState` TypedDict per ARCHITECTURE §6.
- **Acceptance:** importable; fields typed and optional where appropriate.

### T30 — Skill gap agent `Critical`
- **Deps:** T11, T13, T19, T29
- **Do:** `agents/skill_gap_agent.py` — `run(state)` fills `skill_gaps` + `readiness_score` + summary from resume_data vs job_data.
- **Acceptance:** mock provider → populated gaps (valid enums), score 0–100.

### T31 — Question agent `Critical`
- **Deps:** T11, T13, T19, T29
- **Do:** `agents/question_agent.py` — `run(state)` fills `predicted_questions` (typed, `likelihood_score`) from gaps + job.
- **Acceptance:** mock provider → list of `InterviewQuestion` with ids and scores.

### T32 — Analysis graph `Critical`
- **Deps:** T30, T31
- **Do:** `agents/graph.py` — `build_analysis_graph(ai_provider)` wiring resume→job→skill_gap→question (composable; entry usable from skill_gap when resume/job already parsed). Interview/roadmap/company agents are stubs and NOT added as nodes.
- **Acceptance:** compiled graph runs end-to-end on seeded state (mock provider) producing gaps + questions.

### T33 — Analysis repository `Critical`
- **Deps:** T07, T08
- **Do:** `features/analysis/repository.py` — `create_pending`, `update_result`, `get_by_id`, `find_by_pair(resume_id, job_id)`.
- **Acceptance:** lifecycle create→update→get works; pair lookup returns latest.

### T34 — Analysis service `Critical`
- **Deps:** T32, T33, T14, T15
- **Do:** `features/analysis/service.py` — cache lookup → load resume/job → run graph → persist → cache set; `run_and_store(task_id, body)` updates TaskStore (running/completed/failed).
- **Acceptance:** produces and persists analysis; second identical call hits cache; failures recorded on task + analysis.row.

### T35 — Analysis router/controller `Critical`
- **Deps:** T34, T05
- **Do:** `features/analysis/{router,controller,schemas}.py` — `POST /analysis/run` (`202`+BackgroundTask), `GET /tasks/{taskId}`, `GET /analysis/{analysisId}`.
- **Acceptance:** submit → `202 {taskId}`; poll reaches `completed` with full result; unknown ids → `404`.

---

## Group H — Cross-cutting & tests

### T36 — Error handler middleware `Critical`
- **Deps:** T04, T05
- **Do:** `middleware/error_handler.py` map domain exceptions → API_CONTRACTS error codes; catch-all → `INTERNAL_ERROR`.
- **Acceptance:** raising each known exception yields its documented code + HTTP status.

### T37 — CORS + rate limit middleware
- **Deps:** T02, T05
- **Do:** `middleware/cors.py` (origins from env), `middleware/rate_limit.py` (slowapi on AI routes).
- **Acceptance:** disallowed origin blocked; exceeding limit → `429 RATE_LIMITED`.

### T38 — Unit tests
- **Deps:** T11, T20, T30
- **Do:** tests for json_retry, pdf parser, skill-gap output shape (mock provider).
- **Acceptance:** `pytest` green; `ruff`/`mypy` clean.

### T39 — Integration happy path
- **Deps:** T24, T28, T35
- **Do:** one test: upload (fake PDF) → scrape (pasted text) → analyze, using a fake AIProvider.
- **Acceptance:** completes with gaps + questions; status `completed`.

---

## Group I — Frontend

### T40 — Frontend bootstrap `Critical`
- **Deps:** none (can parallel backend)
- **Do:** init `client/` (Vite+React+TS), Tailwind+shadcn/ui, TanStack Query, React Router, axios; `tsconfig` strict.
- **Acceptance:** `npm run dev` serves a blank app; type-check passes.

### T41 — API client & types `Critical`
- **Deps:** T40
- **Do:** `config/env.config.ts` (typed `VITE_API_BASE_URL`); `services/api.client.ts` (axios + interceptors unwrapping envelope / throwing `ApiError`); `types/api.types.ts`, `types/analysis.types.ts` mirroring backend.
- **Acceptance:** a health call via api.client returns ok against local backend.

### T42 — App shell & routing
- **Deps:** T41
- **Do:** `components/layout/AppShell` + TopBar; routes `/` (upload) and `/analysis/:id`.
- **Acceptance:** navigation between the two routes works.

### T43 — Upload services & hooks `Critical`
- **Deps:** T41
- **Do:** `services/upload.service.ts`, `services/scraper.service.ts`; hooks `useResumeUpload`, `useJobIngest` (TanStack mutations).
- **Acceptance:** uploading a PDF returns resumeId; submitting a job returns jobId.

### T44 — Upload screen UI `Critical`
- **Deps:** T43, T42
- **Do:** `features/upload` — `DropZone`, `JobInputCard` (URL/paste toggle), `Stepper`; enable "Run Analysis" when both done → submit → navigate to `/analysis/:id` with taskId.
- **Acceptance:** full upload flow ends on analysis screen in loading state.

### T45 — Analysis service & polling hook `Critical`
- **Deps:** T41
- **Do:** `services/analysis.service.ts` (submit/getTask/getAnalysis); `useAnalysis` submits then polls `GET /tasks/{id}` via `refetchInterval` until terminal.
- **Acceptance:** polling stops on completed/failed; result cached by TanStack Query.

### T46 — Analysis screen UI `Critical`
- **Deps:** T45, T42
- **Do:** `ReadinessGauge`, `SkillGapCard`, `QuestionTable` (sorted by likelihood), `SkillBadge`, `StatusPill`; loading/empty/error states.
- **Acceptance:** renders readiness score, skill-gap cards, ranked questions from real API.

---

## Group J — Packaging & deploy docs

### T47 — Dockerfiles & compose `Critical`
- **Deps:** T05, T09
- **Do:** `docker/server.Dockerfile`; `docker/docker-compose.yml` (postgres + server; redis behind an **off-by-default** profile).
- **Acceptance:** `docker compose up` runs Postgres + backend with no Redis; `/health` reachable.

### T48 — setup.sh
- **Deps:** T47, T40
- **Do:** `scripts/setup.sh` — copy both `.env.example`→`.env`, install backend+frontend deps, run migrations, print run commands.
- **Acceptance:** on a clean checkout, script completes and prints next steps.

### T49 — DEPLOYMENT.md
- **Deps:** T47
- **Do:** `DEPLOYMENT.md` — Neon, Render (incl. `alembic upgrade head`), Vercel; env var tables; CORS note.
- **Acceptance:** following the doc yields a working deployed demo (manual verification).

### T50 — CI stub
- **Deps:** T38
- **Do:** `.github/workflows/ci.yml` — lint + type-check + test (non-blocking until Phase 4).
- **Acceptance:** workflow file valid; runs the three steps.

---

## Dependency quick-map (critical path)

```
T01→T02→T05 ─┐
T06→T07→T09  ├─ backend skeleton
T10→T11→T12→T13
T14, T15      (cache/task)
T18→T19
ResumeFeat:  T20,T21,T22→T23→T24
ScraperFeat: T25,T26→T27→T28
Analysis:    T29→T30,T31→T32→T33→T34→T35
Frontend:    T40→T41→T43→T44 ; T41→T45→T46
Package:     T47→T48 ; T49 ; T50
```
