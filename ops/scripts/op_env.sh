#!/usr/bin/env bash
# Delegate secret-bearing commands to the HubSpot root wrapper (scripts/op_run.sh).
# op_run.sh always cds to hubspot/ before exec; this script wraps the user command in
#   cd <design-manager-root> && exec …
# so paths like customer-portal/ops/scripts/… and npm run portal:* stay valid.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# scripts → ops → customer-portal → design-manager
DESIGN_MANAGER_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
HUBSPOT_ROOT="$(cd "$DESIGN_MANAGER_ROOT/../.." && pwd)"

_DM_ESC="$(printf '%q' "$DESIGN_MANAGER_ROOT")"

exec bash "$HUBSPOT_ROOT/scripts/op_run.sh" bash -c "cd ${_DM_ESC} && exec \"\$@\"" bash "$@"
