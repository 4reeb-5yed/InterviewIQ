# InterviewIQ — Folder Structure

> Target layout for the repository. Each entry is tagged so a coding agent knows exactly what to create now vs. later.

**Legend**
- `[MVP]` — implement fully in Phase 1.
- `[stub]` — create the file with an interface / no-op / TODO; not wired into the critical path.
- `[defer]` — do **not** create in Phase 1; listed for future awareness only.

Keep files small and single-purpose to minimize token cost for future AI-assisted edits.

---

## Project root

```
InterviewIQ/
├── README.md                  [done]  overview + doc index
├── docs/                      [done]  this planning set
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── DATABASE.md
│   ├── API_CONTRACTS.md
│   ├── FOLDER_STRUCTURE.md
│   └── PHASE_1_PLAN.md
├── server/                    [MVP]   FastAPI backend
├── client/                    [MVP]   React frontend
├── docker/                    [MVP]   Dockerfiles + compose
│   ├── docker-compose.yml
│   ├── server.Dockerfile
│   └── client.Dockerfile      [stub]  (frontend deploys via Vercel; compose for local only)
├── scripts/
│   └── setup.sh               [MVP]   one-command local bootstrap
├── .github/
│   └── workflows/
│       └── ci.yml             [stub]  lint + type-check + test (wire in Phase 4)
├── ARCHITECTURE.md            [defer] (root copy optional; docs/ is canonical)
├── DEPLOYMENT.md              [MVP]   local + Neon + Render + Vercel steps
└── CONTRIBUTING.md            [stub]
```

---

## Backend (`server/`)

```
server/
├── app/
│   ├── main.py                         [MVP] app factory, middleware, router include
│   ├── config/
│   │   └── settings.py                 [MVP] Pydantic Settings (.env), feature flags
│   ├── core/
│   │   ├── ai/
│   │   │   ├── base.py                 [MVP] AIProvider ABC, AIRequest, AIMessage
│   │   │   ├── factory.py              [MVP] AIProviderFactory
│   │   │   ├── json_retry.py           [MVP] parse-or-retry wrapper (≤3 tries)
│   │   │   └── providers/
│   │   │       ├── anthropic.py        [MVP] AnthropicProvider
│   │   │       ├── openai.py           [stub] raise NotImplemented
│   │   │       └── gemini.py           [stub] raise NotImplemented
│   │   ├── cache/
│   │   │   ├── base.py                 [MVP] CacheStore ABC
│   │   │   ├── memory.py               [MVP] InMemoryCacheStore (default)
│   │   │   ├── redis.py                [stub] RedisCacheStore (used if REDIS_URL)
│   │   │   └── factory.py              [MVP] build_cache(settings)
│   │   ├── tasks/
│   │   │   ├── base.py                 [MVP] TaskStore ABC + TaskStatus model
│   │   │   ├── memory.py               [MVP] InMemoryTaskStore (default)
│   │   │   ├── redis.py                [stub] RedisTaskStore
│   │   │   └── factory.py              [MVP] build_task_store(settings)
│   │   ├── flags/
│   │   │   └── feature_flags.py        [MVP] FeatureFlags wrapper over Settings
│   │   ├── rag/
│   │   │   ├── base.py                 [stub] KnowledgeProvider ABC
│   │   │   └── no_knowledge.py         [stub] returns []
│   │   ├── memory/
│   │   │   └── base.py                 [stub] MemoryStore ABC (Phase 2)
│   │   └── events/                     [defer] event bus (Phase 4)
│   ├── agents/
│   │   ├── state.py                    [MVP] AgentState TypedDict
│   │   ├── graph.py                    [MVP] build_analysis_graph()
│   │   ├── resume_agent.py             [MVP]
│   │   ├── job_agent.py                [MVP]
│   │   ├── skill_gap_agent.py          [MVP]
│   │   ├── question_agent.py           [MVP]
│   │   ├── interview_agent.py          [stub] (Phase 2)
│   │   ├── roadmap_agent.py            [stub] (Phase 3)
│   │   └── company_agent.py            [defer]
│   ├── prompts/
│   │   ├── resume.prompt.py            [MVP]
│   │   ├── job.prompt.py               [MVP]
│   │   ├── skill_gap.prompt.py         [MVP]
│   │   └── question_gen.prompt.py      [MVP]
│   ├── features/
│   │   ├── resume/
│   │   │   ├── router.py               [MVP]
│   │   │   ├── controller.py           [MVP]
│   │   │   ├── service.py              [MVP]
│   │   │   ├── repository.py           [MVP]
│   │   │   └── schemas.py              [MVP]
│   │   ├── scraper/
│   │   │   ├── router.py               [MVP]
│   │   │   ├── controller.py           [MVP]
│   │   │   ├── service.py              [MVP]
│   │   │   ├── repository.py           [MVP]
│   │   │   └── schemas.py              [MVP]
│   │   └── analysis/
│   │       ├── router.py               [MVP]  includes /tasks/{id}
│   │       ├── controller.py           [MVP]
│   │       ├── service.py              [MVP]  runs graph, cache, persist
│   │       ├── repository.py           [MVP]
│   │       └── schemas.py              [MVP]
│   ├── db/
│   │   ├── base.py                     [MVP] async engine + session factory
│   │   ├── models.py                   [MVP] Resume, Job, Analysis ORM
│   │   └── dependencies.py             [MVP] get_db()
│   ├── middleware/
│   │   ├── cors.py                     [MVP]
│   │   ├── rate_limit.py               [MVP] slowapi
│   │   └── error_handler.py            [MVP] uniform ApiError
│   ├── schemas/
│   │   ├── domain.py                   [MVP] ResumeData, JobData, SkillGap, InterviewQuestion
│   │   └── api.py                      [MVP] ApiResponse[T], ApiError envelopes
│   └── utils/
│       ├── logger.py                   [MVP] structlog setup
│       ├── response.py                 [MVP] envelope builders
│       └── pdf_parser.py               [MVP] pdfplumber wrapper
├── migrations/                         [MVP] Alembic (0001_initial_schema)
│   ├── env.py
│   └── versions/
├── tests/
│   ├── unit/                           [MVP] pdf parse, json_retry, skill-gap shape
│   └── integration/                    [stub] endpoint happy-path (expand later)
├── pyproject.toml                      [MVP] deps + ruff/black/mypy config
├── alembic.ini                         [MVP]
├── .env.example                        [MVP]
└── README.md                           [MVP] backend run instructions
```

