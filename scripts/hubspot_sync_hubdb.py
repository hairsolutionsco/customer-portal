#!/usr/bin/env python3
"""
Sync HubDB tables from hair-solutions-portal/hubdb/*.json via HubSpot CMS HubDB API (issues #12–#14).

Requires a Private App token with HubDB scope (commonly named **hubdb** in the developer UI), e.g.:
  HUBSPOT_SERVICE_KEY or HUBSPOT_PRIVATE_APP_ACCESS_TOKEN

  ./scripts/op_env.sh python3 scripts/hubspot_sync_hubdb.py

Idempotent:
  - Creates each table if missing (POST /cms/v3/hubdb/tables).
  - Replaces **draft** rows: purge all draft rows, batch-create seed rows, publish draft.

Scopes: add **hubdb** (and keep CRM scopes on a separate app if HubSpot splits them).

Docs: https://developers.hubspot.com/docs/reference/api/cms/hubdb
"""
from __future__ import annotations

import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

TOKEN = (
    os.environ.get("HUBSPOT_SERVICE_KEY")
    or os.environ.get("HUBSPOT_PRIVATE_APP_ACCESS_TOKEN")
    or os.environ.get("HUBSPOT_PERSONAL_ACCESS_KEY")
)
HUBDB_ROOT = "https://api.hubapi.com/cms/v3/hubdb"
BATCH = 100


def request_json(
    method: str, url: str, body: dict | None = None
) -> tuple[int, dict | list | None]:
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
        with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
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


def table_url(name: str, path_suffix: str = "") -> str:
    enc = urllib.parse.quote(str(name), safe="")
    return f"{HUBDB_ROOT}/tables/{enc}{path_suffix}"


def label_for_column(name: str) -> str:
    return name.replace("_", " ").strip().title()


def column_to_api(col: dict) -> dict:
    raw_type = (col.get("type") or "TEXT").upper()
    # Seed files use RICHTEXT; HubSpot enum is RICHTEXT
    if raw_type == "RICH_TEXT":
        raw_type = "RICHTEXT"
    out: dict = {
        "name": col["name"],
        "label": col.get("label") or label_for_column(col["name"]),
        "type": raw_type,
    }
    if raw_type in ("SELECT", "MULTISELECT") and col.get("options"):
        out["options"] = [
            {"name": str(opt), "label": str(opt), "order": i}
            for i, opt in enumerate(col["options"])
        ]
    return out


def build_table_body(table_name: str, columns: list[dict]) -> dict:
    label = table_name.replace("_", " ").title()
    return {
        "name": table_name,
        "label": label,
        "columns": [column_to_api(c) for c in columns],
        "allowChildTables": False,
        "allowPublicApiAccess": False,
        "enableChildTablePages": False,
        "useForPages": False,
        "dynamicMetaTags": {},
    }


def ensure_table(table_name: str, columns: list[dict]) -> str:
    code, body = request_json("GET", table_url(table_name))
    if code == 200 and isinstance(body, dict) and body.get("id") is not None:
        print(f"table ok (exists): {table_name} id={body.get('id')}")
        return str(body["id"])

    if code != 404:
        print(
            f"error: GET table {table_name} HTTP {code}: {body}",
            file=sys.stderr,
        )
        sys.exit(1)

    payload = build_table_body(table_name, columns)
    code, body = request_json("POST", f"{HUBDB_ROOT}/tables", payload)
    if code not in (200, 201) or not isinstance(body, dict):
        print(
            f"error: create table {table_name} HTTP {code}: {body}",
            file=sys.stderr,
        )
        sys.exit(1)
    print(f"table created: {table_name} id={body.get('id')}")
    return str(body["id"])


def fetch_all_draft_row_ids(table_name: str) -> list[str]:
    ids: list[str] = []
    after: str | None = None
    while True:
        q = urllib.parse.urlencode({"limit": str(BATCH), **({"after": after} if after else {})})
        url = f"{table_url(table_name)}/rows/draft?{q}"
        code, body = request_json("GET", url)
        if code != 200 or not isinstance(body, dict):
            print(
                f"error: list draft rows {table_name} HTTP {code}: {body}",
                file=sys.stderr,
            )
            sys.exit(1)
        for row in body.get("results") or []:
            rid = row.get("id")
            if rid is not None:
                ids.append(str(rid))
        paging = body.get("paging") or {}
        nxt = (paging.get("next") or {}) if isinstance(paging, dict) else {}
        after = nxt.get("after")
        if not after:
            break
    return ids


