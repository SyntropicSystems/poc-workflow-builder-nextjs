#!/usr/bin/env python3
"""
verify-repo-hygiene.py

Repeatable repository hygiene and secret-safety checks for public release.

Checks:
  - Content regex scans for common secret/token patterns
  - Path-based detection of sensitive filenames (.env, key/cert files)
  - Advisory check: required .gitignore entries present

Exit codes:
  0 = clean
  1 = findings detected (content or filenames)

Usage:
  python3 scripts/verify-repo-hygiene.py
  python3 scripts/verify-repo-hygiene.py --ci
  python3 scripts/verify-repo-hygiene.py --json
  python3 scripts/verify-repo-hygiene.py --exclude "docs/**,**/*.png"
"""

import argparse
import fnmatch
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

# Default directories to skip
DEFAULT_DIR_EXCLUDES = {
    ".git",
    "node_modules",
    ".next",
    ".turbo",
    ".vercel",
    "dist",
    "build",
    "coverage",
    ".cache",
    ".venv",
    "venv",
    "__pycache__",
}

# Regex patterns for content scanning
PATTERNS: List[Tuple[str, re.Pattern]] = [
    # Private keys and certificates
    ("PRIVATE_KEY", re.compile(r"-----BEGIN (?:OPENSSH |RSA |EC |DSA )?PRIVATE KEY-----")),
    ("CERTIFICATE", re.compile(r"-----BEGIN CERTIFICATE-----")),
    # AWS keys (AccessKeyId)
    ("AWS_KEY", re.compile(r"\bA(?:KI|SI)A[0-9A-Z]{16}\b")),
    # GitHub tokens
    ("GITHUB_GHP", re.compile(r"ghp_[A-Za-z0-9]{36}")),
    ("GITHUB_PAT", re.compile(r"github_pat_[A-Za-z0-9_]{80,}")),
    # JWT-like structure
    ("JWT_LIKE", re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}")),
    # Slack tokens
    ("SLACK_TOKEN", re.compile(r"xox[baprs]-[A-Za-z0-9-]{10,}")),
    # Generic secret-y assignments (string literal on the right)
    ("GENERIC_SECRET_ASSIGN", re.compile(r"(?i)\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*['\"][^'\"\n]{8,}['\"]")),
]

# Sensitive filenames
SENSITIVE_NAME_GLOBS = [
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "*.p12",
    "id_rsa",
    "id_ecdsa",
    "id_ed25519",
]

# Advisory .gitignore entries that should exist at repo root
RECOMMENDED_GITIGNORE_LINES = [
    # Node/Next outputs
    "node_modules/",
    ".next/",
    "out/",
    "dist/",
    "build/",
    ".turbo/",
    ".vercel/",
    "coverage/",
    "*.tsbuildinfo",
    # Logs
    "*.log",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    "pnpm-debug.log*",
    # Env and secrets
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "*.p12",
    "id_rsa",
    "id_ecdsa",
    "id_ed25519",
    # Caches
    ".cache/",
]


def is_binary_file(sample: bytes) -> bool:
    # Null byte heuristic
    if b"\x00" in sample:
        return True
    # Heuristic: many non-text bytes
    text_chars = bytearray({7, 8, 9, 10, 12, 13, 27} | set(range(0x20, 0x100)))
    nontext = sample.translate(None, text_chars)
    return len(nontext) > max(32, len(sample) * 0.30)


def iter_repo_files(root: Path, user_excludes: List[str]) -> Iterable[Path]:
    """
    Walk repo root and yield paths to scan, honoring default dir excludes and user glob excludes.
    """
    root = root.resolve()
    # Precompile user exclude patterns
    def is_excluded(path: Path) -> bool:
        rel = str(path.relative_to(root))
        for pat in user_excludes:
            if fnmatch.fnmatch(rel, pat):
                return True
        return False

    for dirpath, dirnames, filenames in os.walk(root):
        # Prune default excludes by directory name
        dirnames[:] = [
            d for d in dirnames
            if d not in DEFAULT_DIR_EXCLUDES and not is_excluded(Path(dirpath, d))
        ]
        # Yield files
        for name in filenames:
            p = Path(dirpath, name)
            if is_excluded(p):
                continue
            yield p


