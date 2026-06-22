"""FastAPI application factory.

Wires configuration, logging, CORS, rate limiting, centralized exception
handling, the health route, and feature routers.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware

from app.config.settings import get_settings
from app.features.analysis.router import router as analysis_router
from app.features.resume.router import router as resume_router
from app.features.scraper.router import router as scraper_router
from app.middleware.error_handler import register_exception_handlers
from app.middleware.rate_limit import build_limiter
from app.schemas.api import ApiResponse
from app.utils.logger import configure_logging, get_logger
from app.utils.response import ok

API_PREFIX = "/api/v1"


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = get_settings()
    configure_logging(settings.environment)
    log = get_logger("app")

    app = FastAPI(title="InterviewIQ API", version="0.1.0", docs_url="/docs")
    app.state.settings = settings
    app.state.limiter = build_limiter(settings)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(SlowAPIMiddleware)

    register_exception_handlers(app)

    @app.get(f"{API_PREFIX}/health", response_model=ApiResponse[dict])
    async def health() -> ApiResponse[dict]:
        return ok({"status": "ok"})

    app.include_router(resume_router)
    app.include_router(scraper_router)
    app.include_router(analysis_router)

    log.info("app_initialized", environment=settings.environment)
    return app


app = create_app()
