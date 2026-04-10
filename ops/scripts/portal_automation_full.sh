#!/usr/bin/env bash
# Thin wrapper: delegates to the canonical scripts/portal_automation_full.sh from customer-portal/.
# Exists so callers from design-manager/ (or hubspot/) can invoke the full pipeline with an ops/ path.
#
# Usage (from 99-development/design-manager/):
#   bash customer-portal/ops/scripts/op_env.sh bash customer-portal/ops/scripts/portal_automation_full.sh "chore(portal): msg"
#   bash customer-portal/ops/scripts/portal_automation_full.sh --continue-on-error "chore(portal): msg"
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTAL_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
exec bash "$PORTAL_ROOT/scripts/portal_automation_full.sh" "$@"
