# InterviewIQ

> AI Technical Interview Reverse Engineer — take a resume + a target job, identify skill gaps, predict likely interview questions, run a mock interview, and generate a study roadmap.

**Status:** ✅ Phase 1 implemented. Backend (FastAPI + LangGraph) and frontend (React + TS) are built; runs locally with Docker Compose (no Redis) and deploys to Vercel + Render + Neon via env vars. See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) and [DEPLOYMENT.md](DEPLOYMENT.md).

## Quickstart (local)

```bash
./scripts/setup.sh                                   # .env files + install backend & frontend deps
docker compose -f docker/docker-compose.yml up       # Postgres + backend (migrations + API), no Redis
cd client && npm run dev                              # frontend on http://localhost:5173
```

Add your Anthropic key to `server/.env` (`AI_API_KEY`) before running an analysis.

---

## Why this exists

A portfolio-quality, production-shaped GenAI app for a fresher positioning as an **Applied AI Engineer**. Every architectural decision is meant to be defensible in a technical interview — but deliberately scoped so the MVP actually ships and gets deployed instead of drowning in enterprise patterns.

## Guiding principle for this build

> **Prioritize a working, deployable MVP over enterprise architecture.** Minimize unnecessary complexity. Optimize the codebase and docs for AI-assisted development (small modules, clear boundaries, low token cost to modify).

If a pattern doesn't earn its keep in the MVP, it's **scaffolded** (interface + no-op) or **deferred** (documented, not built). See the Build / Scaffold / Defer matrix in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## MVP scope (Phase 1)

The MVP delivers exactly four capabilities, end to end, deployed:

1. **Resume Upload** — PDF upload + text extraction → structured resume data.
2. **Job Scraping** — fetch a job posting (URL) or accept pasted text → structured job data.
3. **Analysis Graph** — LangGraph pipeline: Resume → Job → Skill Gap → Questions.
4. **Question Prediction** — typed, ranked list of likely interview questions with a readiness score.

Plus a minimal frontend (Upload screen + Analysis screen) and a deployed demo.

**Not in the MVP** (scaffolded or deferred): mock interview module, study roadmap, interview memory, RAG, company intelligence, event bus, analytics dashboard, advanced LLM observability.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + TypeScript, Vite, Tailwind + shadcn/ui, TanStack Query |
| Backend | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 async, Alembic |
| AI orchestration | LangGraph + provider-agnostic AI abstraction (Anthropic default) |
| Database | PostgreSQL (Neon in prod, Postgres container locally) |
| Cache / tasks | Optional Redis behind an interface; **in-memory fallback is the MVP default** |

## Hosting

| Component | Target |
|-----------|--------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Local dev | Docker Compose |

The app must deploy to the free tier **without code changes** — only environment variables differ between environments. **Redis is not required** to run or deploy the MVP.

---

## Documentation index

| Document | Purpose |
|----------|---------|
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | **Actual current repository tree** (entry points, package managers, request flow) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Final architecture + Build/Scaffold/Defer matrix |
| [docs/AI_PROVIDERS.md](docs/AI_PROVIDERS.md) | Provider-agnostic AI: env vars + examples (OpenAI/Gemini/Bedrock/local) |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phase-by-phase implementation roadmap |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, ERD, migrations |
| [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) | REST contracts (Phase 1 fully specced) |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Planned/target tree, with status legend |
| [docs/PHASE_1_PLAN.md](docs/PHASE_1_PLAN.md) | Block-level Phase 1 plan (0–12) |
| [docs/TASKS.md](docs/TASKS.md) | Smallest executable tasks (T01–T50) with deps + acceptance criteria |
| [docs/PHASE1_CHECKLIST.md](docs/PHASE1_CHECKLIST.md) | Stage-by-stage build order, critical path, blockers |
| [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Local dev setup: versions, tools, Docker, env vars, run commands |
| [docs/REPOSITORY_BOOTSTRAP.md](docs/REPOSITORY_BOOTSTRAP.md) | Repo skeleton, git init, first commits, branch strategy |
| [docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md) | Operating contract for the IDE coding agent |

---

## Project status

Phase 1 is complete: resume upload, job ingestion (URL or paste), the LangGraph
analysis pipeline (skill gaps + readiness + predicted questions), the submit→poll
async flow, and the Upload/Analysis frontend screens. Mock interview, study roadmap,
memory, RAG, company intelligence, event bus, and analytics remain deferred to later
phases (scaffolded where noted). See [docs/ROADMAP.md](docs/ROADMAP.md).
