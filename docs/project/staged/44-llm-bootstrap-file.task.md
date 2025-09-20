# 44 — Add Root llm.md (LLM Bootstrap and Operating Guide)

Context
- The repository should be easy for LLMs and agents to initialize and work on. Today, there is no single entry document guiding an LLM across repo structure, principles, task workflow, and commands.
- A root `llm.md` will reduce ramp-up time and enforce the project’s operating constraints (API boundary, schema-first, immutable updates, etc.).

Intent
- Create a concise, high-signal `llm.md` at the repository root that:
  - States the project’s purpose and priorities.
  - Explains the repository map and where to look for specific concerns.
  - Defines the architectural constraints and “Do/Don’t” rules for contributions.
  - Documents how to run tests, generate reports, and follow the docs/task workflow.
  - Gives common task recipes (e.g., add step, edit edges, save, validate).

Files (Create/Update/Delete)
- CREATE: `llm.md` (root)

Per-file Changes (exact)
- `llm.md` — New file with the following sections:
  1) Title & Purpose
     - “LLM Bootstrap for poc-workflow-builder-nextjs”
     - Purpose: Quickly orient an LLM/agent to the project goals and working conventions.
  2) Project Priorities (as bullets)
     - Rapidly explore a workflow builder POC.
     - Demonstrate plan → implement → integrate with AI in a clean, structured way.
     - Focus on UX/UI and APIs so the core can later be rebuilt in Rust/Python and integrated into microservices.
  3) Repository Map (high level)
     - Root: `README.md` (landing), `llm.md` (this guide)
     - `docs/` (docs index, architecture, project planning)
     - `docs/project/` (inbox, staged, in-progress, done; task docs)
     - `workflow-builder/` (Next.js app, components, core, scripts, reports)
     - `workflow-builder/lib/workflow-core/` (API, parser, validator, templates)
     - `workflow-builder/scripts/` (analysis/report scripts)
     - `workflow-builder/reports/` (generated reports + overview README)
  4) Architectural Principles and Constraints
     - Schema-first (protobuf as source of truth or mapped TS types)
     - Strict API boundary (UI never directly mutates core structures)
     - Immutable state updates (enable undo/redo)
     - Error recovery at each layer
     - Progressive enhancement
     - Core library free of framework dependencies; Result<T> pattern
  5) How to Work on This Repo (for LLMs/agents)
     - Always propose/author a task file under `docs/project/staged` before invasive changes.
     - Follow task template (Context, Intent, Files, Steps, Acceptance Criteria, Evidence).
     - Make UI changes through core APIs; never bypass `workflow-core/api.ts`.
     - Keep changes atomic; maintainers may split/merge tasks.
  6) Commands
     - Install/run (pnpm-based):
       - `cd workflow-builder && pnpm install && pnpm dev` → open http://localhost:3000
     - Tests:
       - `cd workflow-builder && pnpm test`
     - Reports:
       - `cd workflow-builder && python3 scripts/generate-all-reports.py`
  7) Common Task Recipes
     - Add a workflow step
     - Edit edges
     - Save to disk
     - Run validation
     - For each: reference `workflow-builder/lib/workflow-core/api.ts` and related modules.
  8) Do / Don’t
     - Do: update via core API; write tests when editing core; keep tasks atomic; update docs as needed.
     - Don’t: mutate core objects directly in React components; introduce framework deps into core; bypass task workflow.
  9) Links
     - Root README (landing)
     - Architecture Overview (`docs/architecture/OVERVIEW.md`)
     - Docs Index (`docs/README.md`)
     - Reports Overview (`workflow-builder/reports/README.md`)
     - Project Planning (`docs/project/README.md`)

Implementation Steps
1) Create `llm.md` with the sections listed above; keep it concise, link to deeper docs instead of duplicating.
2) Validate all relative links from repository root context.
3) Lint for headings and formatting consistency (if markdown linting is available).
4) Commit: “docs: add root llm.md to bootstrap LLM/agent workflows”.

Acceptance Criteria
- `llm.md` exists at repo root with all sections above.
- Links resolve to existing files (README, docs, architecture, reports, project planning).
- The guide is concise, avoids duplication, and enforces architectural constraints.
- Provides actionable, repeatable guidance to initialize an LLM on this codebase.

Evidence/Proof
- Rendered preview of `llm.md` headings and link click-through.
- Screenshots or link-check output showing no broken links.
