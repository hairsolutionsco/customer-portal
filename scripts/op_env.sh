#!/usr/bin/env bash
# Delegate secret-bearing commands to 1Password + HubSpot env.
# When this repo lives under design-manager/, prefer ops/scripts/op_env.sh (correct
# HUBSPOT_ROOT + cwd to design-manager for npm run portal:*).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORTAL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OPS_OP_ENV="$PORTAL_ROOT/ops/scripts/op_env.sh"
if [[ -x "$OPS_OP_ENV" ]]; then
  exec bash "$OPS_OP_ENV" "$@"
fi

# Fallback: walk up from portal root until ../scripts/op_run.sh exists (04_hubspot layout).
HUBSPOT_ROOT=""
d="$PORTAL_ROOT"
for _ in 1 2 3 4 5 6 7 8; do
  if [[ -x "$d/scripts/op_run.sh" ]]; then
    HUBSPOT_ROOT="$d"
    break
  fi
  d="$(cd "$d/.." && pwd)"
done
if [[ -z "$HUBSPOT_ROOT" ]]; then
  echo "op_env: could not find hubspot scripts/op_run.sh; install ops/ or run from design-manager layout." >&2
  exit 1
fi

cd "$PORTAL_ROOT"
exec bash "$HUBSPOT_ROOT/scripts/op_run.sh" "$@"
