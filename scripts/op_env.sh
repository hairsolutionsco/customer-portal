#!/usr/bin/env bash
# Delegate secret-bearing commands to the HubSpot root wrapper so every
# subproject shares the same env discovery rules.
set -euo pipefail

PORTAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HUBSPOT_ROOT="$(cd "$PORTAL_ROOT/../../../../.." && pwd)"

cd "$PORTAL_ROOT"
exec bash "$HUBSPOT_ROOT/scripts/op_run.sh" "$@"
