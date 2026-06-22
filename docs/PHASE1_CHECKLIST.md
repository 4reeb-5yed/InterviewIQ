# InterviewIQ — Phase 1 Build Checklist

> The exact order to build Phase 1. Follow top to bottom. Critical-path items are marked ⭐ — a slip here delays the demo. Each stage lists its prerequisites and the blockers that stop you proceeding.

Task IDs (`Txx`) reference [TASKS.md](TASKS.md).

---

## Stage 0 — Environment ready (prerequisite for everything)

**Prerequisites:** Python 3.11, Node 20+, Docker, a Postgres (local container or Neon), an Anthropic API key.
**Blockers:** no `AI_API_KEY` → agents can't run (tests use a mock provider, so backend structure can still be built); no Postgres → migrations/repos can't be verified.

- [ ] Tools installed per [SETUP_GUIDE.md](SETUP_GUIDE.md)
- [ ] `.env` files created from `.env.example` (backend + frontend)

---

## Stage 1 — Backend skeleton ⭐

**Goal:** server boots and answers `/health`.
**Prerequisite:** Stage 0. **Blocker for:** every backend feature.

- [ ] ⭐ T01 Initialize backend project
- [ ] ⭐ T02 Settings & env contract
- [ ] T03 Logging
- [ ] T04 Response envelope
- [ ] ⭐ T05 App factory + health route

**Exit:** `uvicorn app.main:app` → `GET /api/v1/health` returns success.

---

## Stage 2 — Database ⭐

**Goal:** schema exists and the app connects.
**Prerequisite:** Stage 1 (T02). **Blocker for:** all repositories (T22, T26, T33).

- [ ] ⭐ T06 Async engine & session
- [ ] ⭐ T07 ORM models
- [ ] T08 DB dependency
- [ ] ⭐ T09 Alembic initial migration

**Exit:** `alembic upgrade head` creates `resumes`, `jobs`, `analyses`.

---

## Stage 3 — Core abstractions ⭐

**Goal:** AI, cache, task-store, flags ready; MVP runs with no Redis.
**Prerequisite:** Stage 1. **Blocker for:** all agents (need AI factory + json_retry).

- [ ] ⭐ T10 AI provider interface
- [ ] ⭐ T11 JSON retry wrapper
- [ ] ⭐ T12 Anthropic provider (+ openai/gemini stubs)
- [ ] ⭐ T13 AI factory
- [ ] ⭐ T14 Cache abstraction (in-memory default)
- [ ] ⭐ T15 Task store abstraction (in-memory default)
- [ ] T16 Feature flags
- [ ] T17 Scaffold RAG & memory (no-op) — **do not wire in**

**Exit:** factory returns Anthropic provider; in-memory cache/task pass unit tests; Redis untouched.

---

## Stage 4 — Contracts ⭐

**Goal:** domain models + prompts locked.
**Prerequisite:** Stage 1. **Blocker for:** every agent and feature schema.

- [ ] ⭐ T18 Domain schemas
- [ ] ⭐ T19 Prompt modules

**Exit:** schemas validate sample payloads; 4 prompt modules export `SYSTEM_PROMPT` + `TEMPERATURE`.

---

## Stage 5 — Resume feature ⭐

**Goal:** `POST /upload/resume` works.
**Prerequisite:** Stages 2, 3, 4.

- [ ] ⭐ T20 PDF parser util
- [ ] ⭐ T21 Resume agent
- [ ] ⭐ T22 Resume repository
- [ ] ⭐ T23 Resume service
- [ ] ⭐ T24 Resume router/controller/schemas

**Exit:** upload a sample PDF → `200` with `resumeId` + `parsedData`.

---

## Stage 6 — Scraper feature ⭐

**Goal:** `POST /scrape/job` works (URL or pasted text).
**Prerequisite:** Stages 2, 3, 4.

- [ ] ⭐ T25 Job agent
- [ ] ⭐ T26 Job repository
- [ ] ⭐ T27 Scraper service
- [ ] ⭐ T28 Scraper router/controller/schemas

**Exit:** post a URL or pasted text → `200` with `jobId` + `jobData`.

---

## Stage 7 — Analysis pipeline ⭐ (the core value)

**Goal:** `POST /analysis/run` → poll → gaps + readiness + questions.
**Prerequisite:** Stages 5 & 6 (need stored resume + job), Stage 3 (cache/task).
**Blocker:** without resume & job persisting, the pipeline has no inputs.

- [ ] ⭐ T29 Agent state
- [ ] ⭐ T30 Skill gap agent
- [ ] ⭐ T31 Question agent
- [ ] ⭐ T32 Analysis graph
- [ ] ⭐ T33 Analysis repository
- [ ] ⭐ T34 Analysis service (cache + background task)
- [ ] ⭐ T35 Analysis router/controller (`/analysis/run`, `/tasks/{id}`, `/analysis/{id}`)

**Exit:** submit `{resumeId, jobId}` → `202`; polling reaches `completed` with full result; repeat call hits cache.

---

## Stage 8 — Backend hardening

**Goal:** uniform errors, limits, tests.
**Prerequisite:** Stages 5–7.

- [ ] ⭐ T36 Error handler middleware
- [ ] T37 CORS + rate limit
- [ ] T38 Unit tests
- [ ] T39 Integration happy path

**Exit:** `pytest`, `ruff`, `mypy` green; errors match API_CONTRACTS codes.

---

## Stage 9 — Frontend ⭐

**Goal:** Upload + Analysis screens drive the backend.
**Prerequisite:** Stage 1 (API contract). Can start UI scaffolding (T40–T42) in parallel with backend, but T44/T46 need live endpoints.

- [ ] ⭐ T40 Frontend bootstrap
- [ ] ⭐ T41 API client & types
- [ ] T42 App shell & routing
- [ ] ⭐ T43 Upload services & hooks
- [ ] ⭐ T44 Upload screen UI
- [ ] ⭐ T45 Analysis service & polling hook
- [ ] ⭐ T46 Analysis screen UI

**Exit:** in the browser: upload PDF + job → run → see readiness, gaps, ranked questions.

---

## Stage 10 — Package & deploy

**Goal:** one-command local, deployed demo.
**Prerequisite:** Stages 1–9.

- [ ] ⭐ T47 Dockerfiles & compose (Redis off by default)
- [ ] T48 setup.sh
- [ ] ⭐ T49 DEPLOYMENT.md
- [ ] T50 CI stub

**Exit:** `docker compose up` runs the stack with no Redis; deployed Vercel↔Render↔Neon demo works via env vars only.

---

## Critical path (shortest route to a working demo)

```
Stage 1 ⭐ → Stage 2 ⭐ → Stage 3 ⭐ → Stage 4 ⭐
        → Stage 5 ⭐ → Stage 6 ⭐ → Stage 7 ⭐
        → Stage 9 ⭐ → Stage 10 (T47, T49) ⭐
```
Stages 8 (hardening) and the non-critical items (T16, T17, T37, T38, T48, T50) can follow once the demo path is green.

## Top blockers to watch

1. **No Postgres reachable** → Stages 2, 5, 6, 7 cannot be verified. Fix first.
2. **No AI key** → real agent runs fail; build/test against the mock provider, add the key before the live demo.
3. **CORS misconfig** → frontend can't call backend in prod; ensure Vercel domain is in `ALLOWED_ORIGINS`.
4. **Accidentally wiring scaffolds** (Redis/RAG/memory/interview) into the MVP path → keep them no-ops; this is the #1 scope-creep risk.
