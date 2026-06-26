# InterviewIQ — Frontend

React 18 + TypeScript single-page app (Vite) for uploading a résumé and viewing the evidence-based
report. Tailwind CSS with dark mode, TanStack Query for async state, Axios for API calls.

- Local: http://localhost:5173
- Production (Vercel): https://interview-iq-areeb-syed.vercel.app

---

## Requirements

- Node.js **20+** (npm)
- A running backend reachable at `VITE_API_BASE_URL`

## Setup & run

```bash
npm install
cp .env.example .env            # VITE_API_BASE_URL=http://localhost:8000/api/v1
npm run dev                     # http://localhost:5173
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (HMR) |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

---

## How it works

### React + Vite
- Entry point: `src/main.tsx` (mounts `<App/>`, wraps it in a TanStack Query client and React Router).
- `src/App.tsx` defines routes; the report and landing pages are **lazy-loaded** (`React.lazy`) for
  code-splitting, with a skeleton fallback.

### Routing (React Router v6)
| Path | Screen |
|------|--------|
| `/` | Landing (`features/home/LandingPage`) |
| `/analyze` | Upload (`features/upload/UploadPage`) |
| `/analysis/:taskId` | Report (`features/analysis/AnalysisPage`) |

Navigation: sticky top bar (desktop) with an active-route indicator and a dark-mode toggle, plus a
bottom tab bar on mobile.

### API communication
- `src/config/env.config.ts` reads **`VITE_API_BASE_URL`** (typed).
- `src/services/api.client.ts` is an Axios instance whose interceptor unwraps the backend envelope
  and throws a typed `ApiError`. Feature services (`upload`, `scraper`, `analysis`) call the routes.
- `src/types/` mirrors the backend contracts (`ApiResponse<T>`, `ApiError`, `ResumeData`, `JobData`,
  `CareerReport`, `JobMatch`, …) so the UI is fully typed against the API.
- The report uses a **submit→poll** flow: `runAnalysis` → poll `getTask(taskId)` via TanStack Query
  `refetchInterval` until the task is terminal.

### UI
- Tailwind design system (Inter font, dark mode via `class`, accessible focus/hover/active states).
- Report sections are collapsible; the report can be exported (copy text / **Save as PDF** via the
  browser print dialog / Web Share with link-copy fallback) — see `src/lib/export.ts`.

### Build & deployment
- `npm run build` type-checks then emits a static bundle to `dist/`.
- **Vercel**: root directory `client`, framework preset **Vite**, build `npm run build`, output
  `dist`, env `VITE_API_BASE_URL=https://interviewiq-02c1.onrender.com/api/v1`.
  `VITE_*` is baked at build time — **redeploy** after changing it. See [../DEPLOYMENT.md](../DEPLOYMENT.md).

## Layout

```
src/
├── main.tsx · App.tsx · index.css
├── config/env.config.ts        # VITE_API_BASE_URL
├── lib/                         # cn (classnames) · theme (dark mode) · export (copy/share/print)
├── services/                   # api.client + upload/scraper/analysis services
├── types/                      # api + domain types (mirror backend)
├── components/                 # layout (AppShell, TopBar, BottomNav) · ui · shared
└── features/
    ├── home/                   # LandingPage
    ├── upload/                 # DropZone, JobInputCard, hooks, UploadPage
    └── analysis/               # AnalysisPage + report section components + useAnalysis
```
