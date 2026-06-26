# InterviewIQ — Backend

FastAPI + LangGraph backend that parses résumés/jobs and runs an evidence-based analysis pipeline.
Python 3.11, async SQLAlchemy + PostgreSQL, Alembic migrations, provider-agnostic AI.

- API docs (local): http://localhost:8000/docs
- Production: https://interviewiq-02c1.onrender.com
- Architecture: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) · API: [../docs/API_CONTRACTS.md](../docs/API_CONTRACTS.md)

---

## Requirements

- Python **3.11**
- PostgreSQL (local container via `../docker/docker-compose.yml`, or Neon)
- An AI provider key (`AI_API_KEY`) — Anthropic by default, or a local model (see [../docs/AI_PROVIDERS.md](../docs/AI_PROVIDERS.md))

## Setup & run

```bash
python3.11 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"        # pip is the package manager (PEP 621 pyproject.toml)
cp .env.example .env           # set AI_API_KEY; point DATABASE_URL at a running Postgres
alembic upgrade head           # create the schema
uvicorn app.main:app --reload --port 8000
```

## Quality

```bash
ruff check .      # lint
black --check .   # format
mypy app          # types (strict)
pytest            # tests
```

---

## How it works

### FastAPI app factory (`app/main.py`)
`create_app()` loads settings, configures `structlog`, **validates AI credentials (fail-fast)**,
adds CORS + a `slowapi` rate-limit middleware, registers a central exception handler (uniform
`ApiError` envelope), exposes `GET /api/v1/health`, and mounts the resume / scraper / analysis
routers. All responses are wrapped in `ApiResponse[T]` or `ApiError`.

Layering is strict: **Router → Controller → Service → Repository → DB**, with dependencies wired via
FastAPI `Depends`. The AI provider is resolved from config (`AIProviderFactory.create(settings)`),
so business logic depends only on the `AIProvider` interface.

### Résumé upload (`features/resume`)
`POST /api/v1/upload/resume` (multipart `file`):
1. validates type/size (`MAX_FILE_SIZE_MB`),
2. extracts text with **`pdfplumber`** (`utils/pdf_parser.py`),
3. runs the **résumé agent** (LLM) to produce structured `ResumeData`,
4. persists a `Resume` row (raw text + parsed JSONB) and returns `resumeId` + parsed data.

### Job scraper (`features/scraper`)
`POST /api/v1/scrape/job` accepts **either** a `url` **or** pasted `description`:
- URL mode fetches the page with **`httpx`** and extracts readable text with **`BeautifulSoup4`**;
- the **job agent** produces structured `JobData`; a `Job` row is persisted and `jobId` returned.

### Analysis pipeline (`agents/` + `features/analysis`)
A **LangGraph** graph orchestrates typed agents over a shared `AgentState`:

```
career_agent (always) ──(job provided?)──> skill_gap_agent → question_agent → END
                       └──(résumé only)──> END
```

- `career_agent` produces the **Career Intelligence Report** (recruiter + ATS + hiring-manager audit:
  candidate context, ATS analysis, section reviews, project assessment, recruiter simulation, market
  positioning, gap analysis, credibility, career projection, ROI — every score with reasoning,
  evidence found/missing, and confidence).
- when a job is present, `skill_gap_agent` + `question_agent` add the **job match** (skill gaps,
  readiness score, predicted questions).
- LLM calls go through a **parse-or-retry** JSON wrapper (`core/ai/json_retry.py`).

### Background tasks (submit → poll)
`POST /api/v1/analysis/run` returns **`202 { taskId }`** and runs the pipeline in a FastAPI
`BackgroundTask` (the pipeline can take 15–30s). Clients poll `GET /api/v1/tasks/{taskId}` until the
status is `completed`/`failed`. Task status and analysis results are cached.

- **Cache & task store** default to **in-memory** singletons; set `REDIS_URL` to use Redis instead
  (interfaces in `core/cache` and `core/tasks`). In-memory means **single-instance** in production.
- The background path uses a **session factory** (not the request session) because it outlives the request.

### Database & migrations (`db/`, `migrations/`)
- **SQLAlchemy 2.0 async** engine over **PostgreSQL** (`asyncpg`).
- Models: `Resume`, `Job`, `Analysis` (`job_id` nullable; `career_report` JSONB; job-match columns).
- **Alembic** manages the schema:
  ```bash
  alembic upgrade head                       # apply (0001 initial, 0002 optional job + career_report)
  alembic revision --autogenerate -m "msg"   # new migration
  alembic downgrade -1                        # roll back
  ```
  Production must run `alembic upgrade head` once after deploy (see [../DEPLOYMENT.md](../DEPLOYMENT.md)).

---

## Configuration

All settings come from environment variables (`app/config/settings.py`); see `.env.example` and the
env table in the [root README](../README.md#environment-variables). Provider-specific variables and
local-LLM examples are in [../docs/AI_PROVIDERS.md](../docs/AI_PROVIDERS.md).

## Layout

```
app/
├── main.py            # app factory + startup validation
├── config/settings.py # env-driven settings
├── core/              # ai (providers, factory, validation, json_retry), cache, tasks, flags, rag, memory
├── agents/            # state, graph, resume/job/career/skill_gap/question agents
├── prompts/           # one prompt module per agent
├── features/          # resume · scraper · analysis (router→controller→service→repository→schemas)
├── db/                # async engine, models, get_db dependency
├── middleware/        # central error handler + rate limit
├── schemas/           # api envelopes + domain models
└── utils/             # logger, response builders, pdf parser
migrations/            # Alembic env + versions
tests/                 # unit + integration (FakeAIProvider fixture)
```
