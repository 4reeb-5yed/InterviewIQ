# InterviewIQ — Local Development Setup Guide

> Exact steps to run InterviewIQ locally. The MVP needs only **Postgres + the backend + the frontend**. **Redis is not required.**

---

## 1. Required versions & tools

| Tool | Version | Why |
|------|---------|-----|
| Python | **3.11.x** | Backend runtime (match `pyproject.toml`) |
| Node.js | **20.x LTS** (18+ ok) | Frontend build/dev |
| npm | 10+ (bundled with Node 20) | Frontend package manager |
| Docker | 24+ | Local Postgres + backend container |
| Docker Compose | v2 (`docker compose`) | Orchestrates local services |
| Git | 2.40+ | Version control |
| PostgreSQL | 15+ | Provided via Docker locally; Neon in prod |

**Optional (developer quality of life):**
- `uv` — fast Python dependency management (alternative to pip/venv).
- `make` — if you add a `Makefile` later.

**API keys:** an AI provider key (`AI_API_KEY`). The default provider is **Anthropic**; you can use OpenAI, Gemini, AWS Bedrock, or a **local/OpenAI-compatible** model instead — see [AI_PROVIDERS.md](AI_PROVIDERS.md). The backend **validates the selected provider's credentials at startup and refuses to boot without them** (tests use a fake provider, so `pytest` runs without a key).

---

## 2. Recommended VS Code extensions

| Extension | Purpose |
|-----------|---------|
| Python (ms-python.python) | Python language support |
| Pylance (ms-python.vscode-pylance) | Type checking / IntelliSense |
| Ruff (charliermarsh.ruff) | Lint + format (Python) |
| Mypy Type Checker (ms-python.mypy-type-checker) | Static typing |
| Docker (ms-azuretools.vscode-docker) | Manage containers |
| ESLint (dbaeumer.vscode-eslint) | Frontend linting |
| Prettier (esbenp.prettier-vscode) | Frontend formatting |
| Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss) | Tailwind autocomplete |
| Even Better TOML (tamasfe.even-better-toml) | `pyproject.toml` editing |
| DotENV (mikestead.dotenv) | `.env` syntax highlighting |

> If you use Roo / a coding agent inside VS Code, the above give it accurate diagnostics to work against.

---

## 3. Docker requirements

The local stack uses `docker/docker-compose.yml`:

- **`postgres`** service — Postgres 15, exposed on `5432`, with a named volume for persistence.
- **`server`** service — the FastAPI backend (built from `docker/server.Dockerfile`), depends on `postgres`.
- **`redis`** service — defined behind an **opt-in profile** (`--profile redis`) and **off by default**. Do not enable it for the MVP.

The frontend is **not** containerized for local dev — run it with Vite (`npm run dev`) for fast HMR. (A `client.Dockerfile` stub exists but Vercel handles prod frontend builds.)

---

## 4. Environment variables

### Backend — `server/.env` (copy from `server/.env.example`)

```
# Server
PORT=8000
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173

# AI provider (provider-agnostic) — production uses Gemini; default per-agent
# models below are gemini-3.1-flash-lite. Other providers (anthropic | openai |
# bedrock | local) — see docs/AI_PROVIDERS.md. Set AI_PROVIDER + AI_API_KEY to match.
AI_PROVIDER=gemini
AI_API_KEY=your-provider-key

# Per-agent models (must match the selected provider)
RESUME_AGENT_MODEL=gemini-3.1-flash-lite
JOB_AGENT_MODEL=gemini-3.1-flash-lite
CAREER_AGENT_MODEL=gemini-3.1-flash-lite
SKILL_GAP_AGENT_MODEL=gemini-3.1-flash-lite
QUESTION_AGENT_MODEL=gemini-3.1-flash-lite

# Database (local docker Postgres)
DATABASE_URL=postgresql+asyncpg://interviewiq:interviewiq@localhost:5432/interviewiq

# Uploads
MAX_FILE_SIZE_MB=5

# Rate limiting
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=30

# Analysis cache TTL (seconds)
CACHE_ANALYSIS_TTL_SECONDS=86400

# OPTIONAL — leave unset for MVP (enables in-memory cache/tasks)
# REDIS_URL=redis://localhost:6379/0

# Feature flags (deferred features; all off)
ENABLE_RAG=false
ENABLE_MEMORY=false
ENABLE_COMPANY_INTELLIGENCE=false
```

