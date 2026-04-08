#!/usr/bin/env python3
"""
Sync HubDB tables from customer-portal/data/hubdb/*.json via HubSpot CMS HubDB API (issues #12–#14).

Uses the same token resolution as hubspot_create_portal_contact_properties.py
(hubspot_resolve_token.py): prefers scoped env tokens first (`HUBSPOT_PRIVATE_APP__HUBDB__ACCESS_TOKEN`,
`HUBSPOT_PRIVATE_APP__CMS__ACCESS_TOKEN`, `HUBSPOT_PRIVATE_APP__OPS__ACCESS_TOKEN`), then HubSpot CLI OAuth.
HubDB scope must be allowed for the chosen token.

  bash customer-portal/ops/scripts/op_env.sh python3 customer-portal/ops/scripts/hubspot_sync_hubdb.py   # from design-manager/
  bash 99-development/design-manager/customer-portal/ops/scripts/op_env.sh python3 customer-portal/ops/scripts/hubspot_sync_hubdb.py   # from hubspot/
  python3 customer-portal/ops/scripts/hubspot_sync_hubdb.py --recreate-table=products   # drop + recreate one table (cwd: design-manager)

Env **HUBDB_RECREATE_TABLES** (comma-separated names) matches `--recreate-table=`.

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

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))
from hubspot_resolve_token import resolve_hubspot_token_or_exit

_HUBSPOT_TOKEN = ""
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
            "Authorization": f"Bearer {_HUBSPOT_TOKEN}",
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


def coerce_cell_value(col_type: str, value: object) -> object:
    """HubDB row API expects MAP-shaped values for SELECT/MULTISELECT."""
    t = (col_type or "TEXT").upper()
    if t == "SELECT" and isinstance(value, str):
        return {"name": value, "type": "option"}
    if t == "MULTISELECT" and isinstance(value, list):
        return [{"name": str(x), "type": "option"} for x in value]
    return value


def fetch_column_types(table_name: str) -> dict[str, str]:
    code, body = request_json("GET", table_url(table_name))
    if code != 200 or not isinstance(body, dict):
        print(
            f"error: cannot read column types for {table_name} HTTP {code}: {body}",
            file=sys.stderr,
        )
        sys.exit(1)
    cols = body.get("columns") or []
    return {str(c["name"]): str(c.get("type") or "TEXT") for c in cols if c.get("name")}


def delete_table(table_name: str) -> None:
    code, body = request_json("DELETE", table_url(table_name))
    if code not in (200, 204):
        print(
            f"error: DELETE table {table_name} HTTP {code}: {body}",
            file=sys.stderr,
        )
        sys.exit(1)
    print(f"table deleted: {table_name}")


def batch_create_draft_rows(
    table_name: str,
    rows: list[dict],
    column_names: set[str],
    column_types: dict[str, str],
) -> None:
    for i in range(0, len(rows), BATCH):
        chunk = rows[i : i + BATCH]
        inputs = []
        for idx, row in enumerate(chunk):
            raw = row_values_from_seed(row, column_names)
            values = {
                k: coerce_cell_value(column_types.get(k, "TEXT"), v)
                for k, v in raw.items()
            }
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


def sync_one_seed(
    path: Path, *, skip_rows: bool, recreate_tables: set[str]
) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    table_name = data["tableName"]
    columns = data["columns"]
    rows = data.get("rows") or []
    column_names = {c["name"] for c in columns}

    if table_name in recreate_tables:
        code, _ = request_json("GET", table_url(table_name))
        if code == 200:
            delete_table(table_name)

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
        col_types = fetch_column_types(table_name)
        print(f"creating {len(rows)} row(s) on draft: {table_name} ...")
        batch_create_draft_rows(table_name, rows, column_names, col_types)

    publish_table(table_name)


def main() -> int:
    global _HUBSPOT_TOKEN
    _HUBSPOT_TOKEN = resolve_hubspot_token_or_exit("hubdb")

    skip_rows = "--tables-only" in sys.argv
    recreate: set[str] = set()
    for arg in sys.argv[1:]:
        if arg.startswith("--recreate-table="):
            recreate.add(arg.split("=", 1)[1].strip())
    env_re = os.environ.get("HUBDB_RECREATE_TABLES", "")
    if env_re.strip():
        recreate.update(x.strip() for x in env_re.split(",") if x.strip())

    repo_root = Path(__file__).resolve().parent.parent.parent.parent
    hubdb_dir = repo_root / "customer-portal" / "data" / "hubdb"
    if not hubdb_dir.is_dir():
        print(f"error: missing {hubdb_dir}", file=sys.stderr)
        return 1

    files = sorted(hubdb_dir.glob("*.json"))
    if not files:
        print(f"error: no JSON files in {hubdb_dir}", file=sys.stderr)
        return 1

    for f in files:
        print(f"--- {f.name} ---")
        sync_one_seed(f, skip_rows=skip_rows, recreate_tables=recreate)

    print("hubspot_sync_hubdb: done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
