#!/usr/bin/env bash
# Build (validate) theme, then full ship ritual: issues → HubSpot upload → git (if message given).
# Usage:
#   ./scripts/portal_release.sh "chore(portal): describe the release"
#   npm run portal:release -- "chore(portal): describe the release"
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash "$ROOT/scripts/portal_task_complete.sh" --build-first "$@"
