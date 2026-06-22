# InterviewIQ — Deployment Guide

> Simple, portfolio-grade deployment. Three managed services, all free-tier friendly:
> **Frontend → Vercel · Backend → Render · Database → Neon Postgres.**
> **Redis is optional and disabled by default** — the MVP runs without it.
>
> The app deploys **without code changes** — only environment variables differ between local and production.

---

## 0. Architecture at deploy time

```
   Browser
      │
      ▼
 Vercel (frontend)  ──HTTPS──►  Render (FastAPI backend)  ──►  Neon (Postgres)
   VITE_API_BASE_URL                ALLOWED_ORIGINS
   = Render URL                     = Vercel URL
```

- Frontend talks to the backend via `VITE_API_BASE_URL`.
- Backend allows the frontend origin via `ALLOWED_ORIGINS`.
- No Redis: cache and background-task state use in-memory implementations (acceptable for a single-instance demo).

---

## 1. Prerequisites

- A working local build (see `docs/SETUP_GUIDE.md`).
- Accounts: [Neon](https://neon.tech), [Render](https://render.com), [Vercel](https://vercel.com).
- An Anthropic API key.
- Code pushed to a Git host (GitHub/GitLab) — Render and Vercel deploy from a repo.

> Order matters: **Neon → Render → Vercel.** The backend needs the database URL; the frontend needs the backend URL.

---

## 2. Database — Neon Postgres

1. Create a Neon project and a database (e.g. `interviewiq`).
2. Copy the connection string from the Neon dashboard.
3. Convert it for the async driver used by the app:
   - Neon gives: `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`
   - Use: `postgresql+asyncpg://USER:PASSWORD@HOST/DB`
   - With asyncpg, pass SSL via query param: append `?ssl=require` (instead of `sslmode=require`).
   - Final form:
     ```
     postgresql+asyncpg://USER:PASSWORD@HOST/DB?ssl=require
     ```
4. Keep this value — it becomes `DATABASE_URL` on Render.

> Migrations are applied from Render after the service is created (Step 3.4). Neon's free tier is sufficient for a demo.

---

## 3. Backend — Render

### 3.1 Create the service
- New → **Web Service** → connect your repository.
- Root directory: `server`
- Runtime: **Python 3.11**
- Instance type: **Free**.

### 3.2 Build & start commands
- **Build command:**
  ```
  pip install -e .
  ```
- **Start command:**
  ```
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
  Render injects `$PORT`; the app must bind to it.

### 3.3 Environment variables (Render dashboard)

| Key | Value |
|-----|-------|
| `ENVIRONMENT` | `production` |
| `AI_PROVIDER` | `anthropic` |
| `AI_API_KEY` | your Anthropic key |
| `RESUME_AGENT_MODEL` | your model id |
| `JOB_AGENT_MODEL` | your model id |
| `SKILL_GAP_AGENT_MODEL` | your model id |
| `QUESTION_AGENT_MODEL` | your model id |
| `DATABASE_URL` | the Neon async URL from Step 2 |
| `ALLOWED_ORIGINS` | your Vercel URL (set after Step 4; can start with a placeholder) |
| `MAX_FILE_SIZE_MB` | `5` |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` |
| `RATE_LIMIT_MAX_REQUESTS` | `30` |
| `ENABLE_RAG` | `false` |
| `ENABLE_MEMORY` | `false` |
| `ENABLE_COMPANY_INTELLIGENCE` | `false` |

> **Do not set `REDIS_URL`.** Leaving it unset keeps the in-memory cache/task implementations active.

### 3.4 Run migrations

After the first successful deploy, apply the schema once using Render's **Shell** (or a one-off job):
```
alembic upgrade head
```
Re-run only when new migrations are added.

### 3.5 Verify
- Visit `https://<your-service>.onrender.com/api/v1/health` → should return the success envelope.

> Free-tier note: Render free services sleep when idle and cold-start on the next request (a few seconds). Fine for a portfolio demo.

---

## 4. Frontend — Vercel

### 4.1 Import the project
- New Project → import the same repository.
- **Root directory:** `client`
- Framework preset: **Vite**.

### 4.2 Build settings (usually auto-detected)
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

### 4.3 Environment variable

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://<your-service>.onrender.com/api/v1` |

> `VITE_` vars are baked in at build time — after changing it, **redeploy** the frontend.

### 4.4 Deploy
- Deploy and note the production URL, e.g. `https://interviewiq.vercel.app`.

---

## 5. Connect the two (CORS)

1. In Render, set `ALLOWED_ORIGINS` to the exact Vercel URL (e.g. `https://interviewiq.vercel.app`).
2. Redeploy/restart the backend so it picks up the change.
3. If you use a custom domain or Vercel preview URLs, add those origins too (comma-separated).

---

## 6. Post-deploy smoke test

1. Open the Vercel URL.
2. Upload a sample PDF resume.
3. Provide a job (URL or pasted text).
4. Click **Run Analysis** and wait for polling to complete.
5. Confirm the analysis screen shows readiness score, skill gaps, and ranked questions.

If it fails, check the table below.

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|--------|--------------|-----|
| CORS error in browser console | `ALLOWED_ORIGINS` missing the Vercel URL | set exact origin on Render, restart |
| Frontend calls `localhost` in prod | `VITE_API_BASE_URL` not set/baked | set it on Vercel and **redeploy** |
| DB connection / SSL error | wrong driver or missing SSL param | use `postgresql+asyncpg://...?ssl=require` |
| `relation does not exist` | migrations not run | run `alembic upgrade head` on Render |
| 401 from model | bad/missing `AI_API_KEY` | set a valid key on Render |
| First request very slow | Render free-tier cold start | expected; retry after wake |
| Analysis result "resets" after a while | in-memory task/cache on restart | expected without Redis; re-run analysis |

---

## 8. Optional: enabling Redis later (not required)

The MVP intentionally ships without Redis. If you later want cache/task state to survive restarts:

1. Provision a managed Redis (e.g. Render Key Value / Upstash).
2. Set `REDIS_URL` on Render.
3. The app's cache/task factories switch to the Redis implementations automatically — **no code change**.

This is out of scope for the Phase 1 demo and listed only for completeness.

---

## 9. Cost summary (portfolio defaults)

| Service | Tier | Notes |
|---------|------|-------|
| Vercel | Hobby (free) | Static frontend hosting |
| Render | Free web service | Sleeps when idle |
| Neon | Free | Postgres |
| Redis | — | Not used |
| Anthropic | Pay-as-you-go | Only real running cost (per analysis) |
