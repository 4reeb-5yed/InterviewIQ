"""Shared domain exceptions mapped to API error codes by the error handler."""

from __future__ import annotations


class AppError(Exception):
    """Base class for application domain errors."""


class InputValidationError(AppError):
    """Request failed application-level validation -> VALIDATION_ERROR (422)."""


class ResourceNotFoundError(AppError):
    """A referenced resource/task id does not exist -> NOT_FOUND (404)."""
