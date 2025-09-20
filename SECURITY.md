# Security Policy

## Supported Versions
- Active development occurs on the `main` branch.

## Reporting a Vulnerability
- Please open a GitHub issue in this repository with the label `security` to report suspected vulnerabilities.
- Do not include sensitive exploit details in a public issue. If details are sensitive, open a minimal issue first and note that you’d like to share more privately; a maintainer will respond with next steps.
- We aim to respond within 7 business days.

## Disclosure Policy
- Follow responsible disclosure principles. Coordinate with maintainers before publicizing vulnerabilities or proof‑of‑concept exploits.
- Avoid posting payloads that could impact others if reused as‑is.

## Scope / Notes
- This is a local‑first application that runs in the browser using the File System Access API. There is no server‑side component in this repository.
- When testing, use only files and directories that you own and have permission to access.

## Agentic AI Security and Prompt Injection Mitigations

### Why This Matters
Agentic tools (e.g., Cline, Claude Code, Cursor, and similar) can read repositories, propose changes, run commands, and access the network. Public repositories and external content can contain adversarial instructions (prompt injections) that attempt to:
- Exfiltrate secrets (tokens, cookies, .env)
- Disable tests/linters/CI or bypass review
- Alter git remotes or add postinstall hooks
- Write outside the repo or upload data externally
- Introduce backdoors into code or workflows

### Threat Model (Recognize These Patterns)
- Malicious instructions embedded in README, PRs/issues/comments, commit messages, test fixtures/snapshots, or scripts.
- External URLs fetched by agents (docs, blogs, gists) that include hidden instructions.
- Requests to disclose credentials or system information, to fetch and execute unknown scripts, or to modify security‑sensitive files (CI, package.json scripts, shell profiles).

### Core Mitigations (Tool‑Agnostic)
- Least privilege:
  - Use read‑only tokens unless write access is explicitly required for the current task.
  - Never store secrets in the repo. Run secret scans (e.g., gitleaks/trufflehog). Rotate any exposed credentials.
- Approvals and dry runs:
  - Require explicit approval for destructive or privileged operations (installs, network ops, file deletions).
  - Prefer diffs/dry‑runs first; review proposed edits before accepting.
- Execution controls:
  - Disable or restrict network access when unnecessary; avoid fetching untrusted URLs.
  - Do not auto‑run repository scripts (e.g., postinstall) without inspection.
  - Constrain file operations to the project tree; block writes to home/system paths.
- Safe reads:
  - Treat repository content and fetched pages as untrusted. Do not follow embedded instructions without human review.
  - Do not paste untrusted content directly into terminals or shells.
- Logging and audit:
  - Keep an audit trail of agent actions (commands executed, files changed).
  - Use small, atomic commits to simplify review and rollback.

### Tool‑Specific Guidance
- Cline
  - Use Plan Mode for discovery. Only switch to Act Mode for scoped implementation.
  - Keep requires_approval=true for network/package/deletion commands.
  - Validate replace_in_file SEARCH blocks and file paths; avoid broad, wildcard edits.
  - Avoid browser_action on untrusted URLs; never execute downloaded scripts.
  - Limit execute_command scope to the repository; avoid commands that change git remotes or write outside the project.
- Claude Code
  - Turn off auto‑apply changes. Manually review diffs before applying.
  - Disable terminal auto‑run; copy commands to a shell and review first.
  - Avoid opening/processing untrusted external URLs; if needed, treat output as untrusted.
- Cursor (and similar IDE agents)
  - Disable “auto‑commit/apply” flows; stage and review changes manually.
  - Restrict workspace trust; review postinstall hooks and script changes.
  - Carefully review broad refactors touching tests, scripts, or CI.

### Operational Safeguards for Public Repos
- Protect main branch; require PR review for non‑docs changes.
- Add CODEOWNERS for workflows, scripts, and package manifests.
- CI enforcement:
  - Run static checks and tests on PRs; block merges if checks fail.
  - Optionally run secret scanners on PRs.
- Secure defaults:
  - .gitignore OS/editor files and .env; never commit secrets.
  - Minimize GitHub Actions permissions (GITHUB_TOKEN least privilege).

### Red Flags Checklist
- [ ] Request to reveal tokens, cookies, SSH keys, or .env
- [ ] Fetching/executing from untrusted URLs
- [ ] Modifying CI, package.json scripts, git remotes, or adding postinstall hooks
- [ ] Writing outside this repository
- [ ] Disabling tests/linters/CI without strong justification
- [ ] Very broad replace affecting many files without clear review

### Incident Response
- Revert suspicious commits immediately.
- Rotate any exposed credentials/tokens.
- Open an issue documenting the vector (injection source, logs, diffs).
- Add new guardrails (denylist patterns, CI checks) to prevent recurrence.
