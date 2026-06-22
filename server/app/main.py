"""FastAPI application factory.

Wires configuration, logging, CORS, rate limiting, a global error handler, and
the health route. Feature routers (resume, scraper, analysis) are mounted in
later Phase 1 tasks. See docs/PHASE_1_PLAN.md (Block 0 / 0.4).

Note: Block 0 registers CORS / rate-limit / error handling inline here so the
app boots and /health works. The dedicated middleware/ modules
(error_handler, cors, rate_limit) and their richer behavior belong to the
hardening tasks T36/T37 and are intentionally not created yet.
"""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config.settings import Settings, get_settings
from app.schemas.api import ApiResponse
from app.utils.logger import configure_logging, get_logger
from app.utils.response import error_response, ok

API_PREFIX = "/api/v1"


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings: Settings = get_settings()
    configure_logging(settings.environment)
    log = get_logger("app")

    app = FastAPI(title="InterviewIQ API", version="0.1.0", docs_url="/docs")

    # Rate limiter (registered now; applied to AI routes in T37).
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.state.settings = settings

    # CORS from configured origins.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Exception handlers (uniform ApiError envelope) ----------------------
    @app.exception_handler(RateLimitExceeded)
    async def _rate_limited(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        return error_response("RATE_LIMITED", "Too many requests", status_code=429)

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        log.error("unhandled_error", path=request.url.path, error=str(exc))
        return error_response(
            "INTERNAL_ERROR", "An unexpected error occurred", status_code=500
        )

    # --- Health --------------------------------------------------------------
    @app.get(f"{API_PREFIX}/health", response_model=ApiResponse[dict])
    async def health() -> ApiResponse[dict]:
        return ok({"status": "ok"})

    log.info("app_initialized", environment=settings.environment)
    return app


app = create_app()
