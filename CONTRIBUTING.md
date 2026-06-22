# Contributing to InterviewIQ

> InterviewIQ is a portfolio project built largely with AI-assisted development. These guidelines keep the codebase small, typed, and easy for both humans and coding agents to work in. Keep changes focused — one logical change per PR.

---

## Before you start

1. Read `docs/AGENT_HANDOFF.md` (the operating contract) and `docs/ARCHITECTURE.md` (layering + the Build/Scaffold/Defer matrix).
2. Set up locally with `docs/SETUP_GUIDE.md`.
3. Pick work from `docs/TASKS.md`, following the order in `docs/PHASE1_CHECKLIST.md`.

---

## Scope rules

- **Stay within the current phase.** Phase 1 = Resume Upload, Job Input/Scraping, Skill Gap Analysis, Question Prediction. Nothing else.
- **Scaffolded items stay no-ops** (Redis, RAG, memory, interview, roadmap). Don't wire them into the MVP path.
- **Deferred items don't get files** (event bus, company intelligence, analytics, advanced observability, auth).
- If a change feels like it's growing the architecture, stop and re-check ARCHITECTURE §2.

---

## Architecture constraints (must follow)

- Layering: **Router → Controller → Service → Repository → DB**. No business logic in routers, controllers, or React components.
- AI access only through the `AIProvider` interface; never import a model SDK outside `core/ai/providers/`.
- Database access only through repositories; services never import a DB session directly.
- Dependency injection via FastAPI `Depends`.
- Typed everywhere: Pydantic v2 (backend), TypeScript interfaces (frontend). **No `any`, no untyped `dict`.**
- All config from environment variables — no hardcoded keys, URLs, models, or limits.
- Logging via `structlog`, never `print()`.

---

## Development workflow

1. Branch from `main` using a descriptive name (see `docs/REPOSITORY_BOOTSTRAP.md`):
   - `feat/...`, `fix/...`, `chore/...`, `docs/...`, `test/...`, `refactor/...`
2. Implement one task; satisfy its acceptance criteria in `docs/TASKS.md`.
3. Run the local checks below.
4. Open a PR with a small, reviewable diff.

### Local checks before pushing

**Backend (`server/`)**
```bash
ruff check .          # lint
black --check .       # format
mypy app              # types
pytest                # tests
```

**Frontend (`client/`)**
```bash
npm run lint
npm run typecheck     # tsc --noEmit
npm run build
```

All must pass before opening a PR.

---

## Commit messages (Conventional Commits)

```
<type>: <short summary>
```

| Type | Use for |
|------|---------|
| `feat` | new capability |
| `fix` | bug fix |
| `chore` | tooling / infra / config |
| `docs` | documentation only |
| `test` | tests only |
| `refactor` | no behavior change |

Keep one logical change per commit. Example: `feat: add resume upload endpoint`.

---

## Pull requests

A good PR:
- Targets a single task or stage.
- Has a clear title and a short description of what and why.
- Notes the related task ID(s) from `docs/TASKS.md`.
- Passes all local checks (and CI once it's active in Phase 4).
- Adds/updates tests when it changes behavior.
- Updates docs if it changes setup, contracts, or commands.

Prefer **squash-merge** to keep `main` history linear.

---

## Code style quick reference

| Area | Convention |
|------|------------|
| Python formatting | `black` + `ruff` |
| Python imports | sorted (ruff/isort rules) |
| Python types | full annotations; Pydantic models for data |
| File size | small, single-responsibility modules |
| Frontend formatting | Prettier |
| Frontend types | explicit interfaces in `types/`; no `any` |
| Naming | snake_case (Python), camelCase (TS), PascalCase (components/classes) |
| Secrets | never commit; only `.env.example` is tracked |

---

## Working with AI coding agents

This repo is designed for AI-assisted development. To keep it effective:
- Hand the agent **one task at a time** with its acceptance criteria.
- Point it at the relevant docs rather than pasting large context.
- Keep modules small so future edits stay cheap.
- Reject changes that expand scope or violate the architecture constraints above.

---

## Reporting issues

When filing an issue, include:
- What you expected vs. what happened.
- Steps to reproduce (and the endpoint/screen involved).
- Environment (local or deployed) and relevant logs.
- The task ID from `docs/TASKS.md` if related to in-progress work.
