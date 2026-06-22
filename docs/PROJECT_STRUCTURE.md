# InterviewIQ — Project Structure

> The **actual** repository layout as currently implemented (Phase 1 + multi-provider AI + optional-JD Career Intelligence). For the original planned/target layout with `[MVP]/[stub]/[defer]` tags, see [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md).

```
InterviewIQ/
├── README.md                         # overview + quickstart + doc index
├── DEPLOYMENT.md                     # Neon + Render + Vercel deploy guide
├── CONTRIBUTING.md
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI: backend (ruff/mypy/pytest) + frontend (typecheck/lint/build)
├── scripts/
│   └── setup.sh                      # one-command local bootstrap
├── docker/
│   ├── server.Dockerfile             # backend image (python:3.11-slim, uvicorn)
│   ├── client.Dockerfile             # [stub] frontend deploys via Vercel
│   └── docker-compose.yml            # postgres + server (redis off by default)
│
├── docs/
│   ├── ARCHITECTURE.md               # architecture + Build/Scaffold/Defer matrix
│   ├── API_CONTRACTS.md              # REST envelope, endpoints, error codes
│   ├── DATABASE.md                   # schema, ERD, JSONB payloads
│   ├── AI_PROVIDERS.md               # provider-agnostic AI: env vars + examples
│   ├── ROADMAP.md                    # phased delivery plan
│   ├── FOLDER_STRUCTURE.md           # planned/target tree (tagged)
│   ├── PROJECT_STRUCTURE.md          # this file — actual current tree
│   ├── PHASE_1_PLAN.md               # block-level Phase 1 plan
│   ├── TASKS.md                      # atomic tasks T01–T50
│   ├── PHASE1_CHECKLIST.md           # build order + critical path
│   ├── SETUP_GUIDE.md                # local dev setup
│   ├── REPOSITORY_BOOTSTRAP.md       # repo init + branch strategy
│   └── AGENT_HANDOFF.md              # coding-agent operating contract
│
├── server/                           # ── BACKEND (FastAPI + LangGraph, Python 3.11) ──
│   ├── pyproject.toml                # deps + ruff/black/mypy/pytest config
│   ├── alembic.ini
│   ├── .env.example                  # backend env contract (AI providers, DB, etc.)
│   ├── README.md
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # ← BACKEND ENTRY POINT (create_app / app)
│   │   ├── dependencies.py           # DI: get_ai_provider, get_cache, get_task_store
│   │   ├── config/
│   │   │   └── settings.py           # Pydantic Settings (env)
│   │   ├── core/
│   │   │   ├── ai/
│   │   │   │   ├── base.py            # AIProvider ABC, AIRequest, AIMessage
│   │   │   │   ├── factory.py         # config-driven provider selection
│   │   │   │   ├── json_retry.py      # parse-or-retry wrapper
│   │   │   │   ├── validation.py      # startup credential validation
│   │   │   │   └── providers/
│   │   │   │       ├── anthropic.py
│   │   │   │       ├── openai.py      # OpenAI + OpenAI-compatible/local (base_url)
│   │   │   │       ├── gemini.py
│   │   │   │       └── bedrock.py     # AWS Bedrock (Converse API)
│   │   │   ├── cache/                 # CacheStore ABC + memory (default) + redis + factory
│   │   │   ├── tasks/                 # TaskStore ABC + memory (default) + redis + factory
│   │   │   ├── flags/                 # FeatureFlags
│   │   │   ├── rag/                   # KnowledgeProvider ABC + NoKnowledgeProvider (scaffold)
│   │   │   ├── memory/                # MemoryStore ABC (Phase 2 scaffold)
│   │   │   └── exceptions.py          # AppError, InputValidationError, ResourceNotFoundError
│   │   ├── agents/
│   │   │   ├── state.py               # AgentState (TypedDict)
│   │   │   ├── graph.py               # career → (job?) skill_gap → question
│   │   │   ├── resume_agent.py
│   │   │   ├── job_agent.py
│   │   │   ├── career_agent.py        # Career Intelligence (always runs)
│   │   │   ├── skill_gap_agent.py
│   │   │   └── question_agent.py
│   │   ├── prompts/
│   │   │   ├── resume_prompt.py
│   │   │   ├── job_prompt.py
│   │   │   ├── career_prompt.py       # evidence-based career report prompt
│   │   │   ├── skill_gap_prompt.py
│   │   │   └── question_gen_prompt.py
│   │   ├── features/                  # router → controller → service → repository
│   │   │   ├── resume/                # POST /upload/resume
│   │   │   ├── scraper/               # POST /scrape/job (url | paste)
│   │   │   └── analysis/              # POST /analysis/run (jobId optional), /tasks/{id}, /analysis/{id}
│   │   ├── db/
│   │   │   ├── base.py                # async engine + session factory
│   │   │   ├── models.py              # Resume, Job, Analysis
│   │   │   └── dependencies.py        # get_db()
│   │   ├── middleware/
│   │   │   ├── error_handler.py       # central exception → ApiError mapping
│   │   │   └── rate_limit.py          # slowapi limiter
│   │   ├── schemas/
│   │   │   ├── api.py                 # ApiResponse[T], ApiError
│   │   │   └── domain.py              # ResumeData, JobData, SkillGap, InterviewQuestion,
│   │   │                              #   CareerReport (+ sections), JobMatch
│   │   └── utils/
│   │       ├── logger.py              # structlog
│   │       ├── response.py            # envelope builders
│   │       └── pdf_parser.py          # pdfplumber wrapper
│   ├── migrations/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       ├── 0001_initial_schema.py
│   │       └── 0002_optional_job_career_report.py
│   └── tests/
│       ├── conftest.py               # FakeAIProvider fixture
│       ├── unit/ (test_pdf_parser, test_json_retry, test_skill_gap_agent)
│       └── integration/ (test_pipeline_happy_path)
│
└── client/                           # ── FRONTEND (React 18 + TS, Vite) ──
    ├── package.json                  # npm scripts + deps
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── tsconfig.json / tsconfig.node.json
    ├── .eslintrc.cjs
    ├── .env.example                  # VITE_API_BASE_URL
    ├── README.md
    └── src/
        ├── main.tsx                  # ← FRONTEND ENTRY POINT
        ├── App.tsx                   # routes: / (upload), /analysis/:taskId
        ├── index.css
        ├── vite-env.d.ts
        ├── config/
        │   └── env.config.ts         # reads VITE_API_BASE_URL
        ├── services/
        │   ├── api.client.ts         # axios + envelope unwrap → ApiError
        │   ├── upload.service.ts
        │   ├── scraper.service.ts
        │   └── analysis.service.ts
        ├── types/
        │   ├── api.types.ts          # ApiResponse<T>, ApiError
        │   └── analysis.types.ts     # domain + CareerReport + JobMatch (mirror backend)
        ├── components/
        │   ├── layout/ (AppShell, TopBar)
        │   ├── shared/ (SkillBadge, StatusPill)
        │   └── ui/ (button, card)
        └── features/
            ├── upload/               # DropZone, JobInputCard, Stepper, hooks, UploadPage
            └── analysis/             # useAnalysis (polling), CareerReportView,
                                      #   ReadinessGauge, SkillGapCard, QuestionTable, AnalysisPage
```

## Entry points & tooling

| | Path / command |
|---|---|
| Backend entry point | `server/app/main.py` (`uvicorn app.main:app`) |
| Frontend entry point | `client/src/main.tsx` (`npm run dev`) |
| Frontend API base URL | `client/src/config/env.config.ts` ← `VITE_API_BASE_URL` |
| Backend package manager | **pip** (`server/pyproject.toml`, editable install; `uv` optional) |
| Frontend package manager | **npm** (`client/package.json`) |
| Local stack | `docker compose -f docker/docker-compose.yml up` + `cd client && npm run dev` |

## Request flow (analysis)

```
client → POST /api/v1/analysis/run { resumeId, jobId? } → 202 { taskId }
        AnalysisController → AnalysisService → LangGraph
            career_agent (always) ──(jobId?)──> skill_gap_agent → question_agent
        client polls GET /api/v1/tasks/{taskId} until completed
        result: { mode, careerReport, jobMatch? }
```
