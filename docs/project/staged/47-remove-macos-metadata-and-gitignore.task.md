# 47 — Remove macOS Metadata and Harden .gitignore

Context
- The repository includes stray macOS metadata files:
  - `docs/.DS_Store`
  - `docs/project/.DS_Store`
- These should not be tracked and should be ignored globally by Git in this repo to prevent noise and accidental commits. This is important for a clean public/portfolio presentation.

Intent
- Delete existing `.DS_Store` artifacts from the repository.
- Ensure future `.DS_Store` files are ignored by Git across all subfolders.
- Optionally document a user-level global ignore recommendation.

Files (Create/Update/Delete)
- DELETE: `docs/.DS_Store`
- DELETE: `docs/project/.DS_Store`
- UPDATE (or CREATE if missing): `.gitignore`

Per-file Changes (exact)
- `.gitignore`
  - Ensure the following entries exist (add if missing):
    ```
    # macOS
    .DS_Store
    **/.DS_Store
    ```
  - Optionally include common OS/editor junk if desired:
    ```
    # Windows
    Thumbs.db
    ehthumbs.db

    # Editors
    .idea/
    .vscode/
    ```

Implementation Steps
1) Delete committed macOS metadata:
   - Remove files from VCS (safe even if missing):
     - `git rm -f --cached docs/.DS_Store || true`
     - `git rm -f --cached docs/project/.DS_Store || true`
2) Update `.gitignore` at repo root:
   - Add `.DS_Store` and `**/.DS_Store` if not already present.
   - Optionally add other OS/editor ignores (see above).
3) Validate:
   - Run `git status` and confirm no `.DS_Store` files appear as tracked or untracked (ignored).
4) Commit:
   - Message: `chore: remove macOS metadata and harden .gitignore`
5) (Optional) Advise developer global gitignore:
   - `git config --global core.excludesFile ~/.gitignore_global`
   - Add `.DS_Store` to `~/.gitignore_global`.

Acceptance Criteria
- No `.DS_Store` files are tracked in the repository.
- `.gitignore` prevents future `.DS_Store` files from appearing as untracked.
- `git status` is clean of macOS metadata.
- Commit includes both deletion and ignore rule updates.

Evidence/Proof
- `git status` output showing no `.DS_Store` files tracked or untracked.
- Diff of `.gitignore` with the added ignore patterns.
