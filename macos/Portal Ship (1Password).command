#!/usr/bin/env bash
# Double-click to: sync issues → HubSpot upload → git (with secrets from hubspot/.env via op).
# First run: if macOS blocks it, right-click → Open.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
PORTAL="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PORTAL"

MSG=$(osascript -e 'display dialog "Git commit message:" default answer "chore(portal): ship theme" buttons {"Cancel","OK"} default button "OK"' -e 'text returned of result' 2>/dev/null) || MSG=""
if [[ -z "${MSG// }" ]]; then
  echo "Cancelled."
  read -r -p "Press Enter to close… " _
  exit 1
fi

./scripts/op_env.sh ./scripts/portal_task_complete.sh --build-first "$MSG"
echo ""
read -r -p "Done. Press Enter to close… " _
