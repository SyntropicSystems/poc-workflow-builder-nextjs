# Workflow Builder POC (Local‑First, Rust‑Ready)

A visual workflow builder prototype focused on UX/UI and clean API boundaries. Built in Next.js/TypeScript for rapid iteration, designed so the core logic can later be rebuilt in Rust or Python and integrated into a micro‑service architecture. Local‑first: reads/writes workflow files via the Browser File System Access API—no server required.

## Goals
- Rapidly explore a proof of concept for a workflow builder
- Demonstrate clean, structured AI‑assisted development (plan → implement → integrate)
- Focus on UX/UI and APIs so the core can later be rebuilt in Rust/Python and integrated into micro‑services

## Quick Start
Prerequisites:
- Node.js 18+
- pnpm
- Python 3 (for generating analysis reports)

Run the app:
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

## Repository Structure (Top Level)
- docs/ — documentation, architecture, and project planning
  - docs/architecture/OVERVIEW.md — detailed architecture overview (moved from root)
  - docs/project/ — task workflow (inbox → staged → in‑progress → done)
  - docs/context/ — context packages for tasks/workflows
- workflow-builder/ — Next.js app, core library, scripts, and reports
  - app/ — main editor UI (App Router)
  - components/ — UI components (React Flow graph, inspector, file panels)
  - lib/workflow-core/ — portable core (API, parser, validator, templates)
  - lib/fs/ — File System Access utilities
  - lib/state/ — Zustand stores
  - schemas/ — flowspec.v1.proto (source of truth)
  - scripts/ — analysis/report scripts
  - reports/ — generated analysis reports

## Key Links
- Architecture Overview: docs/architecture/OVERVIEW.md
- Documentation Index: docs/README.md
- Reports Overview: workflow-builder/reports/README.md

## Notes
- Local‑first by design (Browser File System Access API). Best supported in Chromium‑based browsers.
- Keep core framework‑free and uphold API boundary discipline. Use immutable updates to enable undo/redo.

## Contributing & License
- Contributing guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Security policy: [SECURITY.md](./SECURITY.md)
- License: [LICENSE](./LICENSE)
- Project planning tasks: [docs/project/](./docs/project/)
