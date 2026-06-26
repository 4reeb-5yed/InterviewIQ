# InterviewIQ — Deployment Guide

This documents the **actual production deployment**:

| Component | Host | Production URL |
|-----------|------|----------------|
| Frontend | **Vercel** | https://interview-iq-areeb-syed.vercel.app |
| Backend API | **Render** | https://interviewiq-02c1.onrender.com |
| Database | **Neon** (PostgreSQL) | (private connection string) |

The app deploys **without code changes** — only environment variables differ between local and
production. Deploy order matters: **Neon → Render → Vercel** (the backend needs the DB URL; the
frontend needs the backend URL).

---

## 0. Topology

```mermaid
flowchart LR
  B[Browser] --> V[Vercel<br/>static React build]
  V -->|VITE_API_BASE_URL| R[Render<br/>uvicorn app.main:app]
  R -->|DATABASE_URL asyncpg+ssl| N[(Neon PostgreSQL)]
  R --> AI{{AI provider}}
```

---

## 1. Database — Neon PostgreSQL

1. Create a Neon project + database (e.g. `interviewiq`).
2. Copy the connection string and adapt it to the **async** driver used by SQLAlchemy:
   - Neon gives: `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`
   - Use: `postgresql+asyncpg://USER:PASSWORD@HOST/DB?ssl=require`
     (note `+asyncpg` and `ssl=require`, not `sslmode=require`).
3. Keep this value — it becomes `DATABASE_URL` on Render.

---

## 2. Backend — Render (Web Service)

### Service settings
- **Root directory:** `server`
- **Runtime:** Python 3.11
- **Build command:** `pip install -e .`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Instance:** Free is fine (cold-starts after idle).

> Render does **not** use `docker/server.Dockerfile` for this setup — it builds from the repo with
> the build/start commands above. (The Dockerfile + Compose are for local use.)

### Environment variables (Render dashboard)

| Key | Value |
|-----|-------|
| `ENVIRONMENT` | `production` |
| `AI_PROVIDER` | `anthropic` (or `openai` / `gemini` / `bedrock` / `local`) |
| `AI_API_KEY` | your provider key |
| `RESUME_AGENT_MODEL` / `JOB_AGENT_MODEL` / `CAREER_AGENT_MODEL` / `SKILL_GAP_AGENT_MODEL` / `QUESTION_AGENT_MODEL` | model ids valid for the provider |
| `DATABASE_URL` | the Neon async URL from step 1 |
| `ALLOWED_ORIGINS` | `https://interview-iq-areeb-syed.vercel.app` |
| `MAX_FILE_SIZE_MB` | `5` |
| `RATE_LIMIT_WINDOW_SECONDS` / `RATE_LIMIT_MAX_REQUESTS` | `60` / `30` |
| `CACHE_ANALYSIS_TTL_SECONDS` | `86400` |
| `ENABLE_RAG` / `ENABLE_MEMORY` / `ENABLE_COMPANY_INTELLIGENCE` | `false` |

> Leave `REDIS_URL` **unset** to use the in-memory cache/task store (single-instance — see §6).
> The app validates AI credentials at startup and **fails fast** if `AI_API_KEY` is missing.

### ⚠️ Required one-time step: run migrations

> **Deployment issue we hit:** the start command runs only `uvicorn`, so it does **not** create the
> database schema. On the first deploy the API booted but every request that touched the DB failed
> with `relation "resumes"/"jobs"/"analyses" does not exist`.
>
> **Fix:** run the migrations once against Neon:
> ```bash
> alembic upgrade head
> ```
> Do this from the **Render Shell** (Service → Shell) after the first successful deploy, or as a
> **one-off job / pre-deploy command**. Re-run only when new migrations are added.
> (Locally this is automatic because `docker-compose` uses
> `sh -c "alembic upgrade head && uvicorn …"`.)

### Verify
- `https://interviewiq-02c1.onrender.com/api/v1/health` → `{ "success": true, "data": { "status": "ok" } }`
- `https://interviewiq-02c1.onrender.com/docs` → Swagger UI

---

## 3. Frontend — Vercel

### Project settings
- **Root directory:** `client`
- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

### Environment variable

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://interviewiq-02c1.onrender.com/api/v1` |

> `VITE_*` variables are baked in **at build time** — after changing it, **redeploy** the frontend.

---

## 4. CORS

The backend reads `ALLOWED_ORIGINS` (comma-separated) and enables CORS via `CORSMiddleware`
(`allow_credentials=True`, all methods/headers). It **must** include the exact Vercel origin:

```
ALLOWED_ORIGINS=https://interview-iq-areeb-syed.vercel.app
```

Add `http://localhost:5173` (and any Vercel preview domains) as extra comma-separated entries when
needed. Restart/redeploy the backend after changing it.

---

## 5. Post-deploy smoke test

1. Open the Vercel URL → **Analyze**.
2. Upload a PDF résumé (optionally add a job).
3. Click **Analyze résumé** and wait for the report (submit→poll; ~15–30s, plus possible Render cold-start).
4. Confirm the report renders, then try **Copy / Save as PDF / Share**.

---

## 6. Production notes & known limitations

- **In-memory cache/task store:** without `REDIS_URL`, the cache and background-task status live in
  process memory. Run the backend as a **single instance / single worker**, or set `REDIS_URL` to a
  managed Redis. Task state resets on restart (re-run the analysis).
- **Render cold starts:** the free tier sleeps when idle; the first request after idle takes a few seconds.
- **Schema is migration-managed:** never auto-created at runtime — always `alembic upgrade head`.
- **No code changes between environments** — only env vars (DB URL, origins, provider keys, model ids).

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `relation "…" does not exist` | migrations not run | `alembic upgrade head` on Render |
| Startup crash: missing AI credentials | `AI_API_KEY` unset for selected provider | set it (or use a keyless `local` endpoint) |
| CORS error in browser | Vercel origin not allowed | add it to `ALLOWED_ORIGINS`, redeploy backend |
| Frontend calls `localhost` in prod | `VITE_API_BASE_URL` not set/baked | set on Vercel and **redeploy** |
| DB/SSL connection error | wrong driver/SSL param | use `postgresql+asyncpg://…?ssl=require` |
| Analysis result “disappears” after restart | in-memory task store | expected without Redis; re-run |
| First request very slow | Render cold start | expected on free tier |

---

## 8. Optional: enable Redis (multi-instance)

Provision managed Redis (Render Key Value / Upstash), set `REDIS_URL` on Render, and the cache/task
factories switch to the Redis implementations automatically — **no code change**. Out of scope for
the current single-instance demo.
