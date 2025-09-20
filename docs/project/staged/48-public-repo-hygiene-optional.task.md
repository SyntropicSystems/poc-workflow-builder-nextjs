# 48 — Public Repo Hygiene (License, Contributing, Security) — Optional but Recommended

Context
- For a polished public/portfolio repository, standard OSS hygiene files help set expectations and improve credibility.
- Adding these is optional for now, but recommended:
  - LICENSE (MIT suggested)
  - CONTRIBUTING.md (how to propose changes)
  - SECURITY.md (how to report vulnerabilities)

Intent
- Provide minimal-yet-complete open-source hygiene docs.
- Link them from the root README (once refactored as part of Task 41).

Files (Create/Update/Delete)
- CREATE: LICENSE
- CREATE: CONTRIBUTING.md
- CREATE: SECURITY.md
- UPDATE: README.md (root) — add links to these documents in a “Meta” or “Contributing” section

Per-file Changes (exact)
- LICENSE
  - Use MIT license text with correct year and owner (Syntropic Systems or your preferred name).
  - Template line items:
    - Copyright (c) YYYY Your Name/Org
    - Standard MIT grant and disclaimer text.

- CONTRIBUTING.md
  - Sections to include:
    - Overview: expectations for contributors.
    - Getting Started:
      - Use `pnpm` for package management.
      - Run dev: `cd workflow-builder && pnpm install && pnpm dev`.
      - Run tests: `cd workflow-builder && pnpm test`.
      - Generate reports: `cd workflow-builder && python3 scripts/generate-all-reports.py`.
    - Branching and PRs:
      - Suggested branch naming: `feature/<short-desc>` or `docs/<short-desc>`.
      - Open PRs with a link to the relevant task document in `docs/project/staged` or `in-progress`.
    - Task Flow:
      - Follow the task template: `docs/project/_TEMPLATE.task.md`.
      - Use lifecycle: inbox → staged → in-progress → done.
    - Code Style:
      - TypeScript best practices, immutable updates, strict API boundary.
      - No framework deps in `workflow-core`.
    - Communication:
      - File issues for proposals; link to tasks in issues if public tracker is used.

- SECURITY.md
  - Sections to include:
    - Supported Versions: “main” is the active development line.
    - Reporting a Vulnerability:
      - Preferred method (email or GitHub Security Advisories).
      - Expected response window (e.g., within 7 business days).
    - Disclosure policy (responsible disclosure; coordinate before publicizing).
    - Minimal scope/attack surface note (local-first app).

- README.md (root)
  - Add “Contributing & License” section:
    - Links to `CONTRIBUTING.md`, `SECURITY.md`, and `LICENSE`.
    - 1–2 line summary and expectations.

Implementation Steps
1) Create LICENSE with MIT text, set the correct year and owner.
2) Create CONTRIBUTING.md with the sections above; include key commands and task flow links.
3) Create SECURITY.md with reporting instructions and expectations.
4) Update root README.md to add a short “Contributing & License” section linking to the three docs.
5) Proofread all new docs; verify relative links.
6) Commit: “docs(oss): add LICENSE, CONTRIBUTING, SECURITY and link from README”.

Acceptance Criteria
- LICENSE (MIT) present with correct copyright.
- CONTRIBUTING.md clearly explains task workflow, commands, and PR expectations.
- SECURITY.md explains vulnerability reporting and basic policy.
- Root README links to all three.
- All links resolve correctly.

Evidence/Proof
- Screenshots or snippets of headers for LICENSE, CONTRIBUTING.md, SECURITY.md.
- Root README section showing the new links.
