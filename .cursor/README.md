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
