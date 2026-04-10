#!/usr/bin/env bash
# Thin wrapper: delegates to the canonical scripts/sync-github-exports.sh from customer-portal/.
# Exists so callers from design-manager/ (or hubspot/) can invoke issue/milestone sync with an ops/ path.
#
# Usage (from 99-development/design-manager/):
#   bash customer-portal/ops/scripts/sync-github-exports.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTAL_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
exec bash "$PORTAL_ROOT/scripts/sync-github-exports.sh" "$@"
