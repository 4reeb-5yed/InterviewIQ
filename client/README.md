# InterviewIQ — Frontend

React 18 + TypeScript (Vite) frontend. Upload a resume + a target job, then view the
skill-gap analysis, readiness score, and predicted questions.

## Requirements
- Node.js 20+
- A running backend (see `../server`) reachable at `VITE_API_BASE_URL`

## Setup
```bash
npm install
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Run
```bash
npm run dev                 # http://localhost:5173
```

## Quality
```bash
npm run typecheck
npm run lint
npm run build
```

## Layout
- `src/services` — axios client (envelope unwrapping) + upload/scraper/analysis services
- `src/types` — `ApiResponse<T>`/`ApiError` and domain types mirroring the backend
- `src/features/upload` — DropZone, JobInputCard, Stepper + hooks
- `src/features/analysis` — polling hook, ReadinessGauge, SkillGapCard, QuestionTable
- `src/components` — layout (AppShell, TopBar), shared badges, UI primitives
