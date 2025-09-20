# 41 — Root README Refactor (Public-Ready Landing Page)

Context
- Current root README.md contains deep architecture content. For a public/portfolio-ready repo, the root should prioritize a concise overview, quick start, and navigation, while moving long-form technical content into docs.
- Architecture content should live under docs/architecture and be linked from root.

Intent
- Transform the root README into a polished landing page focused on:
  - Elevator pitch and project goals
  - Quick start (install/run/test)
  - Repository structure and links to docs/reports
- Relocate long-form content (architecture diagrams, principles, module structure, data flow, risks) into docs/architecture/OVERVIEW.md.
- Expand docs/README.md to serve as an index to the documentation set.

Files (Create/Update/Delete)
- UPDATE: README.md (root) — concise, portfolio-ready landing page
- CREATE: docs/architecture/OVERVIEW.md — deep architecture write-up moved from root
- UPDATE: docs/README.md — proper documentation index with links

Per-file Changes (exact)
- README.md (root) — Replace with:
  - Title and one-paragraph elevator pitch explaining “local-first workflow builder POC with Rust-ready design”
  - Project goals:
    - Rapidly explore a workflow builder POC
    - Demonstrate clean, structured AI-assisted development (plan → implement → integrate)
    - Focus on UX/UI and API boundaries so the core can later be rebuilt in Rust/Python and integrated into microservices
  - Quick Start:
    - Prereqs: Node 18+, pnpm
    - Commands:
      - pnpm install
      - pnpm dev
      - Open http://localhost:3000
    - Testing:
      - pnpm test (Vitest)
  - Repo Structure (top-level only):
    - docs/ (docs + project plans)
    - workflow-builder/ (Next.js app + core library, scripts, reports)
  - Key Links:
    - Architecture Overview → docs/architecture/OVERVIEW.md
    - Documentation Index → docs/README.md
    - Reports Overview → workflow-builder/reports/README.md
  - License/Contributing (link placeholders if added later)
  - Remove/relocate existing “Architecture Overview & System Design” wall-of-text from root; move to docs/architecture/OVERVIEW.md.

- docs/architecture/OVERVIEW.md (new) — Port and organize existing architecture sections from root README:
  - Core Architecture Decisions
  - System Architecture diagram
  - Key Design Principles
  - Module Structure
  - Data Flow Architecture
  - Critical Success Factors
  - Risk Mitigation
  - Notes:
    - Keep diagrams/code blocks intact.
    - Ensure headings are clean and scannable.
    - Link back to root README for Quick Start and to reports for analysis.

- docs/README.md — Replace the single-line placeholder with an index:
  - Architecture
    - docs/architecture/OVERVIEW.md
  - Project Planning
    - docs/project/README.md (and subfolders: inbox, staged, in-progress, done)
  - Context Packages
    - docs/context/README.md
  - Reports and Analysis
    - workflow-builder/reports/README.md
  - Developer Scripts
    - workflow-builder/scripts/* (mention generate-all-reports.py)
  - Schemas
    - workflow-builder/schemas/flowspec.v1.proto
  - Provide brief 1–2 line descriptions for each section.

Implementation Steps
1) Create docs/architecture/OVERVIEW.md:
   - Copy architecture-related sections currently in README.md (Core Decisions, System Architecture diagram, Principles, Module Structure, Data Flow, Critical Success Factors, Risk Mitigation).
   - Adjust internal links if any; ensure relative paths are correct.
2) Update README.md (root):
   - Replace content with landing-page structure described above.
   - Add clear links to docs/architecture/OVERVIEW.md, docs/README.md, and workflow-builder/reports/README.md.
3) Update docs/README.md:
   - Provide a proper docs index with links and short descriptions for each area.
4) Run markdown linter (if available) or self-check for heading consistency and link correctness.
5) Commit with message: “docs: refactor root README into landing page; add architecture overview; expand docs index”.

Acceptance Criteria
- Root README is concise, portfolio-appropriate, and does not include deep architecture prose.
- docs/architecture/OVERVIEW.md contains the technical architecture material previously in root.
- docs/README.md provides a clear documentation index with working links.
- All links and relative paths are validated (no broken links).
- Style is consistent (headings, tone, capitalization).

Evidence/Proof
- Before/after diff of README.md
- Screenshot or copy of docs/architecture/OVERVIEW.md top headings
- Click-through validation of links in README.md and docs/README.md