def scan_file_for_patterns(path: Path, patterns: List[Tuple[str, re.Pattern]], max_line_len: int = 2000) -> List[Dict]:
    """
    Scan text file for regex pattern matches. Returns list of findings with line number/context.
    """
    findings: List[Dict] = []
    try:
        with open(path, "rb") as f:
            sample = f.read(4096)
            if is_binary_file(sample):
                return findings  # skip binary
        # Now safe to read as text
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for i, line in enumerate(f, start=1):
                # Avoid extremely long lines (minify), but still scan within truncated line
                line_to_scan = line[:max_line_len]
                for rule, rx in patterns:
                    if rx.search(line_to_scan):
                        findings.append({
                            "path": str(path),
                            "line": i,
                            "rule": rule,
                            "snippet": line_to_scan.strip()[:500],
                        })
    except Exception as e:
        # Non-fatal; report as advisory
        findings.append({
            "path": str(path),
            "line": 0,
            "rule": "READ_ERROR",
            "snippet": f"{e.__class__.__name__}: {e}",
        })
    return findings


def match_sensitive_names(path: Path, root: Path) -> List[Dict]:
    rel = str(path.relative_to(root))
    hits = []
    for pat in SENSITIVE_NAME_GLOBS:
        if fnmatch.fnmatch(rel, pat) or fnmatch.fnmatch(path.name, pat):
            hits.append({"path": rel, "reason": f"matches '{pat}'"})
            break
    return hits


def check_gitignore_advisory(root: Path) -> List[str]:
    """
    Returns list of recommended entries that are missing in the root .gitignore (advisory only).
    """
    ig = root / ".gitignore"
    if not ig.exists():
        # If no .gitignore, recommend all
        return RECOMMENDED_GITIGNORE_LINES.copy()
    try:
        existing = ig.read_text(encoding="utf-8", errors="ignore").splitlines()
        existing = [line.strip() for line in existing if line.strip() and not line.strip().startswith("#")]
        missing = [line for line in RECOMMENDED_GITIGNORE_LINES if line not in existing]
        return missing
    except Exception:
        # If unreadable, skip advisory
        return []
        

def main() -> int:
    parser = argparse.ArgumentParser(description="Verify repository hygiene and secrets before public release.")
    parser.add_argument("--ci", action="store_true", help="Terse output and non-zero exit when findings exist.")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of human-readable output.")
    parser.add_argument("--exclude", type=str, default="", help="Comma-separated globs to exclude (relative to repo root).")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    user_excludes = [pat.strip() for pat in args.exclude.split(",") if pat.strip()]

    content_findings: List[Dict] = []
    filename_findings: List[Dict] = []

    for p in iter_repo_files(repo_root, user_excludes):
        # Sensitive filename matches
        filename_findings.extend(match_sensitive_names(p, repo_root))
        # Content scans
        content_findings.extend(scan_file_for_patterns(p, PATTERNS))

    advisory_missing_ignores = check_gitignore_advisory(repo_root)

    result = {
        "root": str(repo_root),
        "content_matches": content_findings,
        "sensitive_filenames": filename_findings,
        "gitignore_advice": advisory_missing_ignores,  # advisory only
        "total_content_matches": len(content_findings),
        "total_sensitive_filenames": len(filename_findings),
        "advisory_missing_gitignore": len(advisory_missing_ignores),
        "status": "clean" if not content_findings and not filename_findings else "findings",
    }

    exit_code = 0 if result["status"] == "clean" else 1

    if args.json:
        print(json.dumps(result, indent=2))
        return exit_code

    # Human-readable output
    if args.ci:
        if exit_code == 0:
            print("Hygiene: OK (no findings).")
        else:
            print(f"Hygiene: FINDINGS (content={len(content_findings)}, filenames={len(filename_findings)}).")
        return exit_code

    # Full report
    print(f"Repository hygiene report for {repo_root}")
    print("-" * 72)
    if content_findings:
        print(f"[!] Content matches ({len(content_findings)}):")
        for f in content_findings[:200]:
            print(f"  - {f['rule']}: {f['path']}:{f['line']} :: {f['snippet']}")
        if len(content_findings) > 200:
            print(f"  ... +{len(content_findings) - 200} more")
    else:
        print("[+] No content matches detected.")

    if filename_findings:
        print(f"[!] Sensitive filenames ({len(filename_findings)}):")
        for f in filename_findings:
            print(f"  - {f['path']} ({f['reason']})")
    else:
        print("[+] No sensitive filenames detected.")

    if advisory_missing_ignores:
        print(f"[i] Advisory: missing recommended .gitignore entries ({len(advisory_missing_ignores)}):")
        for line in advisory_missing_ignores:
            print(f"    - {line}")
    else:
        print("[+] Advisory: .gitignore looks complete for public release.")

    print("-" * 72)
    print("Status:", "CLEAN" if exit_code == 0 else "FINDINGS")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