> Use the exact current model identifier your Anthropic account supports; the value above is illustrative. The point is it's an env var, not a hardcoded string.

### Frontend — `client/.env` (copy from `client/.env.example`)

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Never commit real keys.** Only `.env.example` is committed; `.env` is gitignored.

---

## 5. First-time setup

### Option A — scripted (recommended)
```bash
git clone https://github.com/4reeb-5yed/InterviewIQ.git
cd InterviewIQ
./scripts/setup.sh        # copies .env files, installs backend + frontend deps, prints next steps
```
> `setup.sh` does **not** start services or run migrations — it prepares the workspace. Apply
> migrations with `alembic upgrade head` (or use Docker Compose, which runs them automatically).

### Option B — manual

**Backend**
```bash
cd server
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"                              # or: uv sync
cp .env.example .env                                 # then edit AI_API_KEY
```

**Database (Docker)**
```bash
# from repo root
docker compose -f docker/docker-compose.yml up -d postgres
cd server && alembic upgrade head
```

**Frontend**
```bash
cd client
npm install
cp .env.example .env
```

---

## 6. Running the project locally

Open two terminals (plus Postgres running in Docker):

**Terminal 1 — backend**
```bash
cd server
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
# Health:   http://localhost:8000/api/v1/health
```

**Terminal 2 — frontend**
```bash
cd client
npm run dev
# App: http://localhost:5173
```

**Or run Postgres + backend together via Compose** (no Redis):
```bash
docker compose -f docker/docker-compose.yml up        # postgres + server
# run the frontend separately with: cd client && npm run dev
```

---

## 7. Verifying the setup

1. `GET http://localhost:8000/api/v1/health` → `{ "success": true, "data": { "status": "ok" } }`.
2. Open `http://localhost:5173` → **Analyze**, upload a PDF résumé (a job is **optional**), and click **Analyze résumé**.
3. The report screen shows a skeleton + progressive status while polling, then renders the Career
   Intelligence report (recruiter verdict, ATS analysis, market positioning, etc.). If you added a
   job, a Job Match section (skill gaps + predicted questions) appears too.

---

## 8. Common commands

| Task | Command (from `server/`) |
|------|--------------------------|
| Run backend | `uvicorn app.main:app --reload` |
| New migration | `alembic revision --autogenerate -m "msg"` |
| Apply migrations | `alembic upgrade head` |
| Tests | `pytest` |
| Lint | `ruff check .` |
| Format | `black . && ruff check --fix .` |
| Type-check | `mypy app` |

| Task | Command (from `client/`) |
|------|--------------------------|
| Run frontend | `npm run dev` |
| Type-check | `npm run typecheck` (tsc --noEmit) |
| Lint | `npm run lint` |
| Build | `npm run build` |

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|--------|--------------|-----|
| `connection refused` on startup | Postgres not up | `docker compose ... up -d postgres` |
| `password authentication failed` | `DATABASE_URL` mismatch | match compose credentials |
| 401 from model | bad/missing `AI_API_KEY` | set a valid key in `server/.env` |
| CORS error in browser | origin not allowed | add `http://localhost:5173` to `ALLOWED_ORIGINS` |
| Migrations do nothing | wrong driver in URL | use `postgresql+asyncpg://...` |
| Frontend can't reach API | wrong base URL | set `VITE_API_BASE_URL` to `http://localhost:8000/api/v1` |
