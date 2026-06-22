# InterviewIQ — Implementation Roadmap

> Phased delivery. Each phase has a clear goal, a short deliverable list, and **exit criteria** — do not start a phase until the previous phase's exit criteria are met and demoable.

The MVP is **Phase 0 + Phase 1**. Everything after is enhancement.

---

## Phase 0 — Planning & specification ✅ (current)

**Goal:** lock the design so code generation is mechanical, not exploratory.

**Deliverables**
- README, Architecture, Roadmap, Database schema, API contracts, Folder structure, Phase 1 plan.

**Exit criteria**
- All six planning docs reviewed and approved.
- Build/Scaffold/Defer matrix agreed (see ARCHITECTURE §2).

---

## Phase 1 — MVP core pipeline ⭐ (the actual product)

**Goal:** a deployed app where a user uploads a resume, provides a job, and gets a skill-gap analysis + predicted questions + readiness score.

**Scope (build):**
- Resume upload + PDF text extraction → structured `ResumeData`.
- Job ingestion: scrape by URL, or accept pasted job text.
- LangGraph analysis pipeline: `ResumeAgent → JobAgent → SkillGapAgent → QuestionAgent`.
- Async run + poll (`/analysis/run` → `202 {taskId}`, `/tasks/{id}`).
- Persistence in Postgres; cache + task store via in-memory implementations.
- Frontend: Upload screen + Analysis screen (skill-gap cards, readiness gauge, question table).
- Deploy: Vercel (frontend), Render (backend), Neon (DB); Docker Compose for local.

**Scaffold (interface only, not wired):** Redis cache/task implementations, interview module, roadmap module, RAG `NoKnowledgeProvider`, feature flags.

**Exit criteria**
- Upload a real PDF resume + a real job URL → see skill gaps, readiness score, and ranked questions in the UI.
- Runs locally via `docker compose up` with **no Redis**.
- Deployed demo reachable on Vercel + Render + Neon, configured purely via env vars.
- Backend unit tests pass for: PDF parse, skill-gap scoring shape, JSON-retry wrapper.

**Detailed task breakdown:** see [PHASE_1_PLAN.md](PHASE_1_PLAN.md).

---

## Phase 2 — Mock interview module

**Goal:** stateful mock interview with per-answer evaluation.

**Deliverables**
- `InterviewAgent` (temperature ~0.7) + typed `InterviewMemory` (weak topics, repeated mistakes) — flag-gated by `ENABLE_MEMORY`.
- Endpoints: `/interview/start`, `/interview/respond`, `/interview/end`.
- Frontend: chat window, active question card, evaluation panel with score ring.

**Exit criteria**
- A full mock interview from start → summary with per-question scores and a final verdict.
- Memory adapts at least one follow-up question based on a weak topic.

---

## Phase 3 — Study roadmap

**Goal:** personalized study plan from analysis + interview results.

**Deliverables**
- `RoadmapAgent` (temperature ~0.5) → typed `StudyRoadmap` (weeks, priority skills, hours).
- Endpoint: `/roadmap/generate`.
- Frontend: weekly timeline, priority badges, readiness gauge.

**Exit criteria**
- Generate a multi-week roadmap whose priorities map to the detected critical skill gaps.

---

## Phase 4 — Observability, hardening & polish

**Goal:** make it production-credible and demo-proof.

**Deliverables**
- LLM observability: per-call model/tokens/cost/latency tracking + a simple analytics view.
- Event bus wiring (publish `AnalysisCompleted`, `InterviewCompleted`) once a real consumer exists.
- CI/CD: GitHub Actions (lint, type-check, tests, build).
- Optional Redis enabled in prod for cross-instance cache/task state.
- Optional: RAG and company-intelligence behind flags.

**Exit criteria**
- CI green on every PR.
- Cost/latency visible per pipeline run.

---

## Sequencing guidance for AI-assisted development

- Implement **one PHASE_1_PLAN task block at a time**; keep each change small so a coding agent's context stays cheap.
- Backend before frontend within Phase 1 — the API contract is the source of truth.
- Do not pull Phase 2+ work forward; if tempted, add a scaffold/interface instead and move on.
