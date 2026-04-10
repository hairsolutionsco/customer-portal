#!/usr/bin/env bash
# Thin wrapper: delegates to the canonical scripts/portal_task_complete.sh from customer-portal/.
# Exists so callers from design-manager/ (or hubspot/) can invoke the ship ritual with an ops/ path.
#
# Usage (from 99-development/design-manager/):
#   bash customer-portal/ops/scripts/portal_task_complete.sh "chore(portal): describe the task"
#   bash customer-portal/ops/scripts/portal_task_complete.sh --build-first "chore(portal): msg"
#   SKIP_GIT=1 bash customer-portal/ops/scripts/portal_task_complete.sh --skip-git
#
# From hubspot/ root (1Password):
#   bash scripts/op_run.sh bash 99-development/design-manager/customer-portal/ops/scripts/portal_task_complete.sh "msg"
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTAL_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
exec bash "$PORTAL_ROOT/scripts/portal_task_complete.sh" "$@"
