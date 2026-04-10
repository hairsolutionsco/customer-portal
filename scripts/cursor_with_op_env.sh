#!/usr/bin/env bash
# Launch Cursor with secrets from the 1Password-backed env (same chain as op_env.sh).
# Use this so MCP servers that read ${env:MEM0_API_KEY} in .cursor/mcp.json actually receive the key.
# GUI-launched Cursor does not load project .env / FIFO files; op run injects the child process env only.
#
# Usage:
#   ./scripts/cursor_with_op_env.sh                    # opens this repo (customer-portal) in Cursor
#   ./scripts/cursor_with_op_env.sh /path/to/folder   # opens another folder (still uses hubspot .env)
#
# Requires: `cursor` on PATH (Cursor → Shell Command: Install), `op` signed in, hubspot/.env FIFO mounted.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTAL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET="${1:-$PORTAL_ROOT}"

if ! command -v cursor >/dev/null 2>&1; then
  echo "cursor_with_op_env: 'cursor' not on PATH. In Cursor: Command Palette → \"Shell Command: Install 'cursor' command\"." >&2
  exit 1
fi

exec "$PORTAL_ROOT/scripts/op_env.sh" bash -c 'exec cursor "$1"' bash "$TARGET"
