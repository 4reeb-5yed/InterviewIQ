#!/usr/bin/env bash
# One-command local bootstrap for InterviewIQ.
# Creates .env files, installs backend + frontend deps, and prints next steps.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "==> InterviewIQ setup ($ROOT)"

# 1. Environment files (never overwrite existing).
if [ ! -f "$ROOT/server/.env" ]; then
  cp "$ROOT/server/.env.example" "$ROOT/server/.env"
  echo "    created server/.env (edit it to add AI_API_KEY)"
fi
if [ ! -f "$ROOT/client/.env" ]; then
  cp "$ROOT/client/.env.example" "$ROOT/client/.env"
  echo "    created client/.env"
fi

# 2. Backend dependencies.
if command -v python3.11 >/dev/null 2>&1; then PY=python3.11; else PY=python3; fi
echo "==> Installing backend dependencies with $PY"
( cd "$ROOT/server" && "$PY" -m venv .venv && . .venv/bin/activate && pip install --upgrade pip >/dev/null && pip install -e ".[dev]" )

# 3. Frontend dependencies.
echo "==> Installing frontend dependencies"
( cd "$ROOT/client" && npm install )

cat <<'EOF'

==> Setup complete.

Next steps:
  1. Start Postgres + backend (no Redis required):
       docker compose -f docker/docker-compose.yml up
     (this runs `alembic upgrade head` then the API on http://localhost:8000)

  2. In another terminal, start the frontend:
       cd client && npm run dev        # http://localhost:5173

  3. Open http://localhost:5173 and run an analysis.

Tip: add your Anthropic key to server/.env (AI_API_KEY) before running an analysis.
EOF
