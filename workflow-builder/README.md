# Workflow Builder — Local‑First Next.js App

A visual workflow editor that reads/writes YAML locally via the Browser File System Access API. Designed with a strict API boundary and a portable TypeScript core so the core logic can later be rebuilt in Rust/Python and integrated into a micro‑service architecture.

## Overview
- Local‑first: no server required; files are accessed via the browser with user consent.
- Clean boundaries: React UI operates through the `workflow-core` API, never mutating core data directly.
- Migration path: the core is structured to be replaced with a Rust (WASM) or Python implementation later without changing the UI.

## Prerequisites
- Node.js 18+
- pnpm
- Python 3 (for analysis/report scripts)
- Optional: `protoc` if you intend to (re)generate protobufs locally

## Getting Started
```bash
cd workflow-builder
pnpm install
pnpm dev
# open http://localhost:3000
```

## Testing
```bash
cd workflow-builder
pnpm test
```
- Vitest is configured (see `test-setup.ts`).

## Reports & Analysis
Generate all reports:
```bash
cd workflow-builder
python3 scripts/generate-all-reports.py
```
- See [reports/README.md](./reports/README.md) for details on each report and interpretation.

## Directory Layout (selected)
- `app/` — Next.js App Router entry (main editor in `app/page.tsx`)
- `components/` — UI components (React Flow graph, inspector, file panels, etc.)
- `lib/workflow-core/` — Portable core
  - `api.ts` — public API surface (UI must call into this)
  - `parser.ts` — YAML ↔ TS model conversion
  - `validator.ts` — schema validation
  - `templates.ts` — helpers for creating flows/steps
- `lib/fs/` — Browser File System Access API wrappers
- `lib/state/` — Zustand stores for UI/state management
- `schemas/` — `flowspec.v1.proto` (source-of-truth schema)
- `scripts/` — analysis/generation scripts (reports, mapping, checks)
- `reports/` — generated analysis reports and summaries

## Browser File System Access Notes
- Users will be prompted for directory/file access.
- Best supported in Chromium‑based browsers.
- This POC intentionally does not provide a Node CLI; operations are local‑first in the browser.

## Links
- Root README (project landing): [../README.md](../README.md)
- Architecture Overview: [../docs/architecture/OVERVIEW.md](../docs/architecture/OVERVIEW.md)
- Reports Overview: [reports/README.md](./reports/README.md)