def purge_draft_rows(table_name: str, row_ids: list[str]) -> None:
    for i in range(0, len(row_ids), BATCH):
        chunk = row_ids[i : i + BATCH]
        if not chunk:
            continue
        code, body = request_json(
            "POST",
            f"{table_url(table_name)}/rows/draft/batch/purge",
            {"inputs": chunk},
        )
        if code not in (200, 201, 204):
            print(
                f"error: purge draft rows {table_name} HTTP {code}: {body}",
                file=sys.stderr,
            )
            sys.exit(1)


def row_values_from_seed(row: dict, column_names: set[str]) -> dict:
    out: dict = {}
    for k, v in row.items():
        if k not in column_names:
            continue
        if v is None:
            continue
        if isinstance(v, float) and v != v:  # NaN skip
            continue
        out[k] = v
    return out


def batch_create_draft_rows(table_name: str, rows: list[dict], column_names: set[str]) -> None:
    for i in range(0, len(rows), BATCH):
        chunk = rows[i : i + BATCH]
        inputs = []
        for idx, row in enumerate(chunk):
            values = row_values_from_seed(row, column_names)
            inputs.append({"values": values, "displayIndex": i + idx})
        code, body = request_json(
            "POST",
            f"{table_url(table_name)}/rows/draft/batch/create",
            {"inputs": inputs},
        )
        if code not in (200, 201, 207):
            print(
                f"error: batch create rows {table_name} HTTP {code}: {body}",
                file=sys.stderr,
            )
            sys.exit(1)


def publish_table(table_name: str) -> None:
    code, body = request_json("POST", f"{table_url(table_name)}/draft/publish", {})
    if code not in (200, 201):
        print(
            f"error: publish {table_name} HTTP {code}: {body}",
            file=sys.stderr,
        )
        sys.exit(1)
    print(f"published: {table_name}")


def sync_one_seed(path: Path, *, skip_rows: bool) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    table_name = data["tableName"]
    columns = data["columns"]
    rows = data.get("rows") or []
    column_names = {c["name"] for c in columns}

    ensure_table(table_name, columns)
    if skip_rows:
        print(f"skip rows (--tables-only): {table_name}")
        return

    draft_ids = fetch_all_draft_row_ids(table_name)
    if draft_ids:
        print(f"purging {len(draft_ids)} draft row(s) from {table_name} ...")
        purge_draft_rows(table_name, draft_ids)
    else:
        print(f"no draft rows to purge: {table_name}")

    if not rows:
        print(f"no seed rows in JSON for {table_name}; publishing anyway")
    else:
        print(f"creating {len(rows)} row(s) on draft: {table_name} ...")
        batch_create_draft_rows(table_name, rows, column_names)

    publish_table(table_name)


def main() -> int:
    if not TOKEN:
        print(
            "error: set HUBSPOT_SERVICE_KEY, HUBSPOT_PRIVATE_APP_ACCESS_TOKEN, or HUBSPOT_PERSONAL_ACCESS_KEY",
            file=sys.stderr,
        )
        return 1

    skip_rows = "--tables-only" in sys.argv

    portal_root = Path(__file__).resolve().parent.parent
    hubdb_dir = portal_root / "hair-solutions-portal" / "hubdb"
    if not hubdb_dir.is_dir():
        print(f"error: missing {hubdb_dir}", file=sys.stderr)
        return 1

    files = sorted(hubdb_dir.glob("*.json"))
    if not files:
        print(f"error: no JSON files in {hubdb_dir}", file=sys.stderr)
        return 1

    for f in files:
        print(f"--- {f.name} ---")
        sync_one_seed(f, skip_rows=skip_rows)

    print("hubspot_sync_hubdb: done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
