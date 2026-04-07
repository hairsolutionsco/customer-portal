#!/usr/bin/env bash
# Double-click to run npm run portal:build (HubSpot theme validation only; no 1Password needed).
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
PORTAL="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PORTAL"
npm run portal:build
echo ""
read -r -p "Done. Press Enter to close… " _
