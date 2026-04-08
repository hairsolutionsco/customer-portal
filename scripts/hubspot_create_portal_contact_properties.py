#!/usr/bin/env python3
"""
Create Hair Solutions Portal 2.0 contact property groups + properties (issues #6, #11).

Issue #6 (hair profile): implemented as Contact property `portal_hair_profile_json` (group `portal`)
holding a JSON object whose keys match `hair-solutions-portal/schemas/hair_profile.json` property
`name` values — not a posted custom object (see AGENT_PROMPT.md §1, IMPLEMENTATION_PLAN_SUBAGENTS.md).

Uses a working Bearer token: **env first** (`HUBSPOT_PRIVATE_APP__CRM_SCHEMA__ACCESS_TOKEN`,
`HUBSPOT_PRIVATE_APP__OPS__ACCESS_TOKEN`) when the probe succeeds, then
**HubSpot CLI** OAuth in `~/.hscli/config.yml`. Env is preferred so private apps
with `crm.schemas.contacts.write` win over CLI tokens that may be read-biased.
On property-create **403** / missing scopes, the script retries with the next
candidate token automatically.

Scopes: contact property read/write (e.g. crm.schemas.contacts.write). HubDB
sync is a separate script — see hubspot_sync_hubdb.py.

Idempotent: skips groups/properties that already exist.
"""
from __future__ import annotations

import hashlib
import json
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE = "https://api.hubapi.com/crm/v3/properties/contacts"

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))
from hubspot_resolve_token import resolve_hubspot_token, resolve_hubspot_token_or_exit

# If no token can create a property (403), skip these and continue — add in HubSpot
# later with a Private App that has crm.schemas.contacts.write, or fix 1Password PAT.
_OPTIONAL_IF_403: frozenset[str] = frozenset({"portal_billing_json"})

# HubSpot requires two options for booleancheckbox (values must be "true" / "false").
BOOL_CHECKBOX_OPTIONS = [
    {"label": "Yes", "value": "true"},
    {"label": "No", "value": "false"},
]


def request_json(
    token: str, method: str, url: str, body: dict | None = None
) -> tuple[int, dict | list | None]:
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            code = resp.status
            if not raw:
                return code, None
            return code, json.loads(raw)
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            parsed = json.loads(raw) if raw else None
        except json.JSONDecodeError:
            parsed = {"raw": raw}
        return e.code, parsed


