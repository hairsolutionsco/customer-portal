#!/usr/bin/env bash
# Build (validate) theme, then full ship ritual: issues → HubSpot upload → git (if message given).
# Usage (from 99-development/design-manager/):
#   bash customer-portal/ops/scripts/portal_release.sh "chore(portal): describe the release"
#   npm run portal:release -- "chore(portal): describe the release"
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bash "$SCRIPT_DIR/portal_task_complete.sh" --build-first "$@"
