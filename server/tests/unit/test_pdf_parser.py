"""Unit tests for the PDF text extractor."""

from __future__ import annotations

import pytest

from app.utils.pdf_parser import ResumeParseError, extract_text_from_pdf


def test_invalid_bytes_raise():
    with pytest.raises(ResumeParseError):
        extract_text_from_pdf(b"this is definitely not a pdf")


def test_empty_bytes_raise():
    with pytest.raises(ResumeParseError):
        extract_text_from_pdf(b"")
