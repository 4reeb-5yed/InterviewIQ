# InterviewIQ — Coding Agent Handoff

> Read this first. You (Roo / Kiro IDE / VS Code coding agent) are implementing **Phase 1** of InterviewIQ from the planning docs in `docs/`. This file is your operating contract: goals, hard constraints, what to build, and what to leave as a scaffold.

---

## 1. Project goal

Build a **deployable MVP** of an AI technical-interview assistant. A user uploads a resume and provides a target job; the system returns a **skill-gap analysis**, a **readiness score**, and a **ranked list of predicted interview questions**.

The priority is a **working, deployed demo** — not architectural completeness. When in doubt, choose the simpler path that ships.

---

## 2. Source-of-truth documents (read in this order)

1. `docs/ARCHITECTURE.md` — layering, AI abstraction, Build/Scaffold/Defer matrix.
2. `docs/API_CONTRACTS.md` — exact request/response shapes and error codes.
3. `docs/DATABASE.md` — schema and JSONB payloads.
4. `docs/TASKS.md` — numbered tasks (T01–T50) with acceptance criteria.
5. `docs/PHASE1_CHECKLIST.md` — the order to build in (stages + critical path).
6. `docs/SETUP_GUIDE.md` — local environment, commands, env vars.
7. `docs/REPOSITORY_BOOTSTRAP.md` — repo skeleton, commits, branches.
8. `docs/FOLDER_STRUCTURE.md` — where each file lives + `[MVP]/[stub]/[defer]` tags.

If any instruction here conflicts with a doc, **the docs win**; flag the conflict rather than guessing.

---

## 3. How to work

- Implement **one TASKS.md task (or one PHASE1_CHECKLIST stage) at a time**. Do not batch unrelated tasks.
- For each task: implement → run its acceptance criteria → only then proceed. Keep changes small to keep context cheap.
- Follow the build order in `PHASE1_CHECKLIST.md`. Respect dependencies in `TASKS.md`.
- Create only `[MVP]` and required `[stub]` files for the current task. Never create `[defer]` files.
- After each task, run `ruff`, `mypy`, and relevant `pytest`; fix before moving on.
- Commit per `REPOSITORY_BOOTSTRAP.md` conventions (one logical change per commit).
- If a task is ambiguous or a doc is missing detail, **stop and ask** instead of inventing scope.

### Suggested per-task prompt
> Implement **{Txx}** from `docs/TASKS.md` for InterviewIQ. Follow `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, and `docs/DATABASE.md`. Create only the files this task needs (per `docs/FOLDER_STRUCTURE.md` tags). Satisfy the acceptance criteria, run lint/type-check/tests, then stop. Do not implement later tasks or any `[defer]` feature.

---

## 4. Architecture constraints (non-negotiable)

- **Layering:** Router → Controller → Service → Repository → DB. Routers/controllers orchestrate only; **no business logic in routers or React components**.
- **AI access only via the `AIProvider` interface.** Never import a vendor SDK (anthropic/openai/…) outside `core/ai/providers/`. Model names come from env, never hardcoded.
- **DB access only via repositories.** Services must not import a SQLAlchemy session directly.
- **Dependency injection** via FastAPI `Depends`. No service instantiates its own collaborators.
- **Typed contracts everywhere.** Pydantic v2 on backend; TypeScript interfaces on frontend. **No `any`, no untyped `dict`.**
- **Config from env only.** No hardcoded keys, URLs, models, limits, or origins.
- **Uniform responses.** Every endpoint returns `ApiResponse<T>` or `ApiError` (see API_CONTRACTS §1). Map errors to the documented codes.
- **Logging via structlog.** Never use `print()`.
- **No new external services for the MVP.** Postgres is the only required dependency.

---

## 5. What Phase 1 MUST implement

1. **Resume Upload** — `POST /upload/resume` (multipart PDF) → extract text (pdfplumber) → `ResumeAgent` → structured `ResumeData`, persisted.
2. **Job Description Input / Scraping** — `POST /scrape/job` accepting **either** a URL (httpx + BeautifulSoup) **or** pasted text → `JobAgent` → structured `JobData`, persisted.
3. **Skill Gap Analysis** — `SkillGapAgent` compares resume vs job → `SkillGap[]` + `readiness_score` (0–100) + summary.
4. **Question Prediction** — `QuestionAgent` → ranked `InterviewQuestion[]` with `likelihood_score`.
5. **Orchestration** — LangGraph pipeline `Resume → Job → SkillGap → Question`; run via `POST /analysis/run` (`202 {taskId}`, FastAPI `BackgroundTask`) + poll `GET /tasks/{taskId}`; fetch via `GET /analysis/{analysisId}`.
6. **Frontend** — Upload screen + Analysis screen (readiness gauge, skill-gap cards, ranked question table) using TanStack Query polling.
7. **Local + deploy** — Docker Compose (Postgres + backend, **Redis off by default**); deployable to Vercel + Render + Neon via env vars only.

**Defaults that keep the MVP simple:** in-memory `CacheStore` and in-memory `TaskStore` (no Redis); all feature flags `false`.

---

## 6. What to SCAFFOLD but NOT implement

Create the interface/class as a safe no-op with a `# TODO Phase N` comment. **Do not wire these into the Phase 1 execution path.**

| Item | Scaffold form | Phase |
|------|---------------|-------|
| Redis cache | `RedisCacheStore` class present; only used if `REDIS_URL` set | later |
| Redis task store | `RedisTaskStore` class present; gated on `REDIS_URL` | later |
| RAG / knowledge | `KnowledgeProvider` ABC + `NoKnowledgeProvider.retrieve()` returns `[]` | later |
| Interview memory | `MemoryStore` ABC only | 2 |
| Interview agent | `interview_agent.py` stub class; **not** a graph node | 2 |
| Roadmap agent | `roadmap_agent.py` stub class | 3 |
| Feature flags | `FeatureFlags` wrapper present; all flags default `false` | n/a |

---

## 7. What to DEFER entirely (do NOT create files)

- **Event bus / domain events** — no bus, no publishing in Phase 1.
- **Company intelligence agent** — documented only.
- **Analytics dashboard.**
- **Advanced LLM observability** (cost/latency dashboards, LangSmith) — Phase 1 logs token counts via structlog only.
- **Auth / user accounts.**
- **Interview & roadmap HTTP endpoints** (`/interview/*`, `/roadmap/*`).

If you find yourself adding any of these to make a Phase 1 task "complete", you've over-scoped — stop and re-read the Build/Scaffold/Defer matrix in ARCHITECTURE §2.

---

## 8. Definition of Done (Phase 1)

- [ ] End-to-end demo works locally with **no Redis** (`docker compose up` + `npm run dev`).
- [ ] Upload PDF + job → readiness score, skill gaps, ranked questions in the UI.
- [ ] Deployed demo on Vercel ↔ Render ↔ Neon, configured only via env vars.
- [ ] All `[MVP]` files exist; `[stub]` files are safe no-ops; no `[defer]` files created.
- [ ] `pytest`, `ruff`, `mypy` pass (backend); frontend type-checks.
- [ ] No hardcoded secrets/models/URLs; everything via env.
- [ ] Errors conform to API_CONTRACTS error codes.

---

## 9. Guardrails summary (the five things people get wrong)

1. Don't put logic in routers/controllers/components — services only.
2. Don't call a model SDK outside `core/ai/providers/`.
3. Don't touch the DB outside repositories.
4. Don't wire Redis/RAG/memory/interview into the MVP path — they stay no-ops.
5. Don't hardcode anything that belongs in `.env`.
