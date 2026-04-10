# Agent skills (customer portal repo)

Canonical copies of skills used for **HubSpot CMS portal** and **Hair Solutions developer** work. Each skill is a directory with a root **`SKILL.md`** (Cursor / Claude agent discovery).

**GSD (Get Shit Done v1)** for Cursor is installed under **`.cursor/skills/`** by the official installer (see **`.cursor/README.md`**). This folder is for **HubSpot + UI** skills; use **`gsd-do`** (default router — see **`.cursor/rules/default-gsd-skill.mdc`**) for phased GSD workflows.

## Layout

| Path | Skill |
|------|--------|
| `hubspot-cms-fundamentals/` | CMS themes, CLI, `theme.json`, modules |
| `hubspot-cms-templating/` | HubL, templates, modules, assets |
| `hubspot-cms-data-apis/` | GraphQL, HubDB, CRM on private pages |
| `hubspot-cms-advanced-patterns/` | Performance, serverless vs Workers, integration boundaries |
| `hubspot-developer/` | Agent Tools, Custom Channels, Breeze, `hsmeta.json` |
| `ui-ux-pro-max/` | UI/UX design intelligence (`SKILL.md` + `data/`, `scripts/`, `templates/`) — vendored copy for Cursor |
| `*.skill` | **Zip archives** of the four CMS skills (same content as the extracted folders; keep for distribution or re-extract) |

### Legacy partial trees

`ui-ux-pro-max-skill/` and `ui-ux-pro-max-skill 2/` are older/incomplete copies; **`ui-ux-pro-max/`** is the canonical folder. You can delete the two legacy dirs after confirming you do not need them.

## Install into Cursor (personal)

From a shell, point Cursor’s personal skills at this repo (adjust path if your checkout differs):

```bash
REPO_SKILLS="/Users/vMac/00-hair-solutions-co/00_engineering/04_hubspot/99-development/design-manager/customer-portal/docs/skills"
CURSOR="$HOME/.cursor/skills"
ln -sfn "$REPO_SKILLS/hubspot-cms-fundamentals" "$CURSOR/hubspot-cms-fundamentals"
ln -sfn "$REPO_SKILLS/hubspot-cms-templating" "$CURSOR/hubspot-cms-templating"
ln -sfn "$REPO_SKILLS/hubspot-cms-data-apis" "$CURSOR/hubspot-cms-data-apis"
ln -sfn "$REPO_SKILLS/hubspot-cms-advanced-patterns" "$CURSOR/hubspot-cms-advanced-patterns"
ln -sfn "$REPO_SKILLS/hubspot-developer" "$CURSOR/hubspot-developer"
ln -sfn "$REPO_SKILLS/ui-ux-pro-max" "$CURSOR/ui-ux-pro-max"
```

Do **not** symlink into `~/.cursor/skills-cursor/` (reserved for Cursor built-ins).

## Re-extract from `.skill` zips

If you replace a zip and need to refresh the folder:

```bash
cd docs/skills
rm -rf hubspot-cms-fundamentals && mkdir hubspot-cms-fundamentals && unzip -o hubspot-cms-fundamentals.skill -d hubspot-cms-fundamentals
# repeat for templating, data-apis, advanced-patterns
```
