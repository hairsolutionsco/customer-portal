#!/usr/bin/env bash
# Run after every Portal 2.0 task / wave completes (actual order below):
#   1) Refresh exports/github-issues.json (+ milestones)
#   2) Upload hair-solutions-portal/src → HubSpot Design Manager, theme name $HUBSPOT_THEME_DEST (default: hair-solutions-portal)
#   3) Commit + push git (this repo) — only when you pass a commit message as the first argument
#
# Usage:
#   ./scripts/portal_task_complete.sh "chore(portal): describe the task"   # full ritual incl. git
#   ./scripts/portal_task_complete.sh --build-first "chore(portal): msg"   # run portal_build.sh first
#   PORTAL_BUILD_FIRST=1 ./scripts/portal_task_complete.sh "msg"            # same as --build-first
#   ./scripts/portal_task_complete.sh   # issues + HubSpot only; git skipped (IDE-friendly)
#   SKIP_HUBSPOT=1 ./scripts/portal_task_complete.sh "docs: ..."
#   SKIP_GIT=1 ./scripts/portal_task_complete.sh "wip"   # issues + HubSpot only (explicit)
#
# HubSpot: runs theme upload from hair-solutions-portal/ using the CLI default account
# (~/.hscli/config.yml). Optional local hair-solutions-portal/hubspot.config.yml (gitignored)
# is not required when global auth is configured.
# Run via 1Password injection (secrets live in 00-engineering/.env — do not cat/commit):
#   ./scripts/op_env.sh ./scripts/portal_task_complete.sh "msg"
# Manual equivalent from this directory:
#   op run --env-file ../../.env.op --env-file ../../.env -- ./scripts/portal_task_complete.sh "msg"
set -euo pipefail

# HubSpot CLI: newer releases use `hs cms upload`; older use top-level `hs upload`.
portal_hs_theme_upload() {
  local theme_dir="$1" dest="$2"
  local help errf
  help="$(cd "$theme_dir" && hs cms upload --help 2>&1)" || true
  if echo "$help" | grep -qE 'Upload a folder|Positionals:|\[src\]'; then
    (cd "$theme_dir" && hs cms upload src "$dest")
    return
  fi
  errf="$(mktemp "${TMPDIR:-/tmp}/hs-upload.XXXXXX")"
  if (cd "$theme_dir" && hs upload src "$dest" 2>"$errf"); then
    rm -f "$errf"
    return 0
  fi
  if grep -qiE 'cms upload|Did you mean' "$errf" 2>/dev/null; then
    cat "$errf" >&2
    rm -f "$errf"
    (cd "$theme_dir" && hs cms upload src "$dest")
  else
    cat "$errf" >&2
    rm -f "$errf"
    return 1
  fi
}

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SKIP_ISSUES="${SKIP_ISSUES:-0}"
SKIP_GIT="${SKIP_GIT:-0}"
SKIP_HUBSPOT="${SKIP_HUBSPOT:-0}"
BUILD_FIRST="${PORTAL_BUILD_FIRST:-0}"
COMMIT_MSG=""

for arg in "$@"; do
  case "$arg" in
    --skip-issues) SKIP_ISSUES=1 ;;
    --skip-git) SKIP_GIT=1 ;;
    --skip-hubspot) SKIP_HUBSPOT=1 ;;
    --issues-only) SKIP_GIT=1; SKIP_HUBSPOT=1 ;;
    --build-first) BUILD_FIRST=1 ;;
    *)
      if [[ "$arg" == --* ]]; then
        echo "portal_task_complete: unknown flag: $arg" >&2
        exit 1
      fi
      if [[ -z "$COMMIT_MSG" ]]; then
        COMMIT_MSG="$arg"
      else
        COMMIT_MSG="$COMMIT_MSG $arg"
      fi
      ;;
  esac
done

if [[ "$BUILD_FIRST" == "1" ]]; then
  echo "portal_task_complete: running portal_build.sh ..."
  bash "$ROOT/scripts/portal_build.sh"
fi

if [[ "$SKIP_ISSUES" != "1" ]]; then
  bash "$ROOT/scripts/sync-github-exports.sh"
fi

THEME_DIR="$ROOT/hair-solutions-portal"
THEME_DEST="${HUBSPOT_THEME_DEST:-hair-solutions-portal}"

if [[ "$SKIP_HUBSPOT" != "1" ]]; then
  if ! command -v hs >/dev/null 2>&1; then
    echo "warn: hs (HubSpot CLI) not in PATH — skipping Design Manager upload" >&2
  elif ! (cd "$THEME_DIR" && hs accounts list >/dev/null 2>&1); then
    echo "warn: HubSpot CLI has no working account (try: hs account auth) — skipping upload" >&2
  else
    echo "Uploading theme to HubSpot ($THEME_DEST) ..."
    portal_hs_theme_upload "$THEME_DIR" "$THEME_DEST"
    echo "HubSpot upload finished."
  fi
else
  echo "Skipping HubSpot upload (SKIP_HUBSPOT or --skip-hubspot)."
fi

if [[ "$SKIP_GIT" != "1" ]]; then
  if [[ -z "$COMMIT_MSG" ]]; then
    echo ""
    echo "WARN: No commit message — skipping git add/commit/push (issues + HubSpot steps already ran)." >&2
    echo "      To commit: ./scripts/portal_task_complete.sh \"feat(portal): your summary\"" >&2
    echo ""
  else
  git add -A
  if git diff --cached --quiet; then
    echo "Git: nothing to commit (exports may be unchanged and no other edits)."
  else
    git commit -m "$COMMIT_MSG"
  fi
  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$current_branch" != "HEAD" ]]; then
    git push -u origin "$current_branch" 2>/dev/null || git push
  fi
  echo "Git push complete (branch: $current_branch)."
  fi
else
  echo "Skipping git (SKIP_GIT or --skip-git / --issues-only)."
fi

echo "portal_task_complete.sh done."
