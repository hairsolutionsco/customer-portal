---
name: mem0-memory
description: Use when persisting or retrieving long-term project context across Cursor sessions via Mem0 (decisions, bug learnings, architecture, preferences). Use when the user asks to remember something, save to memory, recall a past session, or search prior notes. Requires MEM0_API_KEY and the mem0 MCP server connected.
---

# Mem0 persistent memory (Cursor)

## Overview

**Mem0** exposes MCP tools (`add_memory`, `search_memories`, `get_memories`, etc.) so the agent can store and semantically retrieve durable context. Official integration: https://docs.mem0.ai/integrations/cursor

### MCP wiring in this repo

- **Project config:** `.cursor/mcp.json` registers the hosted server `https://mcp.mem0.ai/mcp/` with `Authorization: Token ${env:MEM0_API_KEY}` (see Mem0 *Manual Configuration*).
- **1Password / FIFO `.env` (this workspace):** **`MEM0_API_KEY` may live only in the 1Password-backed env** (e.g. `hubspot/.env` or `00_engineering/.env` as a FIFO). Cursor **does not** read that file when you open the app from the Dock — and you must **not** `cat` the FIFO. **`${env:MEM0_API_KEY}` in `mcp.json` resolves against the environment of the Cursor process**, not against a project `.env` on disk.
- **Correct way to get Mem0 MCP working:** start Cursor **through the same `op run` chain as other secret-bearing commands:**
  - **CLI:** from `customer-portal/`, run **`./scripts/cursor_with_op_env.sh`** (opens this repo) or **`./scripts/cursor_with_op_env.sh /path/to/folder`**.
  - **macOS:** double-click **`macos/Open Cursor with 1Password env.command`**.
  - Under the hood that runs **`./scripts/op_env.sh`** → HubSpot **`op_run.sh`** → **`op run --env-file …`** so **`MEM0_API_KEY`** is injected into the **`cursor`** child process and MCP inherits it.
- **Alternative:** duplicate the variable into an environment Cursor’s GUI actually loads (only if your security model allows it); never commit real keys.
- **If tools still do not appear:** Remove any **duplicate** `mem0` entry from **global** Cursor MCP settings (Mem0 docs: duplicate servers break discovery). Fully quit and reopen Cursor **after** using the launcher (or after changing MCP config).
- **Full plugin (hooks + SDK skill):** optional install from [Cursor Marketplace](https://cursor.com/marketplace) per Mem0 docs — `.cursor/mcp.json` here is **MCP tools only**.

## When to use tools

| Situation | Tool direction |
|-----------|----------------|
| User wants a **decision, fix, or convention** saved for later | `add_memory` — concise, factual text; no secrets |
| Starting work that may relate to **past sessions** | `search_memories` with relevant keywords |
| User asks “what did we decide about X?” | `search_memories` then summarize |

## Rules

- **Never** store API keys, tokens, passwords, or raw `.env` values in Mem0.
- Prefer **project-scoped** phrasing (repo name, portal, HubSpot) in memory text so search stays precise.
- After a significant milestone (e.g. shipped theme, resolved GraphQL gate), offer to **`add_memory`** a short bullet summary.

## Full experience (optional)

For **lifecycle hooks** (auto-inject on session start / compaction), install the **Mem0** entry from the **Cursor Marketplace** (see Mem0 docs). This repo’s `mcp.json` only wires the **MCP tools** path.
