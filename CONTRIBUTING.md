# Contributing

Thanks for your interest in contributing to poc-workflow-builder-nextjs! This project showcases a clean, structured workflow for building a local‑first workflow editor with a portable core and clear API boundaries.

## Overview
- Keep changes atomic and documented as tasks.
- Preserve the API boundary: UI must call into `workflow-builder/lib/workflow-core/api.ts`.
- Prefer immutable updates to enable undo/redo and predictable state.

## Getting Started
Install & run:
```bash
cd workflow-builder
pnpm install
pnpm dev
# open http://localhost:3000
```

Run tests:
```bash
cd workflow-builder
pnpm test
```

Generate analysis reports:
```bash
cd workflow-builder
python3 scripts/generate-all-reports.py
```

## Task Flow (Docs‑Driven)
We plan before we change. Author or reference a task under `docs/project/`:

- Read the process: `docs/project/README.md`
- Use the template: `docs/project/_TEMPLATE.task.md`
- Lifecycle: `inbox` → `staged` → `in‑progress` → `done`

Each task should include:
- Context, Intent
- Files (Create/Update/Delete)
- Per‑file Changes (exact)
- Implementation Steps
- Acceptance Criteria
- Evidence/Proof

## Branch/Commit Guidance
For this portfolio repo, we may commit directly to `main` for doc‑only work. For larger changes, consider using a short‑lived branch and open a PR:
- Branch name (suggested): `docs/<short-desc>` or `feature/<short-desc>`
- Commit style (suggested): Conventional commits, e.g.:
  - `docs: update architecture overview links`
  - `feat(core): add edge validation rule`
  - `chore: harden .gitignore`

## Code Style & Architecture
- TypeScript, strict types; keep core free of framework dependencies.
- UI must not mutate core data directly; always use `workflow-core/api.ts`.
- Follow schema‑first: types map to `schemas/flowspec.v1.proto`.
- Prefer small, focused modules; keep concerns separated (UI vs state vs core vs fs).
- When changing behavior, update relevant documentation and tests.

## File System Access (Local‑First)
- The app uses the Browser File System Access API (Chromium‑based browsers).
- No Node CLI is provided; local‑first operation is intentional.

## Communication
- Open an issue for proposals/bugs.
- Reference your task document in the issue/PR.
- Provide evidence (screenshots, diffs, outputs) where applicable.

## Security
- See [SECURITY.md](./SECURITY.md) for reporting vulnerabilities and agentic AI best practices (prompt injection mitigations).

## License
- By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
