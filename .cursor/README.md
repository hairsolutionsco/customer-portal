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
2. Export the key where Cursor inherits env (shell profile, 1Password Desktop env injection, or Cursor’s env settings):

   ```bash
   export MEM0_API_KEY="m0-…"
   ```

3. Restart Cursor (or reload the window). Confirm **mem0** appears under MCP and tools like `search_memories` work.
4. Optional: install the **Mem0** plugin from the **Cursor Marketplace** for lifecycle hooks + richer behavior (MCP-only still works with this file).

Companion agent skill: **`.cursor/skills/mem0-memory/`** — when to call memory tools and what not to store.