---

## Frontend (`client/`)

```
client/
├── src/
│   ├── main.tsx                        [MVP]
│   ├── App.tsx                         [MVP] router + providers
│   ├── features/
│   │   ├── upload/
│   │   │   ├── components/             [MVP] DropZone, JobInputCard, Stepper
│   │   │   ├── hooks/                  [MVP] useResumeUpload, useJobIngest
│   │   │   └── types.ts                [MVP]
│   │   └── analysis/
│   │       ├── components/             [MVP] SkillGapCard, ReadinessGauge, QuestionTable
│   │       ├── hooks/                  [MVP] useAnalysis (submit + poll)
│   │       └── types.ts                [MVP]
│   ├── components/
│   │   ├── ui/                         [MVP] shadcn/ui wrappers
│   │   ├── layout/                     [MVP] AppShell, TopBar
│   │   └── shared/                     [MVP] SkillBadge, StatusPill, ProgressBar
│   ├── services/
│   │   ├── api.client.ts               [MVP] axios instance + interceptors
│   │   ├── upload.service.ts           [MVP]
│   │   ├── scraper.service.ts          [MVP]
│   │   └── analysis.service.ts         [MVP]
│   ├── types/
│   │   ├── analysis.types.ts           [MVP] mirror backend domain
│   │   └── api.types.ts                [MVP] ApiResponse<T>, ApiError
│   ├── config/
│   │   └── env.config.ts               [MVP] typed VITE_ vars
│   └── utils/                          [MVP] formatters, validators
├── index.html                          [MVP]
├── vite.config.ts                      [MVP]
├── tailwind.config.ts                  [MVP]
├── tsconfig.json                       [MVP]
├── package.json                        [MVP]
├── .env.example                        [MVP] VITE_API_BASE_URL
└── README.md                           [MVP]
```

---

## Notes for the coding agent

- Create `[MVP]` files only, in the order given by `PHASE_1_PLAN.md`.
- For `[stub]` files: define the class/interface, add a `# TODO Phase N` comment, return a safe default (`[]`, `NotImplementedError`, or pass-through). Do not import them into MVP execution paths except the cache/task in-memory defaults.
- Do not create `[defer]` files.
- Interview/roadmap agent stubs exist so `agents/` is import-safe, but they are **not** added as nodes to the Phase 1 graph.
