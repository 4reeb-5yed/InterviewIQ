# InterviewIQ — Database Schema

> PostgreSQL (Neon in prod, Postgres container locally). SQLAlchemy 2.0 async ORM + Alembic migrations. Schema kept deliberately small for the MVP: nested/derived results (skill gaps, questions) are stored as `JSONB` rather than over-normalized tables, because they are produced and consumed as a unit.

---

## 1. Design notes (MVP)

- **No user/auth tables in Phase 1.** The demo is session-less; rows are anonymous. A `users` table is a Phase 2+ concern.
- **JSONB for AI outputs.** `skill_gaps` and `predicted_questions` are model-generated lists validated by Pydantic before insert. Storing them as JSONB keeps the schema flat and the pipeline simple. They can be normalized later if querying individual gaps/questions becomes a requirement.
- **Task state is NOT in Postgres by default.** Background-task status lives in the in-memory `TaskStore` (or Redis if configured). A `tasks` table is optional and only listed below for the durable variant.
- **UUID primary keys** everywhere (`uuid4`), generated app-side.
- **Timestamps** (`created_at`, `updated_at`) on every table, UTC.

---

## 2. ERD

```
┌───────────────┐         ┌───────────────┐
│   resumes     │         │     jobs      │
├───────────────┤         ├───────────────┤
│ id (PK)       │         │ id (PK)       │
│ filename      │         │ source_url    │
│ raw_text      │         │ raw_text      │
│ parsed_data   │ JSONB   │ parsed_data   │ JSONB
│ created_at    │         │ created_at    │
│ updated_at    │         │ updated_at    │
└──────┬────────┘         └──────┬────────┘
       │                         │
       │  resume_id (FK)         │  job_id (FK)
       └────────────┬────────────┘
                    ▼
          ┌───────────────────────┐
          │       analyses        │
          ├───────────────────────┤
          │ id (PK)               │
          │ resume_id (FK)        │
          │ job_id (FK)           │
          │ readiness_score  int  │
          │ skill_gaps       JSONB│
          │ predicted_questions JSONB
          │ summary          text │
          │ status        varchar │  (pending|running|completed|failed)
          │ error            text │
          │ created_at            │
          │ updated_at            │
          └───────────────────────┘
```

---

## 3. Tables

### `resumes`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | `uuid4` app-side |
| `filename` | VARCHAR(255) | NOT NULL | original upload name |
| `raw_text` | TEXT | NOT NULL | extracted via `pdfplumber` |
| `parsed_data` | JSONB | NOT NULL | matches Pydantic `ResumeData` |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | on-update now() |

### `jobs`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `source_url` | VARCHAR(2048) | NULL | null when pasted text |
| `raw_text` | TEXT | NOT NULL | scraped or pasted description |
| `parsed_data` | JSONB | NOT NULL | matches Pydantic `JobData` |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | |

### `analyses`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `resume_id` | UUID | FK → resumes.id, NOT NULL | |
| `job_id` | UUID | FK → jobs.id, NOT NULL | |
| `readiness_score` | INTEGER | NULL | 0–100; null until completed |
| `skill_gaps` | JSONB | NULL | list of `SkillGap` |
| `predicted_questions` | JSONB | NULL | list of `InterviewQuestion` |
| `summary` | TEXT | NULL | human-readable summary |
| `status` | VARCHAR(16) | NOT NULL, default 'pending' | pending/running/completed/failed |
| `error` | TEXT | NULL | populated on failure |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | |

**Indexes**
- `analyses (resume_id, job_id)` — supports the cache-equivalent lookup of an existing analysis for the same pair.

### `tasks` — *optional / durable variant only*

Skip in the default MVP (in-memory `TaskStore`). Create only if you want background-task status to survive restarts without Redis.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `kind` | VARCHAR(32) | NOT NULL (e.g. 'analysis') |
| `status` | VARCHAR(16) | NOT NULL |
| `result_ref` | UUID | NULL (e.g. analysis_id) |
| `error` | TEXT | NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL |
| `updated_at` | TIMESTAMPTZ | NOT NULL |

---

## 4. JSONB payload shapes

These mirror the Pydantic domain models (see API_CONTRACTS.md for full field lists).

```jsonc
// resumes.parsed_data  → ResumeData
{
  "name": "string",
  "skills": { "technical": ["..."], "soft": ["..."] },
  "experience": [{ "title": "...", "company": "...", "years": 1.5 }],
  "education": [{ "degree": "...", "institution": "..." }],
  "projects": [{ "name": "...", "description": "..." }]
}

// jobs.parsed_data  → JobData
{
  "title": "string",
  "company": "string",
  "required_skills": ["..."],
  "nice_to_have_skills": ["..."],
  "seniority_level": "junior|mid|senior",
  "domain": "string"
}

// analyses.skill_gaps  → list[SkillGap]
[{ "skill": "...", "status": "matched|partial|missing",
   "importance": "critical|moderate|low", "confidence_score": 0.0 }]

// analyses.predicted_questions  → list[InterviewQuestion]
[{ "id": "uuid", "text": "...", "type": "technical|behavioral|system-design|trap",
   "difficulty": "easy|medium|hard", "topic": "...", "likelihood_score": 0.0 }]
```

---

## 5. Migrations (Alembic)

- One initial migration creates `resumes`, `jobs`, `analyses` (+ indexes).
- Async engine: use `postgresql+asyncpg://...`; Alembic env configured for async.
- `DATABASE_URL` comes from env; Neon requires `sslmode=require` (asyncpg: pass via connect args / `?ssl=require`).
- Naming convention: timestamped revision messages, e.g. `0001_initial_schema`.

**Phase 2+ migrations (not now):** `interview_sessions`, `answers`, `roadmaps`, and possibly `users`.
