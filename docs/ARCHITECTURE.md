# InterviewIQ — Architecture

> Final, pragmatic architecture for the MVP. The north star: **ship a working, deployable app**. Patterns that don't pay for themselves in Phase 1 are scaffolded (interface only) or deferred (documented, not built).

---

## 1. Guiding principles

1. **MVP-first.** A deployed demo of Resume → Analysis → Questions beats 20 more pages of design.
2. **Minimal complexity.** Use a pattern only where it removes real pain in Phase 1.
3. **AI-assisted-development friendly.** Small modules, clear boundaries, one responsibility per file → cheap for a coding agent to read and modify.
4. **Provider-agnostic AI.** Business logic calls an interface, never a vendor SDK directly.
5. **Deploy without code changes.** Only environment variables change between local, Render, and Vercel.
6. **Typed contracts everywhere.** Pydantic on the backend, TypeScript interfaces on the frontend. No `any`, no untyped dicts.

---

## 2. Build / Scaffold / Defer matrix

This is the single most important table in the spec. It keeps the MVP honest.

| Capability | Phase 1 status | Notes |
|------------|----------------|-------|
| AI provider abstraction (`AIProvider` + factory) | **Build** | Anthropic provider only; others stubbed |
| LangGraph analysis pipeline | **Build** | Resume → Job → SkillGap → Question |
| Resume upload + PDF parse | **Build** | `pdfplumber` |
| Job scraping (URL) + pasted-text fallback | **Build** | `httpx` + `BeautifulSoup4` |
| Question prediction | **Build** | Typed, ranked output |
| Repository pattern | **Build (light)** | One repo per aggregate; thin |
| Dependency injection via FastAPI `Depends` | **Build** | No service self-instantiates deps |
| Cache abstraction (`CacheStore`) | **Build** | In-memory impl is default |
| Redis cache implementation | **Scaffold** | Class exists, only used if `REDIS_URL` set |
| Background task (submit → poll) | **Build (light)** | FastAPI `BackgroundTasks` + in-memory `TaskStore` |
| Feature flags | **Build (light)** | Simple typed settings flags |
| Interview module + memory layer | **Scaffold** | Interfaces + no-op; Phase 2 |
| Study roadmap | **Scaffold** | Interface; Phase 3 |
| RAG / knowledge provider | **Scaffold** | `NoKnowledgeProvider` returns `[]` |
| Company intelligence agent | **Defer** | Documented only |
| Event bus / domain events | **Defer** | Documented only; no wiring in Phase 1 |
| Analytics dashboard | **Defer** | Phase 4 |
| Advanced LLM observability (cost/latency dashboards) | **Defer** | Phase 1 logs basic token counts via structlog only |

**Rule of thumb:** *Build* = real implementation + tests. *Scaffold* = interface/class present, returns a safe default, not wired into the critical path. *Defer* = mentioned in docs, no file created.

---

## 3. System overview

```
                         ┌─────────────────────────────┐
                         │      Frontend (Vercel)       │
                         │  React + TS + TanStack Query │
                         │  Upload screen │ Analysis    │
                         └──────────────┬──────────────┘
                                        │ HTTPS  /api/v1
                                        ▼
                         ┌─────────────────────────────┐
                         │      Backend (Render)        │
                         │         FastAPI app          │
                         │                              │
                         │  Routers → Controllers →     │
                         │  Services → Repositories     │
                         │      │            │          │
                         │      ▼            ▼          │
                         │  LangGraph     SQLAlchemy    │
                         │  pipeline       (async)      │
                         │      │            │          │
                         │      ▼            ▼          │
                         │  AIProvider   PostgreSQL ────┼──► Neon
                         │  (Anthropic)                 │
                         │                              │
                         │  CacheStore (in-memory │     │
                         │  Redis if REDIS_URL set)     │
                         └─────────────────────────────┘
```

---

## 4. Request flow (analysis pipeline)

```
POST /api/v1/analysis/run  { resumeId, jobId }
        │
        ▼
AnalysisController  ── orchestrates only, no logic
        │
        ▼
AnalysisService
   ├─ cache.get("analysis:{resumeId}:{jobId}")  ── hit → return
   ├─ load resume + job via repositories
   ├─ run LangGraph: ResumeAgent → JobAgent → SkillGapAgent → QuestionAgent
   ├─ persist Analysis row
   └─ cache.set(...)
        │
   (runs in BackgroundTask; client polls GET /tasks/{taskId})
```

Because the full pipeline can take 15–30s, `/analysis/run` returns `202 { taskId }` immediately and the work runs in a FastAPI `BackgroundTask`. The frontend polls `GET /api/v1/tasks/{taskId}` (TanStack Query `refetchInterval`) until terminal state.

---

## 5. Provider-agnostic AI layer

All agents depend on the `AIProvider` interface; the concrete class is resolved once at startup from config.

```python
# core/ai/base.py
@dataclass
class AIRequest:
    system_prompt: str
    user_message: str
    temperature: float = 0.3
    max_tokens: int = 2000

@dataclass
class AIMessage:
    content: str
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: float

class AIProvider(ABC):
    @abstractmethod
    async def generate(self, request: AIRequest) -> AIMessage: ...
```

