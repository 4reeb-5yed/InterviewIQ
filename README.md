# InterviewIQ

> AI Technical Interview Reverse Engineer — take a resume + a target job, identify skill gaps, predict likely interview questions, run a mock interview, and generate a study roadmap.

**Status:** ✅ Phase 1 complete **+ enhancements.** Resume-only **Career Intelligence Report** (Job Description optional), evidence-driven scoring, **provider-agnostic AI** (Anthropic / OpenAI / Gemini / Bedrock / local), and a redesigned UI (dark mode, mobile, report export). Runs locally with Docker Compose (no Redis) and deploys to Vercel + Render + Neon via env vars. See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md), [docs/AI_PROVIDERS.md](docs/AI_PROVIDERS.md), and [DEPLOYMENT.md](DEPLOYMENT.md).

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

## What it does (current)

Resume in, evidence-based report out. A Job Description is **optional**.

1. **Resume Upload** — PDF upload + text extraction → structured resume data.
2. **Career Intelligence Report (resume-only)** — evidence-driven scores (ATS Readiness, Resume Quality, Employability, Interview Probability, Career Level — each with reasoning + evidence found/missing), field-by-field **ATS simulation**, **market fit** roles (drivers/blockers, realistic vs stretch), **gap-to-next-level** with how-to-acquire, **credibility flags**, and before→after **ROI improvements**. Uses `insufficient_data` instead of guessing.
3. **Job Match (optional)** — add a job (URL or pasted text) to also get skill gaps, a readiness score, and predicted interview questions. Same pipeline, conditional graph.
4. **Provider-agnostic AI** — switch between Anthropic, OpenAI, Gemini, AWS Bedrock, or a local/OpenAI-compatible model by editing `.env` only. See [docs/AI_PROVIDERS.md](docs/AI_PROVIDERS.md).

Frontend: landing → upload → report, with dark mode, mobile bottom-nav, skeleton + progressive loading, collapsible sections, and export (copy / Save-as-PDF / share).

**Deferred to later phases:** stateful mock interview, study roadmap, interview memory, RAG, company intelligence, event bus, analytics dashboard, advanced LLM observability.

> The original four-capability Phase 1 plan (Resume → Job → Skill Gap → Questions) is documented in [docs/PHASE_1_PLAN.md](docs/PHASE_1_PLAN.md); the app has since been extended as above.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + TypeScript, Vite, Tailwind (dark mode), TanStack Query |
| Backend | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 async, Alembic |
| AI orchestration | LangGraph + provider-agnostic AI (Anthropic / OpenAI / Gemini / Bedrock / OpenAI-compatible & local) |
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

Phase 1 is complete and **extended**: resume upload, job ingestion (URL or paste), and an
async submit→poll LangGraph pipeline that **always** produces an evidence-driven Career
Intelligence Report and **optionally** adds Job Match (skill gaps + readiness + predicted
questions) when a JD is provided. The AI layer is fully provider-agnostic (Anthropic / OpenAI /
Gemini / Bedrock / local). The frontend has landing, upload, and report screens with dark mode,
mobile navigation, and export. Mock interview, study roadmap, memory, RAG, company intelligence,
event bus, and analytics remain deferred. See [docs/ROADMAP.md](docs/ROADMAP.md) and
[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).
