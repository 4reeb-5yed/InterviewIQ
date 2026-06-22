"""Knowledge-retrieval interface for optional RAG (scaffold)."""

from __future__ import annotations

from abc import ABC, abstractmethod


class KnowledgeProvider(ABC):
    """Retrieves context snippets for a query (vector store, etc.)."""

    @abstractmethod
    async def retrieve(self, query: str, top_k: int = 5) -> list[str]:
        """Return up to ``top_k`` relevant snippets."""
