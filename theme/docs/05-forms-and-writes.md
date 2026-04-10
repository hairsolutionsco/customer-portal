# Forms and writes (no bespoke POST)

## Rule

All **writes** from the portal theme (profile updates, tickets, preferences, etc.) go through **HubSpot Forms** embedded in HubL:

```hubl
{% form form_to_use='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' %}
```

Do **not** implement custom `fetch`/POST handlers from HubL to external APIs for CRM writes unless product explicitly approves a separate integration (e.g. serverless or Worker) — that is **out of scope** for the default CMS theme pattern.

## Why

- Membership pages are not a general application server; HubSpot expects **forms** or **serverless** (serverless has its **own** entitlement story on Professional).
- Forms enforce field validation, consent, and CRM mapping in HubSpot.

## Operational notes

- **Form GUIDs** are environment-specific; store them in module fields or theme fields as the program matures, and document in PR descriptions (canonical plan G6).
- **Admin** “settings” pages that imply writes may ship as **read-only** stubs with “contact support” CTAs on Professional unless forms or workflows are defined.

## Reference

- [`../../docs/AGENT_PROMPT.md`](../../docs/AGENT_PROMPT.md) — program-wide constraints and ritual.
- HubSpot: [Forms on CMS pages](https://knowledge.hubspot.com/forms/use-forms-on-your-hubspot-cms-website-pages) (verify current doc URL in developer site if needed).
