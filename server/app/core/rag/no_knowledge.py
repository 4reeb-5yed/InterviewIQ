"""Default no-op knowledge provider. Returns nothing; not wired into the pipeline."""

from __future__ import annotations

from app.core.rag.base import KnowledgeProvider


class NoKnowledgeProvider(KnowledgeProvider):
    """MVP default: retrieval disabled."""

    async def retrieve(self, query: str, top_k: int = 5) -> list[str]:
        return []
