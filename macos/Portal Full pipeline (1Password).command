#!/usr/bin/env bash
# Double-click: npm ci → portal:verify → HubSpot contact props → issues export + theme upload + git.
# Uses --continue-on-error so later steps still run if one fails (see terminal for which).
# Secrets: 00-engineering/.env via op (same as other Portal *.command).
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
PORTAL="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PORTAL"

MSG=$(osascript -e 'display dialog "Git commit message:" default answer "chore(portal): full pipeline" buttons {"Cancel","OK"} default button "OK"' -e 'text returned of result' 2>/dev/null) || MSG=""
if [[ -z "${MSG// }" ]]; then
  echo "Cancelled."
  read -r -p "Press Enter to close… " _
  exit 1
fi

./scripts/op_env.sh bash ./scripts/portal_automation_full.sh --continue-on-error "$MSG"
echo ""
read -r -p "Done. Press Enter to close… " _
