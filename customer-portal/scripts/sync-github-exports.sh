#!/usr/bin/env bash
# Refresh local GitHub snapshots for agents (issues + milestones).
# Requires: gh CLI, authenticated (gh auth status).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: gh not found. Install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

REPO="${GITHUB_REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)}"
if [[ -z "$REPO" ]]; then
  echo "error: could not detect repo. Set GITHUB_REPO=owner/name or run from a git repo linked to GitHub." >&2
  exit 1
fi

mkdir -p "$ROOT/exports"

echo "Syncing issues from $REPO ..."
gh issue list \
  --repo "$REPO" \
  --state all \
  -L 500 \
  --json assignees,author,body,closedAt,createdAt,labels,milestone,number,state,title,updatedAt,url \
  > "$ROOT/exports/github-issues.json"

echo "Syncing milestones from $REPO ..."
gh api "repos/$REPO/milestones?state=all&per_page=100" > "$ROOT/exports/github-milestones.json"

echo "Wrote exports/github-issues.json and exports/github-milestones.json"
