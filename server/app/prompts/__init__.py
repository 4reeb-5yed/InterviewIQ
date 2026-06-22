"""Prompt modules.

Each module exposes ``SYSTEM_PROMPT`` (persona + JSON-only contract + inline
schema) and ``TEMPERATURE``. Files use importable snake_case names
(e.g. resume_prompt.py) rather than the dotted ``resume.prompt.py`` shown in
the docs, since dotted stems are not importable in Python (see handoff note).
"""
