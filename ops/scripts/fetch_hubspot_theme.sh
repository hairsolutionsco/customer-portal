#!/usr/bin/env bash
# Pull the portal theme from HubSpot Design Manager into a scratch directory for
# comparison or recovery. Does not replace customer-portal/cms/ (HubSpot fetch
# uses nested module paths + _locales; this repo keeps a flat modules/ layout).
#
# Usage (from 99-development/design-manager/):
#   bash customer-portal/ops/scripts/fetch_hubspot_theme.sh
#   HUBSPOT_THEME_DEST=my-theme bash customer-portal/ops/scripts/fetch_hubspot_theme.sh
#
# Same remote name as portal_task_complete.sh / HUBSPOT_THEME_DEST (default: hair-solutions-portal).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"

THEME_SRC="${HUBSPOT_THEME_DEST:-hair-solutions-portal}"
OUT_DIR="${HUBSPOT_THEME_FETCH_DIR:-customer-portal/.hubspot-theme-fetch}"

if ! command -v hs >/dev/null 2>&1; then
  echo "error: hs (HubSpot CLI) not in PATH" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
echo "Fetching Design Manager theme \"$THEME_SRC\" → $OUT_DIR ..."
hs fetch "$THEME_SRC" "$OUT_DIR" --overwrite
echo "Done. Compare with canonical working tree (structural diffs are expected):"
echo "  diff -qr $OUT_DIR customer-portal/cms"
echo "  HubSpot nests modules under category folders and adds _locales; this repo uses flat modules/*.module paths."
