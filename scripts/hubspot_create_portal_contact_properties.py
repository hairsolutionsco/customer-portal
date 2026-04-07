#!/usr/bin/env python3
"""
Create Hair Solutions Portal 2.0 contact property groups + properties (issue #11).

Requires a Private App access token (often called "service key") with scope that
includes contact property/schema write, e.g. crm.schemas.contacts.write.
(HubDB uses the same env var but needs the **hubdb** scope — see hubspot_sync_hubdb.py.)

  export HUBSPOT_SERVICE_KEY="pat-na1-..."   # or HUBSPOT_PRIVATE_APP_ACCESS_TOKEN
  cd 00-engineering/apps/customer-portal
  python3 scripts/hubspot_create_portal_contact_properties.py

Idempotent: skips groups/properties that already exist.
"""
from __future__ import annotations

import json
import os
import ssl
import sys
import urllib.error
import urllib.request

BASE = "https://api.hubapi.com/crm/v3/properties/contacts"
TOKEN = (
    os.environ.get("HUBSPOT_SERVICE_KEY")
    or os.environ.get("HUBSPOT_PRIVATE_APP_ACCESS_TOKEN")
    or os.environ.get("HUBSPOT_PERSONAL_ACCESS_KEY")
)

# HubSpot requires two options for booleancheckbox (values must be "true" / "false").
BOOL_CHECKBOX_OPTIONS = [
    {"label": "Yes", "value": "true"},
    {"label": "No", "value": "false"},
]


def request_json(method: str, url: str, body: dict | None = None) -> tuple[int, dict | list | None]:
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
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
    if not TOKEN:
        print(
            "error: set HUBSPOT_SERVICE_KEY, HUBSPOT_PRIVATE_APP_ACCESS_TOKEN, or HUBSPOT_PERSONAL_ACCESS_KEY",
            file=sys.stderr,
        )
        return 1

    groups = [
        {"name": "subscription_plan", "label": "Subscription plan", "displayOrder": 1},
        {
            "name": "notification_preferences",
            "label": "Notification preferences",
            "displayOrder": 2,
        },
        {"name": "portal", "label": "Portal", "displayOrder": 3},
    ]

    code, existing_groups = request_json("GET", f"{BASE}/groups")
    if code != 200:
        print(f"error: list groups HTTP {code}: {existing_groups}", file=sys.stderr)
        return 1
    existing_names = {g["name"] for g in (existing_groups or {}).get("results", [])}
    for g in groups:
        if g["name"] in existing_names:
            print(f"group ok (exists): {g['name']}")
            continue
        code, body = request_json("POST", f"{BASE}/groups", g)
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
        code, _ = request_json("GET", f"{BASE}/{name}")
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
        code, body = request_json("POST", BASE, payload)
        if code in (200, 201):
            print(f"property created: {name}")
        elif code == 409:
            print(f"property ok (exists): {name}")
        else:
            print(
                f"error: create property {name} HTTP {code}: {body}",
                file=sys.stderr,
            )
            return 1

    print("done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
