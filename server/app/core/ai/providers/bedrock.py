"""AWS Bedrock implementation of :class:`AIProvider`.

Uses the Bedrock Converse API, which is unified across model families (Anthropic,
Llama, Mistral, Titan, Cohere, etc.), so any Converse-capable model id works via
the per-agent model settings. The synchronous boto3 call is offloaded to a thread.
"""

from __future__ import annotations

import asyncio
import time

from app.core.ai.base import AIMessage, AIProvider, AIRequest


class BedrockProvider(AIProvider):
    """Calls Amazon Bedrock via the model-agnostic Converse API."""

    def __init__(
        self,
        region: str | None,
        access_key: str | None = None,
        secret_key: str | None = None,
    ) -> None:
        try:
            import boto3
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "The 'boto3' package is required for AI_PROVIDER=bedrock."
            ) from exc
        if not region:
            raise RuntimeError("Bedrock requires AWS_REGION.")

        client_kwargs: dict = {"region_name": region}
        if access_key and secret_key:
            client_kwargs["aws_access_key_id"] = access_key
            client_kwargs["aws_secret_access_key"] = secret_key
        # Otherwise boto3's default credential chain is used (env, profile, role).
        self._client = boto3.client("bedrock-runtime", **client_kwargs)

    async def generate(self, request: AIRequest) -> AIMessage:
        def _call() -> dict:
            return self._client.converse(
                modelId=request.model,
                messages=[{"role": "user", "content": [{"text": request.user_message}]}],
                system=[{"text": request.system_prompt}],
                inferenceConfig={
                    "temperature": request.temperature,
                    "maxTokens": request.max_tokens,
                },
            )

        start = time.perf_counter()
        response = await asyncio.to_thread(_call)
        latency_ms = (time.perf_counter() - start) * 1000

        content = response["output"]["message"]["content"][0]["text"]
        usage = response.get("usage", {})
        return AIMessage(
            content=content,
            model=request.model,
            input_tokens=usage.get("inputTokens", 0),
            output_tokens=usage.get("outputTokens", 0),
            latency_ms=latency_ms,
        )