def main() -> int:
    skip_hashes: set[str] = set()
    token = resolve_hubspot_token_or_exit("crm", skip_hashes=frozenset(skip_hashes))

    groups = [
        {"name": "subscription_plan", "label": "Subscription plan", "displayOrder": 1},
        {
            "name": "notification_preferences",
            "label": "Notification preferences",
            "displayOrder": 2,
        },
        {"name": "portal", "label": "Portal", "displayOrder": 3},
    ]

    code, existing_groups = request_json(token, "GET", f"{BASE}/groups")
    if code != 200:
        print(f"error: list groups HTTP {code}: {existing_groups}", file=sys.stderr)
        return 1
    existing_names = {g["name"] for g in (existing_groups or {}).get("results", [])}
    for g in groups:
        if g["name"] in existing_names:
            print(f"group ok (exists): {g['name']}")
            continue
        code, body = request_json(token, "POST", f"{BASE}/groups", g)
        if code in (200, 201):
            print(f"group created: {g['name']}")
        else:
            print(
                f"error: create group {g['name']} HTTP {code}: {body}",
                file=sys.stderr,
            )
            return 1

    properties: list[dict] = [
        {
            "name": "current_plan",
            "label": "Current plan",
            "type": "string",
            "fieldType": "text",
            "groupName": "subscription_plan",
        },
        {
            "name": "plan_price",
            "label": "Plan price",
            "type": "number",
            "fieldType": "number",
            "groupName": "subscription_plan",
        },
        {
            "name": "billing_interval",
            "label": "Billing interval",
            "type": "string",
            "fieldType": "text",
            "groupName": "subscription_plan",
        },
        {
            "name": "period_start",
            "label": "Period start",
            "type": "datetime",
            "fieldType": "date",
            "groupName": "subscription_plan",
        },
        {
            "name": "period_end",
            "label": "Period end",
            "type": "datetime",
            "fieldType": "date",
            "groupName": "subscription_plan",
        },
        {
            "name": "plan_status",
            "label": "Plan status",
            "type": "string",
            "fieldType": "text",
            "groupName": "subscription_plan",
        },
        {
            "name": "notify_order_updates",
            "label": "Notify order updates",
            "type": "bool",
            "fieldType": "booleancheckbox",
            "groupName": "notification_preferences",
        },
        {
            "name": "notify_production_reminders",
            "label": "Notify production reminders",
            "type": "bool",
            "fieldType": "booleancheckbox",
            "groupName": "notification_preferences",
        },
        {
            "name": "notify_marketing",
            "label": "Notify marketing",
            "type": "bool",
            "fieldType": "booleancheckbox",
            "groupName": "notification_preferences",
        },
        {
            "name": "is_portal_customer",
            "label": "Is portal customer",
            "type": "bool",
            "fieldType": "booleancheckbox",
            "groupName": "portal",
        },
        {
            "name": "portal_hair_profile_json",
            "label": "Portal hair profile (JSON)",
            "type": "string",
            "fieldType": "textarea",
            "groupName": "portal",
        },
        {
            "name": "portal_saved_templates_json",
            "label": "Portal saved templates (JSON array)",
            "type": "string",
            "fieldType": "textarea",
            "groupName": "portal",
        },
        {
            "name": "portal_invoices_json",
            "label": "Portal invoices mirror (JSON array)",
            "type": "string",
            "fieldType": "textarea",
            "groupName": "portal",
        },
        {
            "name": "portal_billing_json",
            "label": "Portal billing snapshot (JSON)",
            "type": "string",
            "fieldType": "textarea",
            "groupName": "portal",
        },
    ]

    for prop in properties:
        name = prop["name"]
        code, _ = request_json(token, "GET", f"{BASE}/{name}")
        if code == 200:
            print(f"property ok (exists): {name}")
            continue
        if code != 404:
            print(f"warn: GET {name} HTTP {code}, attempting create anyway", file=sys.stderr)

        payload = {
            **prop,
            "hasUniqueValue": False,
            "hidden": False,
            "formField": True,
        }
        if prop.get("type") == "bool" and prop.get("fieldType") == "booleancheckbox":
            payload["options"] = BOOL_CHECKBOX_OPTIONS
        while True:
            code, body = request_json(token, "POST", BASE, payload)
            if code in (200, 201):
                print(f"property created: {name}")
                break
            if code == 409:
                print(f"property ok (exists): {name}")
                break
            if code == 403 and isinstance(body, dict) and body.get(
                "category"
            ) == "MISSING_SCOPES":
                skip_hashes.add(
                    hashlib.sha256(token.encode("utf-8")).hexdigest()
                )
                nxt = resolve_hubspot_token(
                    "crm", skip_hashes=frozenset(skip_hashes)
                )
                if not nxt:
                    if name in _OPTIONAL_IF_403:
                        print(
                            f"warn: skipped optional property {name} (403, no token with "
                            "crm.schemas.contacts.write). Create it in HubSpot or set a valid "
                            "HUBSPOT_PRIVATE_APP__CRM_SCHEMA__ACCESS_TOKEN in 1Password, then re-run.",
                            file=sys.stderr,
                        )
                        break
                    print(
                        f"error: create property {name} HTTP 403 (missing scopes). "
                        "Add crm.schemas.contacts.write to a Private App and set "
                        "HUBSPOT_PRIVATE_APP__CRM_SCHEMA__ACCESS_TOKEN or HUBSPOT_PRIVATE_APP__OPS__ACCESS_TOKEN in 1Password.",
                        file=sys.stderr,
                    )
                    return 1
                print(
                    f"warn: retried contact-property create with alternate token ({name})",
                    file=sys.stderr,
                )
                token = nxt
                continue
            print(
                f"error: create property {name} HTTP {code}: {body}",
                file=sys.stderr,
            )
            return 1

    print("done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
