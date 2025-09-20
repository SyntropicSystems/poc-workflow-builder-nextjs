# 42 — workflow-builder/README Refactor (Replace Scaffold With Project-Specific Docs)

Context
- The current `workflow-builder/README.md` is the default Create Next App scaffold. It does not reflect this repository’s purpose, local-first model, scripts, reports, or directory layout.
- This folder is the primary app and houses the portable core, scripts, and reports that portfolio viewers will care about.

Intent
- Replace the scaffolded README with a concise, project-specific guide:
  - What the app is (local-first workflow builder POC with Rust-ready core)
  - How to install, run, test
  - How to generate reports and what they mean
  - Directory layout and key entry points
  - Known limitations (browser File System Access API)

Files (Create/Update/Delete)
- UPDATE: `workflow-builder/README.md`

Per-file Changes (exact)
- `workflow-builder/README.md` — Replace content with:
  - Title: “Workflow Builder — Local-First Next.js App”
  - Overview (1–2 paragraphs):
    - What it does: Visual workflow editor that reads/writes YAML locally via the Browser File System Access API
    - Design: Clean API boundary to a portable TypeScript core that can later be rebuilt in Rust/Python
  - Prerequisites:
    - Node 18+
    - pnpm
    - Python 3 (for analysis scripts)
    - Optional: `protoc` if generating protobufs locally (link to docs if applicable)
  - Getting Started:
    - Commands (from repo root or this folder):
      - `cd workflow-builder`
      - `pnpm install`
      - `pnpm dev`
      - Open `http://localhost:3000`
  - Testing:
    - `pnpm test` (Vitest)
    - Note existence of `test-setup.ts`
  - Reports & Analysis:
    - Generate all reports:
      - `cd workflow-builder`
      - `python3 scripts/generate-all-reports.py`
    - Link to `reports/README.md` for details and interpretation
  - Directory Layout (selected):
    - `app/` — Next.js App Router entry (`app/page.tsx` main editor)
    - `components/` — UI components (React Flow graph, inspector, file panels)
    - `lib/workflow-core/` — Portable core (API, parser, validator, templates)
    - `lib/fs/` — File System Access API wrappers
    - `lib/state/` — Zustand stores
    - `schemas/` — `flowspec.v1.proto` (source-of-truth schema)
    - `scripts/` — Analysis/generation scripts
    - `reports/` — Generated analysis reports and summaries
  - Browser File System Access:
    - Permissions prompts; tested in Chromium-based browsers
    - Limitation: No Node CLI; this is intentionally local-first in the browser
  - Links:
    - Root README (project landing)
    - Architecture overview (docs/architecture/OVERVIEW.md)
    - Reports overview (reports/README.md)

Implementation Steps
1) Overwrite `workflow-builder/README.md` with the above structure and content.
2) Ensure links resolve:
   - Root README: `../README.md` (from workflow-builder folder)
   - Architecture overview: `../docs/architecture/OVERVIEW.md`
   - Reports overview: `./reports/README.md`
3) Remove template references to yarn/bun unless you want to explicitly support them; standardize on pnpm.
4) Proofread for consistency (headings, tone) and validate commands.
5) Commit: “docs: replace workflow-builder README scaffold with project-specific guide”.

Acceptance Criteria
- No scaffold boilerplate remains; README is specific to this project.
- Clear install/run/test instructions using pnpm.
- Reports generation process is documented and linked.
- Directory layout and key entry points are listed.
- File System Access API limitations are noted.
- All links are valid relative paths.

Evidence/Proof
- Before/after diff of `workflow-builder/README.md`
- Screenshot of app running at `http://localhost:3000`
- Successful execution of `python3 scripts/generate-all-reports.py` with reports timestamp updated
