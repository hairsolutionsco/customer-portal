# Cursor + GSD (this repo)

## Get Shit Done (GSD v1) — Cursor skills

Installed with the official pack (re-run after clone if `.cursor/skills` is missing):

```bash
cd "$(git rev-parse --show-toplevel)"
npx --yes get-shit-done-cc@latest --cursor --local
```

This writes **68** skills under `.cursor/skills/`, plus `.cursor/get-shit-done/`, `.cursor/agents/`, `VERSION`, and `gsd-file-manifest.json`.

**Default routing:** see `.cursor/rules/default-gsd-skill.mdc` (always applied). It points ambiguous work at **`gsd-do`**.

## GSD 2 (`gsd-pi`)

**GSD 2 is not the same as these Cursor skills.** It is a standalone coding agent (Pi-based). Install globally if you want it:

```bash
npm install -g gsd-pi
gsd
```

Use it in the **terminal** for `/gsd`-style flows there; it does not replace `.cursor/skills/gsd-*` unless you adopt it as your primary tool.

## HubSpot / portal skills

Authoritative copies for CMS work live in **`docs/skills/`** (committed). Symlink into `~/.cursor/skills/` per `docs/skills/README.md` if you want them in every project.

## Persistent memory — Mem0 (recommended)

This repo includes **`.cursor/mcp.json`** with the official **Mem0** HTTP MCP server (semantic long-term memory across sessions). Docs: https://docs.mem0.ai/integrations/cursor

1. Create an account and API key at https://app.mem0.ai/ (key prefix `m0-`).
2. Make **`MEM0_API_KEY`** available to **Cursor’s process** (not only terminal scripts). Options:
   - **1Password Desktop → Developer → Environments:** if you added the key to the **HubSpot Dev** environment whose destination is the HubSpot tree `.env` (e.g. `…/00-engineering/hubspot/.env` or `…/00_engineering/hubspot/.env` depending on your checkout), that file is correct for **`op run`** and HubSpot CLI — **Cursor may still not inject it** when it spawns MCP servers. If Mem0 shows “connection failed” or missing auth, use one of the fallbacks below.
   - **Shell profile:** `export MEM0_API_KEY="m0-…"` (only helps if you **launch Cursor from that shell**).
   - **Cursor Settings → MCP / env:** if your Cursor build exposes per-server or global env for MCP, set **`MEM0_API_KEY`** there (no key committed in this repo).
   - **Smoke test in terminal** (proves the key works; does not prove Cursor sees it):

   ```bash
   op run --env-file="/Users/vMac/00-hair-solutions-co/00-engineering/hubspot/.env" -- printenv MEM0_API_KEY | wc -c
   ```

   Use the same `hubspot/.env` path your 1Password destination shows (underscore vs hyphen in `00_engineering` must match your disk).

3. Restart Cursor (or reload the window). Confirm **mem0** appears under MCP and tools like `search_memories` work.
4. Optional: install the **Mem0** plugin from the **Cursor Marketplace** for lifecycle hooks + richer behavior (MCP-only still works with this file).

Companion agent skill: **`.cursor/skills/mem0-memory/`** — when to call memory tools and what not to store.
