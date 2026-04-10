#!/usr/bin/env bash
# Local "build" for the HubSpot CMS theme: validate structure + JSON (+ GraphQL presence).
# HubSpot themes are not compiled — this is the quality gate before upload (portal_task_complete.sh).
#
# Usage:
#   ./scripts/portal_build.sh
#   npm run portal:build
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/theme"

json_ok() {
  local f="$1"
  python3 -m json.tool "$f" >/dev/null
}

if [[ ! -f "$SRC/theme.json" ]]; then
  echo "portal_build: ERROR: missing canonical theme file $SRC/theme.json. CMS validation only supports ./theme." >&2
  exit 1
fi

echo "portal_build: theme root $SRC"

if [[ ! -d "$SRC" ]]; then
  echo "portal_build: ERROR: missing directory $SRC" >&2
  exit 1
fi

echo "portal_build: validating JSON..."
json_ok "$SRC/theme.json"
json_ok "$SRC/fields.json"

while IFS= read -r -d '' mod; do
  json_ok "$mod/meta.json"
  json_ok "$mod/fields.json"
  if [[ ! -f "$mod/module.html" ]]; then
    echo "portal_build: ERROR: missing module.html in $mod" >&2
    exit 1
  fi
done < <(find "$SRC/modules" -maxdepth 1 -mindepth 1 -type d -name '*.module' -print0 2>/dev/null || true)

echo "portal_build: required templates..."
REQUIRED_TEMPLATES=(
  "templates/layouts/base.html"
  "templates/layouts/portal-shell.html"
  "templates/portal-dashboard.html"
  "templates/portal-orders.html"
  "templates/portal-order-detail.html"
  "templates/system/membership-login.html"
  "templates/system/membership-register.html"
)
for rel in "${REQUIRED_TEMPLATES[@]}"; do
  if [[ ! -f "$SRC/$rel" ]]; then
    echo "portal_build: ERROR: missing template: $rel" >&2
    exit 1
  fi
done

echo "portal_build: data-queries (*.graphql)..."
GQL_COUNT=0
while IFS= read -r -d '' g; do
  GQL_COUNT=$((GQL_COUNT + 1))
  if [[ ! -s "$g" ]]; then
    echo "portal_build: ERROR: empty GraphQL file: $g" >&2
    exit 1
  fi
done < <(find "$SRC/data-queries" -maxdepth 1 -type f -name '*.graphql' -print0 2>/dev/null || true)

if [[ "$GQL_COUNT" -lt 1 ]]; then
  echo "portal_build: ERROR: no .graphql files under data-queries/" >&2
  exit 1
fi

echo "portal_build: sections + css + js..."
[[ -f "$SRC/sections/portal-content-section.html" ]] || { echo "portal_build: ERROR: missing sections/portal-content-section.html" >&2; exit 1; }
[[ -f "$SRC/css/main.css" ]] || { echo "portal_build: ERROR: missing css/main.css" >&2; exit 1; }
[[ -f "$SRC/js/main.js" ]] || { echo "portal_build: ERROR: missing js/main.js" >&2; exit 1; }

echo "portal_build: OK ($GQL_COUNT GraphQL queries, modules validated)."
echo "portal_build: next — upload: ./scripts/portal_task_complete.sh \"chore(portal): message\""
