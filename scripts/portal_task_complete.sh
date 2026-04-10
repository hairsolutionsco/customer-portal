#!/usr/bin/env bash
# Run after every Portal 2.0 task / wave completes (actual order below):
#   1) Refresh exports/github-issues.json (+ milestones)
#   2) Upload theme → HubSpot Design Manager (canonical: ./cms/; fallback: hair-solutions-portal)
#   3) Commit + push git (this repo) — only when you pass a commit message as the first argument
#
# Usage:
#   ./scripts/portal_task_complete.sh "chore(portal): describe the task"
#   ./scripts/portal_task_complete.sh --build-first "chore(portal): msg"
#   PORTAL_BUILD_FIRST=1 ./scripts/portal_task_complete.sh "msg"
#   ./scripts/portal_task_complete.sh   # issues + HubSpot only; git skipped
#   SKIP_HUBSPOT=1 ./scripts/portal_task_complete.sh "docs: ..."
#   SKIP_GIT=1 ./scripts/portal_task_complete.sh "wip"
#
# HubSpot CLI v8+: `hs cms upload [src] [dest] -m draft|publish`
# Legacy v7: `hs upload ... -m draft|publish`
# Prefer repo-local: `npm install` adds @hubspot/cli → node_modules/.bin/hs
# Override: HUBSPOT_HS_BIN=/path/to/hs
#
# Run via 1Password injection:
#   ./scripts/op_env.sh ./scripts/portal_task_complete.sh "msg"
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

portal_resolve_hs_bin() {
  if [[ -n "${HUBSPOT_HS_BIN:-}" ]]; then
    printf '%s\n' "$HUBSPOT_HS_BIN"
    return
  fi
  local local_hs="$ROOT/node_modules/.bin/hs"
  if [[ -x "$local_hs" ]]; then
    printf '%s\n' "$local_hs"
    return
  fi
  printf '%s\n' "hs"
}

portal_hs_has_cms_upload() {
  local bin="$1"
  "$bin" cms upload --help 2>&1 | grep -qE 'cms-publish-mode|\[src\].*\[dest\]'
}

portal_hs_version_line() {
  local bin="$1"
  local pkg="$ROOT/node_modules/@hubspot/cli/package.json"
  if [[ "$bin" == "$ROOT/node_modules/.bin/hs" && -f "$pkg" ]]; then
    node -e "console.log('npm @hubspot/cli ' + require(process.argv[1]).version)" "$pkg" 2>/dev/null || echo "npm @hubspot/cli (local)"
    return
  fi
  "$bin" --version 2>/dev/null | head -1 || echo "version unknown"
}

portal_hs_theme_upload() {
  local theme_dir="$1" dest="$2"
  local upload_path mode hs_bin
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

  hs_bin="$(portal_resolve_hs_bin)"
  if portal_hs_has_cms_upload "$hs_bin"; then
    echo "portal_task_complete: HubSpot CLI — $(portal_hs_version_line "$hs_bin"); using hs cms upload -m $mode"
    (cd "$theme_dir" && "$hs_bin" cms upload "$upload_path" "$dest" -m "$mode")
    return 0
  fi

  echo "portal_task_complete: no hs cms upload — falling back to hs upload (npm i -D @hubspot/cli@^8 for cms upload)" >&2
  if ! "$hs_bin" upload --help 2>&1 | grep -qE 'Upload a folder|Positionals:'; then
    echo "portal_task_complete: ERROR: neither hs cms upload nor hs upload available (bin=$hs_bin)" >&2
    return 1
  fi
  (cd "$theme_dir" && "$hs_bin" upload "$upload_path" "$dest" -m "$mode")
}

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

if [[ -f "$ROOT/cms/theme.json" ]]; then
  THEME_DIR="$ROOT/cms"
elif [[ -f "$ROOT/hair-solutions-portal/src/theme.json" ]] || [[ -d "$ROOT/hair-solutions-portal/src" ]]; then
  THEME_DIR="$ROOT/hair-solutions-portal"
else
  THEME_DIR="$ROOT/hair-solutions-portal"
fi
THEME_DEST="${HUBSPOT_THEME_DEST:-hair-solutions-portal}"

if [[ "$SKIP_HUBSPOT" != "1" ]]; then
  HS_BIN="$(portal_resolve_hs_bin)"
  if [[ ! -x "$HS_BIN" ]] && ! command -v "$HS_BIN" >/dev/null 2>&1; then
    echo "warn: HubSpot CLI (hs) not found — run npm install in repo root or npm i -g @hubspot/cli@8 — skipping upload" >&2
  elif ! (cd "$THEME_DIR" && "$HS_BIN" accounts list >/dev/null 2>&1); then
    echo "warn: HubSpot CLI has no working account (try: $HS_BIN account auth) — skipping upload" >&2
  else
    echo "Uploading theme to HubSpot ($THEME_DEST) from $THEME_DIR ..."
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
