# Contributing to InterviewIQ

> InterviewIQ is a portfolio-quality project. These guidelines keep the codebase small, typed, and
> consistent. Keep changes focused — one logical change per PR.

---

## Before you start

1. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (layering + the current pipeline) and
   [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) (where things live).
2. Set up locally with [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md).
3. For backend work, skim [server/README.md](server/README.md); for frontend, [client/README.md](client/README.md).

> The original phased build plan (`docs/PHASE_1_PLAN.md`, `TASKS.md`, `PHASE1_CHECKLIST.md`,
> `AGENT_HANDOFF.md`) is kept for **history**; it describes how the MVP was bootstrapped, not the
> current feature set. Treat the **source code** as the source of truth.

---

## Architecture constraints (must follow)

- Layering: **Router → Controller → Service → Repository → DB**. No business logic in routers,
  controllers, or React components.
- AI access only through the `AIProvider` interface; never import a model SDK outside
  `core/ai/providers/`. Provider is chosen by config (`AIProviderFactory.create(settings)`).
- Database access only through repositories; services don't import a DB session directly.
- Dependency injection via FastAPI `Depends`.
- Typed everywhere: Pydantic v2 (backend), TypeScript interfaces (frontend). **No `any`, no untyped `dict`.**
  Frontend types must mirror backend contracts.
- All config from environment variables — no hardcoded keys, URLs, models, or limits.
- Logging via `structlog`, never `print()`.
- Analysis output must stay **evidence-based**: every score carries reasoning + evidence + confidence;
  prefer `insufficient_data` over guessing; never fabricate metrics.

---

## Scope notes

- **Deferred features are scaffolded as no-ops** (Redis cache/task store, RAG, interview memory) or
  feature-flagged (`ENABLE_RAG`, `ENABLE_MEMORY`, `ENABLE_COMPANY_INTELLIGENCE`). Don't wire them
  into the live path unless you're implementing that feature deliberately.
- If a change deserializes existing data differently (e.g. the `CareerReport` JSON shape), note it
  in the PR — old analyses may not load.

---

## Development workflow

1. Branch with a descriptive name: `feat/...`, `fix/...`, `chore/...`, `docs/...`, `test/...`, `refactor/...`.
2. Make the change; keep the diff small and reviewable.
3. Run the local checks below.
4. **Update docs in the same PR** when you change setup, env vars, contracts, routes, or the report schema.
5. Open a PR.

### Local checks before pushing

**Backend (`server/`)**
```bash
ruff check .          # lint
black --check .       # format
mypy app              # types (strict)
pytest                # tests
```

**Frontend (`client/`)**
```bash
npm run lint
npm run typecheck     # tsc --noEmit
npm run build
```

CI (`.github/workflows/ci.yml`) runs the same checks on push to `main` and on PRs.

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

Keep one logical change per commit. Prefer **squash-merge** to keep history linear.

---

## Code style quick reference

| Area | Convention |
|------|------------|
| Python formatting | `black` + `ruff` (line length 100) |
| Python types | full annotations; Pydantic models for data; `mypy --strict` |
| Frontend formatting | Prettier / ESLint |
| Frontend types | explicit interfaces in `types/`; no `any` |
| Naming | snake_case (Python), camelCase (TS), PascalCase (components/classes) |
| Modules | small, single-responsibility |
| Secrets | never commit; only `.env.example` is tracked |

---

## Reporting issues

Include: expected vs. actual behavior, steps to reproduce (and the endpoint/screen involved),
environment (local or deployed), and relevant logs.
