# InterviewIQ — Backend

FastAPI + LangGraph backend. See `../docs/` for architecture, API contracts, and the Phase 1 plan.

## Requirements
- Python 3.11
- PostgreSQL (local container via `../docker/docker-compose.yml`, or Neon)
- An Anthropic API key (`AI_API_KEY`) for live analysis

## Setup
```bash
python3.11 -m venv .venv && . .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env        # then edit AI_API_KEY
```

## Database
```bash
alembic upgrade head        # create tables (needs a reachable DATABASE_URL)
```

## Run
```bash
uvicorn app.main:app --reload --port 8000
# Docs:   http://localhost:8000/docs
# Health: http://localhost:8000/api/v1/health
```

## Quality
```bash
ruff check .
mypy app
pytest
```

## Layout
- `app/config` — settings (env contract)
- `app/core` — AI provider abstraction, cache, task store, flags, RAG/memory scaffolds
- `app/agents` — LangGraph nodes + graph (resume, job, skill_gap, question)
- `app/features/{resume,scraper,analysis}` — router → controller → service → repository
- `app/db` — engine, models, session dependency; `migrations/` — Alembic
- `app/middleware` — central error handler + rate limiting

Redis is optional: leave `REDIS_URL` unset to use the in-memory cache/task store.
