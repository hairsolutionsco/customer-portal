#!/usr/bin/env bash
# Double-click to run npm run portal:hubspot-props with 1Password-injected env.
# First run: if macOS blocks it, right-click → Open.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
PORTAL="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PORTAL"
./scripts/op_env.sh npm run portal:hubspot-props
echo ""
read -r -p "Done. Press Enter to close… " _
