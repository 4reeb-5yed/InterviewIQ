"""Builders for the uniform API response envelopes."""

from __future__ import annotations

from typing import TypeVar

from fastapi.responses import JSONResponse

from app.schemas.api import ApiError, ApiResponse, ErrorBody

T = TypeVar("T")


def ok(data: T) -> ApiResponse[T]:
    """Build a success envelope for the given payload."""
    return ApiResponse(data=data)


def error_response(
    code: str,
    message: str,
    *,
    status_code: int,
    details: dict | None = None,
) -> JSONResponse:
    """Build a JSONResponse carrying the uniform :class:`ApiError` envelope."""
    payload = ApiError(error=ErrorBody(code=code, message=message, details=details))
    return JSONResponse(status_code=status_code, content=payload.model_dump())
