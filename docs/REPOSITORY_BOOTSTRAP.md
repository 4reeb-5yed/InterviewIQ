# InterviewIQ — Repository Bootstrap

> How to initialize the repository, what the initial tree looks like, the first-commit plan, and the branch strategy. Do this **before** the coding agent starts Block/Stage 1.

---

## 1. Initial folder structure (skeleton to create first)

Create this top-level skeleton. Empty package dirs get a `.gitkeep`; the planning docs already exist.

```
InterviewIQ/
├── .gitignore
├── .editorconfig
├── README.md                      (exists)
├── DEPLOYMENT.md                  (created in T49)
├── CONTRIBUTING.md                (stub)
├── docs/                          (exists — planning set)
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── DATABASE.md
│   ├── API_CONTRACTS.md
│   ├── FOLDER_STRUCTURE.md
│   ├── PHASE_1_PLAN.md
│   ├── TASKS.md
│   ├── PHASE1_CHECKLIST.md
│   ├── SETUP_GUIDE.md
│   ├── REPOSITORY_BOOTSTRAP.md
│   └── AGENT_HANDOFF.md
├── server/
│   └── .gitkeep
├── client/
│   └── .gitkeep
├── docker/
│   └── .gitkeep
├── scripts/
│   └── .gitkeep
└── .github/
    └── workflows/
        └── .gitkeep
```

> `server/` and `client/` contents are created by the coding agent following TASKS.md. Bootstrap only establishes the shell + tooling files.

---

## 2. `.gitignore` (root) — essential entries

```gitignore
# Python
__pycache__/
*.py[cod]
.venv/
venv/
.env
.pytest_cache/
.mypy_cache/
.ruff_cache/
*.egg-info/

# Node / frontend
node_modules/
client/dist/
client/.env
.vite/

# OS / editor
.DS_Store
.idea/
.vscode/*            # keep shared settings explicitly if desired
!.vscode/extensions.json

# Secrets / local
*.local
server/.env
```

> Both `.env` files are ignored; only `.env.example` files are committed.

---

## 3. `.editorconfig` (root)

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space

[*.py]
indent_size = 4

[*.{ts,tsx,js,jsx,json,css,html,yml,yaml}]
indent_size = 2
```

---

## 4. Git initialization steps

```bash
cd InterviewIQ
git init -b main

# create skeleton dirs + keepers (if not already present)
mkdir -p server client docker scripts .github/workflows
touch server/.gitkeep client/.gitkeep docker/.gitkeep scripts/.gitkeep .github/workflows/.gitkeep

# add the tooling files described above
#   .gitignore, .editorconfig, CONTRIBUTING.md (stub)

git add .
git status   # verify no .env or secrets are staged
```

> Do **not** configure remotes or push automatically — repository hosting is a later, manual decision (per project constraints, no repo access is assumed).

---

## 5. First-commit plan

Commit in small, reviewable chunks so history reads as a clean bootstrap. Use Conventional Commits.

| Order | Commit message | Contents |
|-------|----------------|----------|
| 1 | `chore: initialize repository skeleton` | dirs + `.gitkeep`, `.gitignore`, `.editorconfig` |
| 2 | `docs: add planning and specification documents` | everything in `docs/` + `README.md` |
| 3 | `chore: add CONTRIBUTING stub` | `CONTRIBUTING.md` |

After bootstrap, each TASKS.md group becomes its own focused commit/PR (see branch strategy).

---

## 6. Recommended branch strategy

Lightweight trunk-based flow — appropriate for a solo/portfolio project, friendly to AI-assisted development.

- **`main`** — always deployable. Protected (even solo: require PR + green CI once CI exists in Phase 4).
- **Short-lived feature branches**, one per TASKS.md group or stage:
  - `feat/backend-foundation` (T01–T05)
  - `feat/database` (T06–T09)
  - `feat/core-abstractions` (T10–T17)
  - `feat/resume-feature` (T20–T24)
  - `feat/scraper-feature` (T25–T28)
  - `feat/analysis-pipeline` (T29–T35)
  - `feat/frontend-upload-analysis` (T40–T46)
  - `chore/docker-and-deploy` (T47–T50)
- **Merge via PR**, squash-merge to keep `main` history linear.
- **Tag** the working MVP: `v0.1.0-mvp` once Phase 1 Definition of Done is met.

### Commit conventions
- `feat:` new capability · `fix:` bug · `chore:` tooling/infra · `docs:` documentation · `test:` tests · `refactor:` no behavior change.
- One logical change per commit; keep diffs small so an agent (and a reviewer) can read them cheaply.

---

## 7. Branch protection checklist (enable when hosting is set up)

- [ ] Require PR before merging to `main`
- [ ] Require CI (lint + type-check + test) to pass — once `ci.yml` is active (Phase 4)
- [ ] Disallow force-push to `main`
- [ ] Squash-merge only
