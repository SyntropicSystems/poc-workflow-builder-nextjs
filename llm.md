# LLM Bootstrap for poc-workflow-builder-nextjs

A concise orientation for language models and agents to understand this repository, its priorities, constraints, and how to work within it safely and effectively.

## Purpose & Priorities
- Rapidly explore a proof of concept for a workflow builder.
- Demonstrate clean, structured AI‑assisted development (plan → implement → integrate).
- Focus on UX/UI and API boundaries so the core can later be rebuilt in Rust/Python and integrated into a micro‑service architecture.

## Repository Map (High Level)
- `README.md` — Project landing page (quick start, structure, links)
- `llm.md` — This file (LLM orientation and rules)
- `docs/`
  - `docs/README.md` — Documentation index
  - `docs/architecture/OVERVIEW.md` — Detailed architecture overview
  - `docs/project/` — Task workflow: `inbox/`, `staged/`, `in-progress/`, `done/`
- `workflow-builder/` — Next.js app + portable core, scripts, reports
  - `app/` — Main editor UI (`app/page.tsx`)
  - `components/` — UI components (React Flow graph, inspector, panels)
  - `lib/workflow-core/` — Portable core
    - `api.ts` — Public API surface (UI must call into this)
    - `parser.ts`, `validator.ts`, `templates.ts`
  - `lib/fs/` — File System Access wrappers (browser)
  - `lib/state/` — Zustand stores
  - `schemas/flowspec.v1.proto` — Source‑of‑truth schema
  - `scripts/` — Analysis/report scripts
  - `reports/` — Generated analysis reports (+ README)

## Architectural Principles & Constraints
- Schema‑first: Protobuf or mapped TS types are the source of truth.
- Strict API boundary: UI must not directly mutate workflow data structures; always go through `workflow-core/api.ts`.
- Immutable state updates: Enables undo/redo and predictable state management.
- Error recovery at each layer: Parser/validator/fs surfaces clear errors; UI responds gracefully.
- Progressive enhancement: Ship incremental features; keep core portable/framework‑free.
- Result‑style pattern in core; keep the core free of framework dependencies.

## Operating Instructions for LLMs/Agents
1. Plan before you change:
   - Author or update a task document in `docs/project/staged` using the template (see below).
   - Include explicit per‑file create/update/delete changes and acceptance criteria.
2. Respect boundaries:
   - Do not modify core data directly from React components.
   - Interact with workflow data via `workflow-builder/lib/workflow-core/api.ts`.
3. Keep changes atomic:
   - One coherent change set per task/commit.
   - If scope grows, split into additional staged tasks.
4. Documentation discipline:
   - Update docs alongside code when behavior or usage changes.
   - Use relative links and validate them.

## Commands
Install & run:
```bash
cd workflow-builder
pnpm install
pnpm dev
# open http://localhost:3000
```

Tests:
```bash
cd workflow-builder
pnpm test
```

Reports:
```bash
cd workflow-builder
python3 scripts/generate-all-reports.py
```

## Common Task Recipes
- Add a workflow step:
  - Use `workflow-core/api.ts` functions (e.g., create from templates, update flow).
  - Validate via `validator.ts`; ensure immutable updates.
- Edit edges:
  - Update via API, not directly in the graph component; re‑validate structure.
- Save to disk:
  - Use FS utilities in `lib/fs/` to write serialized YAML. Handle permissions prompts.
- Run validation:
  - Call `validateWorkflow` before saving; surface errors in UI where applicable.

Reference files:
- Core API: `workflow-builder/lib/workflow-core/api.ts`
- Parser/Validator: `workflow-builder/lib/workflow-core/parser.ts`, `workflow-builder/lib/workflow-core/validator.ts`
- Templates: `workflow-builder/lib/workflow-core/templates.ts`

## Do / Don’t
Do:
- Use the core API for any workflow modifications.
- Keep tasks atomic and include acceptance criteria.
- Update docs and link proof/evidence in tasks.
- Run tests/reports when relevant.

Don’t:
- Bypass the API boundary from UI components.
- Introduce framework dependencies into the portable core.
- Commit large, mixed‑concern changes without a task document.

## Links
- Landing page: [README.md](./README.md)
- Docs Index: [docs/README.md](./docs/README.md)
- Architecture Overview: [docs/architecture/OVERVIEW.md](./docs/architecture/OVERVIEW.md)
- Reports Overview: [workflow-builder/reports/README.md](./workflow-builder/reports/README.md)
- Project Planning Home: [docs/project/README.md](./docs/project/README.md)
- Task Template (to be created in Task 46): `docs/project/_TEMPLATE.task.md`
