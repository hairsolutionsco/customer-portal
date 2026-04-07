#!/usr/bin/env bash
# Run a command with secrets from 1Password CLI (inject-only; never prints .env).
#
# Uses, when present:
#   00-engineering/.env.op   — non-secret defaults (optional)
#   00-engineering/.env    — 1Password-injected values (your screenshot path)
#
# From repo root customer-portal/:
#   ./scripts/op_env.sh ./scripts/portal_task_complete.sh --build-first "chore(portal): msg"
#   ./scripts/op_env.sh npm run portal:hubspot-props
#
# Prereq: `op` installed and signed in (1Password app or `op signin`).
set -euo pipefail

PORTAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENGINEERING="$(cd "$PORTAL_ROOT/../.." && pwd)"

if ! command -v op >/dev/null 2>&1; then
  echo "op_env: install 1Password CLI (https://developer.1password.com/docs/cli/)" >&2
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "usage: op_env.sh <command> [args...]" >&2
  exit 1
fi

OP_ARGS=(run)
if [[ -f "$ENGINEERING/.env.op" ]]; then
  OP_ARGS+=(--env-file "$ENGINEERING/.env.op")
fi
# 1Password Desktop often exposes .env as a FIFO (prw-------), not a regular file — use -e not -f
if [[ -e "$ENGINEERING/.env" ]]; then
  OP_ARGS+=(--env-file "$ENGINEERING/.env")
else
  echo "op_env: missing $ENGINEERING/.env (add from 1Password or adjust path)" >&2
  exit 1
fi
OP_ARGS+=(--)

cd "$PORTAL_ROOT"
exec op "${OP_ARGS[@]}" "$@"
