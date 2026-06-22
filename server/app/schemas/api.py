"""Uniform API response envelopes.

Every endpoint returns either an :class:`ApiResponse` (success) or an
:class:`ApiError` (failure), matching docs/API_CONTRACTS.md section 1.
"""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Successful response wrapper: ``{"success": true, "data": <T>}``."""

    success: bool = True
    data: T


class ErrorBody(BaseModel):
    """Machine-readable error detail."""

    code: str
    message: str
    details: dict | None = None


class ApiError(BaseModel):
    """Failure response wrapper: ``{"success": false, "error": {...}}``."""

    success: bool = False
    error: ErrorBody
