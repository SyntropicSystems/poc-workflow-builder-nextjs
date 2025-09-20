# 43 — Docs Index and Project Folder READMEs (Consistent, Self-Explanatory)

Context
- Multiple README.md files exist with placeholder one-liners:
  - docs/README.md
  - docs/project/README.md
  - docs/project/inbox/README.md
  - docs/project/staged/README.md
  - docs/project/in-progress/README.md
  - docs/project/done/README.md
- For a public/portfolio-ready repository, each README should clearly explain the folder’s purpose and how to use it. The docs index should act as a clear table of contents for the whole documentation set.

Intent
- Make documentation navigable and self-explanatory:
  - Expand `docs/README.md` into a proper documentation index.
  - Standardize all project subfolder READMEs with “Purpose”, “How to Use”, and “Links”.
  - Document the task workflow (inbox → staged → in-progress → done) and naming conventions.

Files (Create/Update/Delete)
- UPDATE: docs/README.md
- UPDATE: docs/project/README.md
- UPDATE: docs/project/inbox/README.md
- UPDATE: docs/project/staged/README.md
- UPDATE: docs/project/in-progress/README.md
- UPDATE: docs/project/done/README.md

Per-file Changes (exact)
- docs/README.md
  - Replace placeholder text with an index that includes:
    - Architecture → docs/architecture/OVERVIEW.md
    - Project Planning → docs/project/README.md
    - Context Packages → docs/context/README.md
    - Reports & Analysis → workflow-builder/reports/README.md
    - Developer Scripts → workflow-builder/scripts/ (mention generate-all-reports.py)
    - Schemas → workflow-builder/schemas/flowspec.v1.proto
  - Add a brief 1–2 sentence description for each section.

- docs/project/README.md
  - Add sections:
    - Purpose: describe planning workflow and artifacts.
    - Workflow: inbox → staged → in-progress → done (with one-liner definitions).
    - Task Naming: NN-title.task.md (e.g., 41-root-readme-refactor.task.md).
    - Task Structure: Context, Intent, Files (Create/Update/Delete), Steps, Acceptance Criteria, Evidence/Proof.
    - Template: link to docs/project/_TEMPLATE.task.md (from Task 46).
    - Links to subfolders.

- docs/project/inbox/README.md
  - Add:
    - Purpose: raw ideas and untriaged items.
    - How to Use: criteria to move an item to staged (clear intent, atomic scope, acceptance criteria).
    - Links: staged, template.

- docs/project/staged/README.md
  - Add:
    - Purpose: tasks ready to implement.
    - Checklist format for each task (short bullets).
    - Guidance on acceptance criteria and evidence/proof expectations.
    - Links: in-progress, template.

- docs/project/in-progress/README.md
  - Add:
    - Purpose: tasks currently being worked on.
    - Conventions: branch naming, linking PRs/issues, status updates.
    - Definition of done: move to done with proof (e.g., screenshots/diffs).

- docs/project/done/README.md
  - Add:
    - Purpose: archive of finished tasks.
    - What to include: proof artifacts (screenshots, markdown links), references to PRs.
    - How to browse: sorted by number prefix.

Implementation Steps
1) Update docs/README.md with a structured table of contents covering architecture, planning, context, reports, scripts, and schemas (short descriptions + links).
2) Update docs/project/README.md to document the task lifecycle and structure; include naming conventions and link to the template (created in Task 46).
3) Update each project subfolder README (inbox, staged, in-progress, done) with clear Purpose, How to Use, and Links sections; ensure consistent tone and capitalization.
4) Validate all relative links.
5) Commit: “docs: add docs index and standardize project folder READMEs”.

Acceptance Criteria
- docs/README.md functions as a clear index for all documentation areas.
- All project subfolder READMEs explain purpose, how to use, and link to the template and neighbors.
- Consistent formatting (headings, tone, capitalization) across all updated README files.
- All links work via relative paths.

Evidence/Proof
- Screenshots or copy/paste of the updated section headings for each README.
- Link check results (manual or linter) showing no broken links.
