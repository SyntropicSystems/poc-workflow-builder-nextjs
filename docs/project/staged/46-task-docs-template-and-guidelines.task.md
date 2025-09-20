# 46 — Task Docs Template and Authoring Guidelines

Context
- Task documentation is central to showing structured AI-assisted development (plan → implement → integrate).
- Current project benefits from a consistent, repeatable template for every task, plus brief guidelines to keep tasks atomic and high-signal.

Intent
- Provide a canonical template for all task documents.
- Document naming conventions, required sections, and quality guidelines.
- Link the template prominently from docs/project/README.md.

Files (Create/Update/Delete)
- CREATE: docs/project/_TEMPLATE.task.md
- UPDATE: docs/project/README.md (link to template and summarize guidelines)

Per-file Changes (exact)
- docs/project/_TEMPLATE.task.md (new)
  - Replace entire file with the following template (verbatim):

    ---
    # NN — Title of Task

    Context
    - Briefly describe the background and why this matters (1–5 bullets)

    Intent
    - What will this task accomplish? (concise bullets)

    Files (Create/Update/Delete)
    - CREATE: path/to/file
    - UPDATE: path/to/file
    - DELETE: path/to/file

    Per-file Changes (exact)
    - path/to/file
      - Bullet the specific changes to make in this file
      - Include any structural moves or link updates
    - path/to/another-file
      - …

    Implementation Steps
    1) Specific step
    2) Specific step
    3) Specific step

    Acceptance Criteria
    - Observable criteria to verify completion
    - Links resolve, tests pass, lint clean, etc.

    Evidence/Proof
    - Screenshots, diffs, or CLI outputs to attach or reference

    Notes (optional)
    - Risks, alternatives considered, or follow-ups
    ---

- docs/project/README.md
  - Add or expand sections to include:
    - Workflow overview: inbox → staged → in-progress → done
    - Naming convention: `NN-title.task.md` (NN = ordered integer)
    - Link to the template: `docs/project/_TEMPLATE.task.md`
    - Summary of guidelines (see below)

Authoring Guidelines (to include in docs/project/README.md)
- Keep tasks atomic: one coherent change set per task.
- Always list Files and use Per-file Changes to be explicit (create/update/delete).
- Include Acceptance Criteria that are externally verifiable.
- Prefer concise steps and link to deeper docs for background.
- Use relative links and validate them locally.
- When code changes affect docs or tests, update both in the same task or create follow-ups.

Implementation Steps
1) Create docs/project/_TEMPLATE.task.md with the template content above.
2) Update docs/project/README.md:
   - Add link to the template.
   - Document naming convention and lifecycle (inbox → staged → in-progress → done).
   - Summarize the Authoring Guidelines.
3) Proofread for clarity and consistency (headings, capitalization).
4) Commit: “docs: add task template and authoring guidelines; link from project docs”.

Acceptance Criteria
- A reusable template exists at docs/project/_TEMPLATE.task.md.
- docs/project/README.md links to the template and documents conventions/guidelines.
- The template covers Context, Intent, Files, Per-file Changes, Steps, Acceptance Criteria, Evidence.
- Language is concise and actionable.

Evidence/Proof
- Screenshot or snippet of docs/project/_TEMPLATE.task.md top headings.
- Link from docs/project/README.md to the template is clickable and correct.
