#!/usr/bin/env bash
# Thin wrapper: delegates to the canonical scripts/portal_build.sh from customer-portal/.
# Exists so callers from design-manager/ (or hubspot/) can invoke the build with an ops/ path.
#
# Usage (from 99-development/design-manager/):
#   bash customer-portal/ops/scripts/portal_build.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORTAL_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
exec bash "$PORTAL_ROOT/scripts/portal_build.sh" "$@"
