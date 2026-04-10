#!/usr/bin/env bash
# Run after every Portal 2.0 task / wave completes (actual order below):
#   1) Refresh customer-portal/ops/exports/github-issues.json (+ milestones)
#   2) Upload customer-portal/cms → HubSpot Design Manager, theme name $HUBSPOT_THEME_DEST (default: hair-solutions-portal)
#   3) Commit + push git (ancestor **hubspot/** repo when present) — only when you pass a commit message as the first argument
#
# Usage (from 99-development/design-manager/):
#   bash customer-portal/ops/scripts/portal_task_complete.sh "chore(portal): describe the task"
#   bash customer-portal/ops/scripts/portal_task_complete.sh --build-first "chore(portal): msg"
#   PORTAL_BUILD_FIRST=1 bash customer-portal/ops/scripts/portal_task_complete.sh "msg"
#   bash customer-portal/ops/scripts/portal_task_complete.sh   # issues + HubSpot only; git skipped
#   SKIP_HUBSPOT=1 bash customer-portal/ops/scripts/portal_task_complete.sh "docs: ..."
#   SKIP_GIT=1 bash customer-portal/ops/scripts/portal_task_complete.sh "wip"
#
# From hubspot/ root (1Password):
#   bash scripts/op_run.sh bash 99-development/design-manager/customer-portal/ops/scripts/portal_task_complete.sh "msg"
#
# HubSpot: theme dir customer-portal/cms/; CLI default ~/.hscli/config.yml; optional local hubspot.config.yml (gitignored).
# Publish vs draft: uploads use -m / --cms-publish-mode (default publish). Override with:
#   HUBSPOT_CMS_PUBLISH_MODE=draft bash customer-portal/ops/scripts/portal_task_complete.sh
# Secrets: bash customer-portal/ops/scripts/op_env.sh bash customer-portal/ops/scripts/portal_task_complete.sh "msg"
#   or from design-manager: op run --env-file ../../.env.op --env-file ../../.env -- bash customer-portal/ops/scripts/portal_task_complete.sh "msg"
set -euo pipefail

# HubSpot CLI: newer releases use `hs cms upload`; older use top-level `hs upload`.
# Theme may be flat (theme.json at root) or legacy layout with a `src/` folder.
# Note: `hs theme` has no "publish" subcommand — publishing is upload with -m publish (HubSpot default).
portal_hs_theme_upload() {
  local theme_dir="$1" dest="$2"
  local upload_path help errf mode
  mode="${HUBSPOT_CMS_PUBLISH_MODE:-publish}"
  if [[ "$mode" != "publish" && "$mode" != "draft" ]]; then
    echo "portal_task_complete: HUBSPOT_CMS_PUBLISH_MODE must be publish or draft (got: $mode)" >&2
    exit 1
  fi
  if [[ -d "$theme_dir/src" ]]; then
    upload_path="src"
  else
    upload_path="."
  fi
  help="$(cd "$theme_dir" && hs cms upload --help 2>&1)" || true
  if echo "$help" | grep -qE 'Upload a folder|Positionals:|\[src\]'; then
    (cd "$theme_dir" && hs cms upload "$upload_path" "$dest" -m "$mode")
    return
  fi
  errf="$(mktemp "${TMPDIR:-/tmp}/hs-upload.XXXXXX")"
  if (cd "$theme_dir" && hs upload "$upload_path" "$dest" -m "$mode" 2>"$errf"); then
    rm -f "$errf"
    return 0
  fi
  if grep -qiE 'cms upload|Did you mean' "$errf" 2>/dev/null; then
    cat "$errf" >&2
    rm -f "$errf"
    (cd "$theme_dir" && hs cms upload "$upload_path" "$dest" -m "$mode")
  else
    cat "$errf" >&2
    rm -f "$errf"
    return 1
  fi
}

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"

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
  bash "$SCRIPT_DIR/portal_build.sh"
fi

if [[ "$SKIP_ISSUES" != "1" ]]; then
  bash "$SCRIPT_DIR/sync-github-exports.sh"
fi

THEME_DIR="$REPO_ROOT/customer-portal/cms"
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
    echo "      To commit: bash customer-portal/ops/scripts/portal_task_complete.sh \"feat(portal): your summary\"" >&2
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
