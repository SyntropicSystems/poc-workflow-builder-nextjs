# Project Planning

This directory contains the planning workflow and task documents used to guide development in a clean, structured way (plan → implement → integrate).

## Purpose
- Capture atomic, high‑signal tasks that describe changes before implementation.
- Keep a clear history of decisions, acceptance criteria, and evidence.
- Enable reliable collaboration with humans and LLMs.

## Workflow
Tasks move through four stages:
1. Inbox — raw, untriaged ideas and notes
2. Staged — curated and ready‑to‑implement tasks
3. In‑Progress — tasks currently being executed
4. Done — completed tasks with proof/evidence

## Task Naming
Use ordered prefixes and a short title:
- `NN-title.task.md` (e.g., `41-root-readme-refactor.task.md`)
- Keep each task atomic and focused on one coherent change set.

## Task Structure
Each task document should contain:
- Context — background and why this matters
- Intent — what this task will accomplish
- Files (Create/Update/Delete) — explicit file operations
- Per-file Changes (exact) — detailed changes per file
- Implementation Steps — concrete steps to perform
- Acceptance Criteria — how to verify completion
- Evidence/Proof — screenshots, diffs, outputs
- Notes (optional) — risks, alternatives, follow‑ups

Template:
- Use the canonical template: [./_TEMPLATE.task.md](./_TEMPLATE.task.md)

## Authoring Guidelines
- Keep tasks atomic: one coherent change set per task/commit.
- Enumerate Files with explicit Create/Update/Delete operations.
- Be precise in “Per-file Changes (exact)” and include link updates or structural moves.
- Define Acceptance Criteria that are externally verifiable (links resolve, tests pass, lint clean).
- Prefer concise steps; link to deeper docs (architecture, reports) rather than duplicating content.
- Use relative links and validate them locally.
- When code changes affect docs or tests, update them in the same task or create follow-ups.
- Provide evidence (screenshots, diffs, CLI outputs) in the task or a colocated subfolder.

## Subfolders
- Inbox: [./inbox/README.md](./inbox/README.md) — Raw ideas to groom into atomic tasks
- Staged: [./staged/README.md](./staged/README.md) — Ready‑to‑implement tasks
- In‑Progress: [./in-progress/README.md](./in-progress/README.md) — Work underway (reference PRs/issues)
- Done: [./done/README.md](./done/README.md) — Completed tasks with links and evidence

## Links
- Docs Index: [../README.md](../README.md)
- Architecture Overview: [../architecture/OVERVIEW.md](../architecture/OVERVIEW.md)
- Reports Overview: [../../workflow-builder/reports/README.md](../../workflow-builder/reports/README.md)
