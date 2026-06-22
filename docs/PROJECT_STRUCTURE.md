# InterviewIQ — Project Structure

> The **actual** repository layout as currently implemented on `feature/analysis-quality-ux`
> (Phase 1 + multi-provider AI + optional-JD evidence-driven Career Intelligence + UI overhaul).
> For the original planned tree with `[MVP]/[stub]/[defer]` tags, see [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md).

```
InterviewIQ/
├── README.md                         # overview + quickstart + doc index
├── DEPLOYMENT.md                     # Neon + Render + Vercel deploy guide
├── CONTRIBUTING.md
├── .gitignore
├── .github/workflows/ci.yml          # CI: backend (ruff/mypy/pytest) + frontend (typecheck/lint/build)
├── scripts/setup.sh                  # one-command local bootstrap
├── docker/
│   ├── server.Dockerfile             # backend image (python:3.11-slim, uvicorn)
│   ├── client.Dockerfile             # [stub] frontend deploys via Vercel
│   └── docker-compose.yml            # postgres + server (redis off by default)
│
├── docs/
│   ├── ARCHITECTURE.md   API_CONTRACTS.md   DATABASE.md
│   ├── AI_PROVIDERS.md               # provider-agnostic AI: env vars + examples
│   ├── ROADMAP.md   FOLDER_STRUCTURE.md   PROJECT_STRUCTURE.md (this file)
│   ├── PHASE_1_PLAN.md   TASKS.md   PHASE1_CHECKLIST.md
│   └── SETUP_GUIDE.md   REPOSITORY_BOOTSTRAP.md   AGENT_HANDOFF.md
│
├── server/                           # ── BACKEND (FastAPI + LangGraph, Python 3.11) ──
│   ├── pyproject.toml   alembic.ini   .env.example   README.md
│   ├── app/
│   │   ├── main.py                   # ← BACKEND ENTRY POINT (create_app; startup AI validation)
│   │   ├── dependencies.py           # DI: get_ai_provider, get_cache, get_task_store
│   │   ├── config/settings.py        # Pydantic Settings (env): providers, per-agent models, DB...
│   │   ├── core/
│   │   │   ├── ai/
│   │   │   │   ├── base.py            # AIProvider ABC, AIRequest (incl. model), AIMessage
│   │   │   │   ├── factory.py         # AIProviderFactory.create(settings) — config-driven
│   │   │   │   ├── json_retry.py      # parse-or-retry wrapper
│   │   │   │   ├── validation.py      # startup credential validation (fail-fast)
│   │   │   │   └── providers/         # anthropic · openai (+ compatible/local) · gemini · bedrock
│   │   │   ├── cache/                 # CacheStore ABC + memory (default) + redis + factory
│   │   │   ├── tasks/                 # TaskStore ABC + memory (default) + redis + factory
│   │   │   ├── flags/   rag/   memory/  # feature flags + scaffolds
│   │   │   └── exceptions.py          # AppError, InputValidationError, ResourceNotFoundError
│   │   ├── agents/
│   │   │   ├── state.py               # AgentState (TypedDict) incl. career_report
│   │   │   ├── graph.py               # career → (job_data?) skill_gap → question  (conditional)
│   │   │   ├── career_agent.py        # Career Intelligence (always runs; evidence-driven)
│   │   │   ├── resume_agent.py  job_agent.py  skill_gap_agent.py  question_agent.py
│   │   ├── prompts/
│   │   │   ├── career_prompt.py       # rigorous, anti-inflation, evidence-required
│   │   │   └── resume_prompt.py  job_prompt.py  skill_gap_prompt.py  question_gen_prompt.py
│   │   ├── features/                  # router → controller → service → repository
│   │   │   ├── resume/                # POST /upload/resume
│   │   │   ├── scraper/               # POST /scrape/job (url | paste)
│   │   │   └── analysis/              # POST /analysis/run (jobId OPTIONAL), /tasks/{id}, /analysis/{id}
│   │   ├── db/
│   │   │   ├── base.py   dependencies.py
│   │   │   └── models.py              # Resume, Job, Analysis (job_id nullable + career_report JSONB)
│   │   ├── middleware/                # error_handler (central) · rate_limit (slowapi)
│   │   ├── schemas/
│   │   │   ├── api.py                 # ApiResponse[T], ApiError
│   │   │   └── domain.py              # ResumeData, JobData, SkillGap, InterviewQuestion,
│   │   │                              #   ScoredDimension, CareerLevelAssessment, ATSSimulation,
│   │   │                              #   RoleFit, GapAnalysis, CredibilityIssue, ROIImprovement,
│   │   │                              #   Strength, CareerReport, JobMatch
│   │   └── utils/                     # logger (structlog) · response · pdf_parser
│   ├── migrations/versions/
│   │   ├── 0001_initial_schema.py
│   │   └── 0002_optional_job_career_report.py   # job_id nullable + career_report JSONB
│   └── tests/
│       ├── conftest.py               # FakeAIProvider fixture
│       ├── unit/ (test_pdf_parser, test_json_retry, test_skill_gap_agent)
│       └── integration/ (test_pipeline_happy_path)
│
└── client/                           # ── FRONTEND (React 18 + TS, Vite, Tailwind, dark mode) ──
    ├── package.json  index.html  vite.config.ts  tailwind.config.ts  postcss.config.js
    ├── tsconfig.json  tsconfig.node.json  .eslintrc.cjs  .env.example  README.md
    └── src/
        ├── main.tsx                  # ← FRONTEND ENTRY POINT
        ├── App.tsx                   # routes: / (landing), /analyze (upload), /analysis/:taskId (report)
        ├── index.css                 # Tailwind + base + focus-visible + print styles
        ├── vite-env.d.ts
        ├── lib/                      # cn (classnames) · theme (dark mode hook) · export (copy/share/print)
        ├── config/env.config.ts      # reads VITE_API_BASE_URL
        ├── services/                 # api.client (axios + envelope unwrap) · upload · scraper · analysis
        ├── types/                    # api.types · analysis.types (mirror backend incl. CareerReport)
        ├── components/
        │   ├── layout/ (AppShell, TopBar [active nav + theme toggle], BottomNav [mobile tabs])
        │   ├── shared/ (SkillBadge, StatusPill)
        │   └── ui/ (button, card, Section [collapsible], Skeleton, icons)
        └── features/
            ├── home/LandingPage.tsx          # headline + CTA + visual how-it-works
            ├── upload/                        # DropZone (drag-over + size + errors), JobInputCard, hooks, UploadPage
            └── analysis/
                ├── AnalysisPage.tsx           # report: sticky summary bar + collapsible sections + export
                ├── hooks/useAnalysis.ts       # submit→poll
                └── components/                # SummaryBar, ScoreCard, AtsSimulation, CredibilityFlags,
                                               #   MarketFit, GapAnalysisView, RoiImprovements,
                                               #   ReadinessGauge, SkillGapCard, QuestionTable,
                                               #   ReportSkeleton, LoadingStages
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
            career_agent (ALWAYS) ──(jobId provided?)──> skill_gap_agent → question_agent
                                  └──(resume only)─────> END
        client polls GET /api/v1/tasks/{taskId} until completed
        result: { mode: "resume_only" | "job_match", careerReport, jobMatch? }
```

## Current capabilities (beyond the original Phase 1)

- **Optional Job Description** — resume-only runs produce a full Career Intelligence Report; adding a job layers in the Job Match analysis. One pipeline, conditional graph.
- **Evidence-driven report** — every score carries `reasoning`, `evidenceFound`, `evidenceMissing`; ATS field-by-field simulation; market fit with drivers/blockers; credibility flags; before→after ROI; `insufficient_data` instead of guessing.
- **Provider-agnostic AI** — Anthropic, OpenAI, Gemini, AWS Bedrock, and any OpenAI-compatible/local endpoint (OpenRouter, Ollama, vLLM), selected purely by env (see [AI_PROVIDERS.md](AI_PROVIDERS.md)).
- **UI/UX** — landing/upload/report screens, dark mode, mobile bottom-nav, accessible states, skeleton + progressive loading, collapsible sections, and report export (copy / Save-as-PDF / share).
