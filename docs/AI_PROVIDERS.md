# InterviewIQ — AI Providers

The AI layer is fully provider-agnostic. Business logic (agents, services,
controllers) depends only on the `AIProvider` interface; the concrete provider is
chosen by `AIProviderFactory` from configuration. **Switching providers requires
only environment-variable changes — no code changes.**

Supported: **Anthropic, OpenAI, Google Gemini, AWS Bedrock**, plus any
**OpenAI-compatible** endpoint (OpenRouter, Ollama, vLLM, LM Studio, Together, …)
via a base URL.

Startup validation (`validate_ai_config`) runs in the app factory and fails fast
with a clear message if the selected provider is missing required credentials.

---

## Selecting a provider

Set `AI_PROVIDER` and the matching credentials, then set the per-agent model ids
to values your provider serves. The four model variables are:
`RESUME_AGENT_MODEL`, `JOB_AGENT_MODEL`, `SKILL_GAP_AGENT_MODEL`, `QUESTION_AGENT_MODEL`.

### Environment variables

| Variable | Used by | Required? |
|----------|---------|-----------|
| `AI_PROVIDER` | all | yes (`anthropic`\|`openai`\|`gemini`\|`bedrock`, or alias `openrouter`\|`local`) |
| `AI_API_KEY` | anthropic, openai, gemini, openrouter | yes (optional for keyless local endpoints) |
| `AI_BASE_URL` | openai-compatible / local | required for local/OpenRouter endpoints |
| `AI_ORGANIZATION` | openai | optional |
| `AWS_REGION` | bedrock | yes |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | bedrock | optional (else default AWS chain) |
| `*_AGENT_MODEL` | all | yes (must be valid for the provider) |

---

## Examples (`server/.env`)

### Anthropic (default)
```
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-...
RESUME_AGENT_MODEL=claude-3-5-sonnet-latest
# ...other *_AGENT_MODEL = claude-3-5-sonnet-latest
```

### OpenAI
```
AI_PROVIDER=openai
AI_API_KEY=sk-...
RESUME_AGENT_MODEL=gpt-4o-mini
# ...other *_AGENT_MODEL = gpt-4o-mini
```

### Google Gemini
```
AI_PROVIDER=gemini
AI_API_KEY=AIza...
RESUME_AGENT_MODEL=gemini-1.5-pro
# ...other *_AGENT_MODEL = gemini-1.5-pro
```

### AWS Bedrock
```
AI_PROVIDER=bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...        # optional if using a role/profile
AWS_SECRET_ACCESS_KEY=...        # optional if using a role/profile
RESUME_AGENT_MODEL=anthropic.claude-3-5-sonnet-20240620-v1:0
# any Bedrock Converse-capable model id works (Llama, Mistral, Titan, …)
```

### OpenRouter (OpenAI-compatible)
```
AI_PROVIDER=openrouter
AI_BASE_URL=https://openrouter.ai/api/v1
AI_API_KEY=sk-or-...
RESUME_AGENT_MODEL=openai/gpt-4o-mini
```

### Local LLM — Ollama (OpenAI-compatible, keyless)
```
AI_PROVIDER=local
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama                # any placeholder; Ollama ignores it
RESUME_AGENT_MODEL=llama3.1
```

### Local LLM — vLLM / LM Studio
```
AI_PROVIDER=local
AI_BASE_URL=http://localhost:8001/v1   # vLLM default; LM Studio uses :1234/v1
AI_API_KEY=not-needed
RESUME_AGENT_MODEL=<model served by your endpoint>
```

---

## How it works

- `AIProvider` (interface) and `AIRequest`/`AIMessage` are unchanged.
- `AIProviderFactory.create(settings)` maps `AI_PROVIDER` to:
  - `anthropic` → `AnthropicProvider`
  - `openai` / `openrouter` / `local` / `openai_compatible` → `OpenAIProvider` (honours `AI_BASE_URL`)
  - `gemini` / `google` → `GeminiProvider`
  - `bedrock` / `aws` → `BedrockProvider` (Converse API, model-agnostic)
- Provider SDKs are imported lazily inside each provider, so unused providers add
  no import cost and missing optional SDKs produce a clear error.
- Bedrock uses the unified **Converse API**, so the same provider works across
  Anthropic, Llama, Mistral, Titan, and Cohere models on Bedrock.

To add another provider later: implement `AIProvider` in `core/ai/providers/`,
map it in the factory, and add any validation — no other code changes.
