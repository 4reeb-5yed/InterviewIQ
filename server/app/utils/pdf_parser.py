"""PDF text extraction (pdfplumber wrapper)."""

from __future__ import annotations

import io

import pdfplumber


class ResumeParseError(Exception):
    """Raised when a PDF cannot be read or contains no extractable text."""


def extract_text_from_pdf(data: bytes) -> str:
    """Extract plain text from PDF bytes.

    Raises:
        ResumeParseError: if the file cannot be opened or yields no text.
    """
    try:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as exc:  # pdfplumber raises a variety of errors
        raise ResumeParseError(f"Could not read PDF: {exc}") from exc

    text = text.strip()
    if not text:
        raise ResumeParseError("No extractable text found in the PDF.")
    return text
