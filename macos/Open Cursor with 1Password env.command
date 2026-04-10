#!/usr/bin/env bash
# Double-click: open Customer Portal in Cursor with 1Password-injected env (MEM0_API_KEY for Mem0 MCP, HubSpot vars, etc.).
# First run: if macOS blocks, right-click → Open.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
PORTAL="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PORTAL"
exec ./scripts/cursor_with_op_env.sh "$PORTAL"
