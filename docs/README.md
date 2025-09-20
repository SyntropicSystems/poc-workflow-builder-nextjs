# Documentation Index

A central index for architecture, project planning, context, reports, developer scripts, and schemas.

## Architecture
- Architecture Overview: [architecture/OVERVIEW.md](./architecture/OVERVIEW.md)
  - Detailed system design, decisions, module structure, data flow, and risk mitigation.

## Project Planning
- Project Planning Home: [project/README.md](./project/README.md)
  - Workflow: inbox → staged → in‑progress → done
  - Naming convention: `NN-title.task.md`
- Subfolders:
  - Inbox: [project/inbox/README.md](./project/inbox/README.md) — Raw ideas to groom.
  - Staged: [project/staged/README.md](./project/staged/README.md) — Ready‑to‑implement tasks.
  - In‑Progress: [project/in-progress/README.md](./project/in-progress/README.md) — Work currently underway.
  - Done: [project/done/README.md](./project/done/README.md) — Completed tasks with evidence.

## Context Packages
- Context: [context/README.md](./context/README.md)
  - Context bundles passed along with tasks or workflows.

## Reports & Analysis
- Reports Overview: [../workflow-builder/reports/README.md](../workflow-builder/reports/README.md)
  - How to generate reports and interpret results.
  - Master script: `python3 scripts/generate-all-reports.py`
- Selected Reports (generated):
  - API Boundary Analysis: [../workflow-builder/reports/api-boundary-analysis.md](../workflow-builder/reports/api-boundary-analysis.md)
  - Architecture Compliance: [../workflow-builder/reports/architecture-compliance.md](../workflow-builder/reports/architecture-compliance.md)
  - Rust Readiness: [../workflow-builder/reports/rust-readiness.md](../workflow-builder/reports/rust-readiness.md)
  - Test Coverage Audit: [../workflow-builder/reports/test-coverage-audit.md](../workflow-builder/reports/test-coverage-audit.md)
  - Summary: [../workflow-builder/reports/REPORTS-SUMMARY.md](../workflow-builder/reports/REPORTS-SUMMARY.md)

## Developer Scripts
- Scripts directory: [../workflow-builder/scripts/](../workflow-builder/scripts/)
  - Generate all reports: `python3 generate-all-reports.py`
  - Additional checks: `check-*.py`, analyses: `analyze-*.py`, generators: `generate-*.py`

## Schemas
- Source of Truth (Proto): [../workflow-builder/schemas/flowspec.v1.proto](../workflow-builder/schemas/flowspec.v1.proto)

## See Also
- Root README (landing page): [../README.md](../README.md)
- LLM Bootstrap (to be added): `../llm.md` (see staged task to create)
