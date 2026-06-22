# InterviewIQ — API Contracts

> All routes prefixed `/api/v1`. Every response is wrapped in a uniform envelope. Phase 1 endpoints are fully specified; Phase 2+ endpoints are listed at the end as a forward reference only.

---

## 1. Conventions

### Response envelope

Success:
```json
{ "success": true, "data": { } }
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Rules
- Content type `application/json` except resume upload (`multipart/form-data`).
- camelCase in JSON payloads on the wire; backend Pydantic uses snake_case internally with field aliases.
- All IDs are UUID strings.
- Long-running work uses **submit → poll** (`202 Accepted` + `taskId`).
- Validation errors → `422` with `code: "VALIDATION_ERROR"`.
- Rate limit exceeded → `429` with `code: "RATE_LIMITED"`.

### Error codes (Phase 1)

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 422 | Request failed schema validation |
| `RESUME_PARSE_FAILED` | 422 | PDF could not be read/extracted |
| `JOB_SCRAPE_FAILED` | 422 | URL could not be fetched/parsed |
| `NOT_FOUND` | 404 | Resource/task id unknown |
| `ANALYSIS_FAILED` | 500 | Pipeline error (also stored on task) |
| `AI_PROVIDER_ERROR` | 502 | Upstream model error after retries |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled error |

---

## 2. Phase 1 endpoints

### POST `/api/v1/upload/resume`  — sync

Upload and parse a resume PDF.

- Request: `multipart/form-data`, field `file` (PDF, ≤ `MAX_FILE_SIZE_MB`).
- Response `200`:
```json
{
  "success": true,
  "data": {
    "resumeId": "uuid",
    "parsedData": {
      "name": "Jane Doe",
      "skills": { "technical": ["Python", "FastAPI"], "soft": ["communication"] },
      "experience": [{ "title": "Intern", "company": "Acme", "years": 0.5 }],
      "education": [{ "degree": "B.Tech CSE", "institution": "XYZ" }],
      "projects": [{ "name": "InterviewIQ", "description": "..." }]
    }
  }
}
```
- Errors: `RESUME_PARSE_FAILED`, `VALIDATION_ERROR` (wrong type / too large).

---

### POST `/api/v1/scrape/job`  — sync

Ingest a job by URL or pasted text. Provide **either** `url` **or** `description`.

- Request:
```json
{ "url": "https://example.com/jobs/123" }
```
or
```json
{ "description": "We are hiring a Backend Engineer ...", "companyName": "Acme", "roleTitle": "Backend Engineer" }
```
- Response `200`:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "jobData": {
      "title": "Backend Engineer",
      "company": "Acme",
      "requiredSkills": ["Python", "PostgreSQL"],
      "niceToHaveSkills": ["Docker"],
      "seniorityLevel": "junior",
      "domain": "fintech"
    }
  }
}
```
- Errors: `JOB_SCRAPE_FAILED`, `VALIDATION_ERROR`.

---

### POST `/api/v1/analysis/run`  — async (submit)

Start the LangGraph analysis pipeline for a resume+job pair.

- Request:
```json
{ "resumeId": "uuid", "jobId": "uuid" }
```
- Response `202`:
```json
{ "success": true, "data": { "taskId": "uuid" } }
```
- Behavior: checks cache for an existing analysis of the same pair; if present, the task completes near-instantly with the cached result.
- Errors: `NOT_FOUND` (unknown resumeId/jobId), `VALIDATION_ERROR`.

---

### GET `/api/v1/tasks/{taskId}`  — poll

Poll background-task status. Frontend polls every ~2s until terminal.

- Response `200` (pending/running):
```json
{ "success": true, "data": { "taskId": "uuid", "status": "running", "result": null } }
```
- Response `200` (completed):
```json
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "status": "completed",
    "result": {
      "analysisId": "uuid",
      "readinessScore": 72,
      "skillGaps": [
        { "skill": "PostgreSQL", "status": "partial", "importance": "critical", "confidenceScore": 0.6 }
      ],
      "predictedQuestions": [
        { "id": "uuid", "text": "Explain DB indexing.", "type": "technical",
          "difficulty": "medium", "topic": "databases", "likelihoodScore": 0.81 }
      ],
      "summary": "Strong Python foundation; close gaps in SQL and system design."
    }
  }
}
```
- Response `200` (failed):
```json
{ "success": true, "data": { "taskId": "uuid", "status": "failed", "error": "ANALYSIS_FAILED: ..." } }
```
- Errors: `NOT_FOUND` (unknown taskId).
- `status` ∈ `pending | running | completed | failed`.

---

### GET `/api/v1/analysis/{analysisId}`  — sync

Fetch a previously computed analysis (e.g. on page refresh / shareable link).

- Response `200`: same `result` shape as the completed task above (minus the task wrapper), plus `resumeId`, `jobId`, `createdAt`.
- Errors: `NOT_FOUND`.

---

### GET `/api/v1/health`  — sync

Liveness/readiness for Render. Returns `{ "success": true, "data": { "status": "ok" } }`.

---

## 3. Endpoint summary (Phase 1)

| Method | Route | Sync/Async | Returns |
|--------|-------|-----------|---------|
| POST | `/upload/resume` | sync | `resumeId`, `parsedData` |
| POST | `/scrape/job` | sync | `jobId`, `jobData` |
| POST | `/analysis/run` | async | `taskId` (`202`) |
| GET | `/tasks/{taskId}` | poll | task status + result |
| GET | `/analysis/{analysisId}` | sync | stored analysis |
| GET | `/health` | sync | service status |

---

## 4. Forward reference — Phase 2+ (NOT implemented in MVP)

Listed only so the `/api/v1` namespace is reserved coherently. Do not build these in Phase 1.

| Method | Route | Phase | Returns |
|--------|-------|-------|---------|
| POST | `/interview/start` | 2 | `sessionId`, `firstQuestion` |
| POST | `/interview/respond` | 2 | `evaluation`, `nextQuestion?` |
| POST | `/interview/end` | 2 | `summary: SessionSummary` |
| POST | `/roadmap/generate` | 3 | `roadmap: StudyRoadmap` (async) |
