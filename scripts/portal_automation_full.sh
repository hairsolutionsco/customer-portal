#!/usr/bin/env bash
# One-shot Portal 2.0 pipeline (non-interactive): deps → verify → CRM props → HubDB API sync → ritual.
#
# Order:
#   1) npm ci (if package-lock.json) else npm install
#   2) npm run portal:verify   (CMS theme validation only)
#   3) ./scripts/op_env.sh npm run portal:hubspot-props   (needs hubspot/.env via 1Password)
#   4) ./scripts/op_env.sh npm run portal:hubdb-sync      (same token; private app needs **hubdb** scope)
#   5) ./scripts/portal_task_complete.sh   (GitHub exports + hs upload; git only if commit message given)
#
# Usage (from customer-portal/):
#   ./scripts/op_env.sh ./scripts/portal_automation_full.sh "chore(portal): nightly automation"
#   ./scripts/portal_automation_full.sh --continue-on-error "chore(portal): msg"
#   SKIP_CONTACT_PROPS=1 ./scripts/portal_automation_full.sh "docs: skip props"
#   SKIP_HUBDB_SYNC=1 ...       # skip HubDB table/row API sync
#   SKIP_TASK_COMPLETE=1 ...   # only verify (+ props + hubdb); no issues/upload/git
#
# Env:
#   PORTAL_AUTOMATION_CONTINUE=1   same as --continue-on-error
#   SKIP_CONTACT_PROPS=1           skip HubSpot property script
#   SKIP_HUBDB_SYNC=1              skip portal:hubdb-sync
#   SKIP_TASK_COMPLETE=1           skip portal_task_complete.sh entirely
#   PATH should include /opt/homebrew/bin for GUI-launched runs
#
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"
export CI="${CI:-true}"
export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-1}"

CONTINUE="${PORTAL_AUTOMATION_CONTINUE:-0}"
SKIP_PROPS="${SKIP_CONTACT_PROPS:-0}"
SKIP_HUBDB="${SKIP_HUBDB_SYNC:-0}"
SKIP_COMPLETE="${SKIP_TASK_COMPLETE:-0}"
COMMIT_MSG=""

for arg in "$@"; do
  case "$arg" in
    --continue-on-error) CONTINUE=1 ;;
    --help|-h)
      sed -n '2,35p' "$0" | cat
      exit 0
      ;;
    *)
      if [[ "$arg" == --* ]]; then
        echo "portal_automation_full: unknown flag: $arg (try --help)" >&2
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

if [[ -z "$COMMIT_MSG" ]]; then
  COMMIT_MSG="chore(portal): automation $(date -u +%Y-%m-%dT%H:%MZ)"
fi

FAILURES=0

bail() {
  echo "portal_automation_full: ABORT: $*" >&2
  exit 1
}

step() {
  local title="$1"
  shift
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " portal_automation_full: $title"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if "$@"; then
    echo "portal_automation_full: OK — $title"
  else
    echo "portal_automation_full: FAILED — $title" >&2
    FAILURES=$((FAILURES + 1))
    if [[ "$CONTINUE" != "1" ]]; then
      exit 1
    fi
  fi
}

# --- 1) Dependencies ---
step "npm install (ci if lockfile present)" env ROOT="$ROOT" bash -c '
  set -e
  cd "$ROOT"
  if [[ -f package-lock.json ]]; then
    npm ci --no-audit
  else
    npm install --no-audit --no-fund
  fi
'

# --- 2) Verify (CMS theme validation only) ---
step "portal:verify (CMS theme validation only)" env ROOT="$ROOT" bash -c '
  set -e
  cd "$ROOT"
  npm run portal:verify
'

# --- 3) Contact properties (Private App token via op_env) ---
if [[ "$SKIP_PROPS" == "1" ]]; then
  echo "portal_automation_full: skipping HubSpot contact props (SKIP_CONTACT_PROPS=1)"
else
  if [[ ! -f "$ROOT/scripts/op_env.sh" ]]; then
    bail "missing scripts/op_env.sh"
  fi
  step "HubSpot contact properties (op_env + portal:hubspot-props)" env ROOT="$ROOT" bash -c '
    set -e
    cd "$ROOT"
    bash ./scripts/op_env.sh npm run portal:hubspot-props
  '
fi

# --- 4) HubDB (tables + seed rows via CMS API) ---
if [[ "$SKIP_HUBDB" == "1" ]]; then
  echo "portal_automation_full: skipping HubDB sync (SKIP_HUBDB_SYNC=1)"
else
  step "HubDB sync (op_env + portal:hubdb-sync)" env ROOT="$ROOT" bash -c '
    set -e
    cd "$ROOT"
    bash ./scripts/op_env.sh npm run portal:hubdb-sync
  '
fi

# --- 5) Issues sync + theme upload + git ---
if [[ "$SKIP_COMPLETE" == "1" ]]; then
  echo "portal_automation_full: skipping portal_task_complete (SKIP_TASK_COMPLETE=1)"
else
  step "portal_task_complete (issues + HubSpot upload + git)" \
    bash "$ROOT/scripts/portal_task_complete.sh" "$COMMIT_MSG"
fi

echo ""
if [[ "$FAILURES" -gt 0 ]]; then
  echo "portal_automation_full: finished with $FAILURES failed step(s)." >&2
  exit 1
fi
echo "portal_automation_full: all steps succeeded."
exit 0
