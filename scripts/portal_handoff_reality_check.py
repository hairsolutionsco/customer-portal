#!/usr/bin/env python3
"""
Compare GitHub issue state (exports/github-issues.json) to on-disk theme artifacts.

Prevents orchestrator drift: if the repo already contains deliverables but issues stay
OPEN, agents re-plan old work. Run after `npm run portal:issues` (or let portal_task_complete.sh run it).

Exit codes:
  0 — no drift, or export/manifest missing (non-fatal)
  1 — PORTAL_HANDOFF_STRICT=1 and at least one drift warning
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def root_dir() -> Path:
    env = os.environ.get("PORTAL_REPO_ROOT")
    if env:
        return Path(env).resolve()
    return Path(__file__).resolve().parent.parent


def load_issues_export(root: Path) -> dict[int, str] | None:
    path = root / "exports" / "github-issues.json"
    if not path.is_file():
        print(
            f"portal_handoff_reality_check: no {path} — run: npm run portal:issues",
            file=sys.stderr,
        )
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"portal_handoff_reality_check: invalid JSON in {path}: {e}", file=sys.stderr)
        return None
    if not isinstance(data, list):
        print(f"portal_handoff_reality_check: expected list in {path}", file=sys.stderr)
        return None
    out: dict[int, str] = {}
    for row in data:
        if not isinstance(row, dict):
            continue
        num = row.get("number")
        state = row.get("state")
        if isinstance(num, int) and isinstance(state, str):
            out[num] = state.upper()
    return out


def load_manifest(root: Path) -> list[dict]:
    path = root / "data" / "portal_issue_path_signals.json"
    if not path.is_file():
        print(f"portal_handoff_reality_check: missing manifest {path}", file=sys.stderr)
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"portal_handoff_reality_check: invalid manifest JSON: {e}", file=sys.stderr)
        return []
    signals = data.get("signals")
    if not isinstance(signals, list):
        return []
    return [s for s in signals if isinstance(s, dict)]


def paths_satisfied(root: Path, rel_paths: list[str], require_all: bool) -> bool:
    paths = [root / p for p in rel_paths]
    if require_all:
        return all(p.is_file() or p.is_dir() for p in paths)
    return any(p.is_file() or p.is_dir() for p in paths)


def main() -> int:
    root = root_dir()
    issues = load_issues_export(root)
    if issues is None:
        return 0

    warnings: list[str] = []
    for sig in load_manifest(root):
        raw_nums = sig.get("issues") or []
        if not isinstance(raw_nums, list):
            continue
        nums = [n for n in raw_nums if isinstance(n, int)]
        rel_paths = sig.get("paths") or []
        if not isinstance(rel_paths, list) or not all(isinstance(p, str) for p in rel_paths):
            continue
        require_all = bool(sig.get("require_all_paths", False))
        label = sig.get("label") or ",".join(f"#{n}" for n in nums)
        if not paths_satisfied(root, rel_paths, require_all):
            continue

        open_nums = [n for n in nums if issues.get(n) == "OPEN"]
        if not open_nums:
            continue

        paths_s = ", ".join(rel_paths)
        for n in open_nums:
            warnings.append(
                f"Issue #{n} is OPEN but repo already has artifact(s) for [{label}]: {paths_s}. "
                f"Close #{n} on GitHub (if AC met), run npm run portal:issues, then edit docs/AGENT_PROMPT.md "
                f"Next session only if priorities changed."
            )

    if not warnings:
        print("portal_handoff_reality_check: OK (no path-vs-issue drift for configured signals).")
        return 0

    print("", file=sys.stderr)
    print("portal_handoff_reality_check: DRIFT WARNING — repo vs GitHub issue state", file=sys.stderr)
    print("", file=sys.stderr)
    for w in warnings:
        print(f"  - {w}", file=sys.stderr)
    print("", file=sys.stderr)

    strict = os.environ.get("PORTAL_HANDOFF_STRICT", "").strip() in ("1", "true", "yes")
    return 1 if strict else 0


if __name__ == "__main__":
    sys.exit(main())
