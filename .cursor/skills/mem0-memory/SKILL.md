---
name: mem0-memory
description: Use when persisting or retrieving long-term project context across Cursor sessions via Mem0 (decisions, bug learnings, architecture, preferences). Use when the user asks to remember something, save to memory, recall a past session, or search prior notes. Requires MEM0_API_KEY and the mem0 MCP server connected.
---

# Mem0 persistent memory (Cursor)

## Overview

**Mem0** exposes MCP tools (`add_memory`, `search_memories`, `get_memories`, etc.) so the agent can store and semantically retrieve durable context. Official integration: https://docs.mem0.ai/integrations/cursor

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