```python
# core/ai/factory.py
class AIProviderFactory:
    @staticmethod
    def create(provider: str, api_key: str) -> AIProvider:
        match provider:
            case "anthropic": return AnthropicProvider(api_key)   # Phase 1
            case "openai":    return OpenAIProvider(api_key)       # scaffold
            case "gemini":    return GeminiProvider(api_key)       # scaffold
            case _: raise ValueError(f"Unknown provider: {provider}")
```

Switching providers = change `AI_PROVIDER` env var. Per-agent model names also come from env (e.g. `SKILL_GAP_AGENT_MODEL`), so no model string is hardcoded in business logic.

**Prompt contract** (every prompt module): clear persona, JSON-only output, schema inline, parsed with a retry wrapper (up to 3 attempts on invalid JSON). Temperatures: structured tasks `0.2–0.4`, roadmap `0.5`, conversational interview `0.7`.

---

## 6. LangGraph analysis pipeline

Typed state flows through nodes. Each agent is a thin class with a single `run(state) -> state` method.

```python
# agents/state.py
class AgentState(TypedDict):
    resume_text: str
    job_description: str
    resume_data: ResumeData | None
    job_data: JobData | None
    skill_gaps: list[SkillGap] | None
    readiness_score: int | None
    predicted_questions: list[InterviewQuestion] | None
    errors: list[str]
```

```python
# agents/graph.py  (Phase 1 — linear)
graph.set_entry_point("resume_agent")
graph.add_edge("resume_agent",    "job_agent")
graph.add_edge("job_agent",       "skill_gap_agent")
graph.add_edge("skill_gap_agent", "question_agent")
graph.add_edge("question_agent",  END)
```

Phase 2+ can add conditional edges (e.g. company-intelligence routing) without touching existing nodes.

---

## 7. Cache abstraction (Redis optional)

The MVP must run with **zero external services beyond Postgres**. Caching is therefore an interface with an in-memory default.

```python
# core/cache/base.py
class CacheStore(ABC):
    @abstractmethod
    async def get(self, key: str) -> dict | None: ...
    @abstractmethod
    async def set(self, key: str, value: dict, ttl_seconds: int) -> None: ...
    @abstractmethod
    async def invalidate(self, key: str) -> None: ...
```

- `InMemoryCacheStore` — dict + per-key expiry. **Default.** No dependencies.
- `RedisCacheStore` — used **only** when `REDIS_URL` is set.

A factory picks the implementation at startup:

```python
def build_cache(settings) -> CacheStore:
    return RedisCacheStore(settings.redis_url) if settings.redis_url else InMemoryCacheStore()
```

The same pattern backs `TaskStore` (background-task status): in-memory by default, Redis-backed when configured. This means the background-task polling flow works on a single Render instance with no Redis at all. (Caveat documented in DEPLOYMENT: in-memory state is per-process and resets on restart — acceptable for a demo MVP.)

---

## 8. Layering & dependency injection

```
Router  →  Controller  →  Service  →  Repository  →  DB
                │
                └─► AIProvider / CacheStore / FeatureFlags  (injected)
```

- **Router**: defines the HTTP route and wires dependencies via `Depends()`.
- **Controller**: orchestrates a use case; no business rules, no DB, no AI calls inline.
- **Service**: business logic; receives all collaborators via constructor injection.
- **Repository**: only place that touches SQLAlchemy. One per aggregate (Resume, Job, Analysis).

No service instantiates its own dependencies; no service imports a SQLAlchemy session directly.

---

## 9. Feature flags

Simple, typed, env-driven. No string comparisons scattered in code.

```python
class Settings(BaseSettings):
    enable_rag: bool = False
    enable_memory: bool = False            # Phase 2
    enable_company_intelligence: bool = False  # deferred
```

Services read flags through a small `FeatureFlags` wrapper so behavior is trivially mockable in tests.

---

## 10. Deferred designs (documented, not built in Phase 1)

These are intentionally **not** implemented now. They are recorded so future phases can add them without redesign:

- **Event bus / domain events** (`ResumeUploaded`, `AnalysisCompleted`, …) — add an in-process bus and publish from services when a second consumer actually exists.
- **Interview memory layer** — typed `InterviewMemory` (weak topics, repeated mistakes) separate from chat history; Phase 2.
- **RAG / vector knowledge** — swap `NoKnowledgeProvider` for a vector-backed implementation; flag-gated.
- **Company intelligence agent** — conditional LangGraph node enriching job analysis; flag-gated, deferred.
- **Advanced observability** — token/cost/latency dashboard or LangSmith integration; Phase 1 only logs token counts via structlog.

---

## 11. Cross-cutting concerns (Phase 1)

| Concern | Approach |
|---------|----------|
| Config | Pydantic `Settings` reads `.env`; no hardcoded values |
| Logging | `structlog`; never `print()` |
| Errors | Global exception handler → uniform `ApiError` envelope |
| CORS | Origins from `ALLOWED_ORIGINS` env |
| Rate limiting | `slowapi`, applied to AI routes (e.g. 30 req/min/IP) |
| Validation | Pydantic v2 schemas per route |
| Responses | All wrapped in `ApiResponse<T>` or `ApiError` |
