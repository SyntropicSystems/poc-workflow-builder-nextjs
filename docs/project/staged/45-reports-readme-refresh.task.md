# 45 — Reports README Refresh (Cross-links, Consistency, Clarity)

Context
- `workflow-builder/reports/README.md` is strong but can be aligned with the new documentation structure and cross-linked from/to other key docs.
- Some instructions can be clarified (environment prerequisites, links to architecture docs, planning tasks that produced report scripts).

Intent
- Refresh the reports landing page to:
  - Add cross-links to architecture docs and planning tasks.
  - Confirm/clarify environment prerequisites and commands.
  - Ensure terminology and structure match the cleaned root/docs READMEs.

Files (Create/Update/Delete)
- UPDATE: `workflow-builder/reports/README.md`

Per-file Changes (exact)
- `workflow-builder/reports/README.md`
  - Add “Related Documentation” section with links:
    - Architecture Overview → `../../docs/architecture/OVERVIEW.md`
    - Docs Index → `../../docs/README.md`
    - Project Planning → `../../docs/project/README.md`
  - Add “Environment Prerequisites” block near “Master Script”:
    - Node 18+ (project runtime)
    - Python 3 (report generation)
    - pnpm (preferred package manager)
    - Optional: `protoc` if protobuf regeneration is used in your flow
  - Confirm the “Master Script” instructions include:
    - `cd workflow-builder`
    - `python3 scripts/generate-all-reports.py`
  - Add a “Maintainers’ Notes” subsection:
    - Where to update/add scripts (under `workflow-builder/scripts`)
    - Naming conventions (`check-*.py`, `analyze-*.py`, `generate-*.py`)
    - Reminder to update this README when adding scripts
  - Normalization/Consistency:
    - Use consistent headings and terminology (e.g., “Reports Overview”, “Core Analysis Reports”, “Consolidated Reports”, “Metadata Files”).
    - Ensure “Current State” date phrasing is stable (e.g., “as of YYYY-MM-DD”).
  - Cross-link to relevant completed tasks for provenance (optional):
    - Example: `docs/project/done/35-consolidate-reports-and-create-action-plan.task.md`
    - Example: `docs/project/done/34-test-coverage-audit.task.md`

Implementation Steps
1) Edit `workflow-builder/reports/README.md` to add the new “Related Documentation” and “Environment Prerequisites” sections.
2) Verify master script path and usage examples; ensure they match the current repo layout.
3) Normalize headings and terminology for consistency with root/architecture/docs pages.
4) Optionally reference source tasks in `docs/project/done/*` that led to these reports.
5) Commit: “docs: refresh reports README with cross-links, prerequisites, and consistency updates”.

Acceptance Criteria
- Reports README contains cross-links to architecture/docs index/project planning.
- Environment prerequisites and master script usage are explicitly documented.
- Headings/terminology align with the rest of the repository docs.
- Optional provenance links to relevant done tasks are included or consciously omitted.

Evidence/Proof
- Screenshots or copied headings of the new sections.
- Manual validation of relative links (`../../docs/...` and local `scripts/*` references).
