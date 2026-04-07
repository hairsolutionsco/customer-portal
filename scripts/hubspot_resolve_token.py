#!/usr/bin/env python3
"""
Pick a HubSpot Bearer token that succeeds on a lightweight API probe.

Resolves a Bearer token by **probing** the HubSpot API: **env vars first** (Private
App / PAT), then **HubSpot CLI** OAuth in `~/.hscli/config.yml`. Stale env values
that return 401 are skipped; CLI OAuth is used for HubDB when env is broken.

Never prints token values.
"""
from __future__ import annotations

import hashlib
import os
import ssl
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Literal

ProbeKind = Literal["crm", "hubdb"]

PROBE_URLS = {
    "crm": "https://api.hubapi.com/crm/v3/properties/contacts/groups?limit=1",
    "hubdb": "https://api.hubapi.com/cms/v3/hubdb/tables",
}


def _probe_token(token: str, kind: ProbeKind) -> bool:
    url = PROBE_URLS[kind]
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token.strip()}",
            "Content-Type": "application/json",
        },
        method="GET",
    )
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return 200 <= resp.status < 300
    except urllib.error.HTTPError:
        return False
    except OSError:
        return False


def _parse_hscli_config() -> dict | None:
    path = Path.home() / ".hscli" / "config.yml"
    if not path.is_file():
        return None
    try:
        import yaml  # type: ignore[import-untyped]
    except ImportError:
        return None
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError):
        return None


def _env_tokens() -> list[tuple[str, str, int]]:
    """Lower priority number = tried earlier (after sort). Prefer env over CLI for CRM writes."""
    out: list[tuple[str, str, int]] = []
    for i, name in enumerate(
        (
            "HUBSPOT_PRIVATE_APP_ACCESS_TOKEN",
            "HUBSPOT_SERVICE_KEY",
            "HUBSPOT_PERSONAL_ACCESS_KEY",
        )
    ):
        v = os.environ.get(name)
        if v and isinstance(v, str) and len(v.strip()) > 8:
            out.append((f"env:{name}", v.strip(), i))
    return out


def _hscli_tokens() -> list[tuple[str, str, int]]:
    """CLI OAuth often lacks crm.schemas.contacts.write — rank after env tokens."""
    data = _parse_hscli_config()
    if not data:
        return []
    default_id = data.get("defaultAccount")
    accounts = data.get("accounts") or []
    acc = next((a for a in accounts if a.get("accountId") == default_id), None)
    if not acc:
        acc = accounts[0] if accounts else None
    if not acc:
        return []

    out: list[tuple[str, str, int]] = []
    auth = acc.get("auth") or {}
    token_info = auth.get("tokenInfo") or {}
    access = token_info.get("accessToken")
    expires_raw = token_info.get("expiresAt")
    pak = acc.get("personalAccessKey")

    now = datetime.now(timezone.utc)
    oauth_valid = False
    if access and isinstance(access, str) and access.strip():
        if expires_raw and isinstance(expires_raw, str):
            try:
                exp = datetime.fromisoformat(expires_raw.replace("Z", "+00:00"))
                oauth_valid = exp > now + timedelta(minutes=2)
            except ValueError:
                oauth_valid = True
        else:
            oauth_valid = True
        prio = 10 if oauth_valid else 20
        out.append(("hscli:oauth_access_token", access.strip(), prio))

    if pak and isinstance(pak, str) and pak.strip():
        out.append(("hscli:personalAccessKey", pak.strip(), 15))

    return out


def _token_fp(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def resolve_hubspot_token(
    kind: ProbeKind, *, skip_hashes: frozenset[str] | None = None
) -> str | None:
    """
    Return a Bearer token string that passes the probe for `kind`, or None.

    Env private-app tokens are preferred over HubSpot CLI OAuth when both pass
    the read probe — CLI tokens often cannot create contact properties (403).
    """
    skip = skip_hashes or frozenset()
    ranked: list[tuple[int, str, str]] = []
    for label, tok, prio in _env_tokens() + _hscli_tokens():
        ranked.append((prio, label, tok))

    ranked.sort(key=lambda x: (x[0], x[1]))
    seen: set[str] = set()
    for _prio, label, tok in ranked:
        if tok in seen:
            continue
        seen.add(tok)
        fp = _token_fp(tok)
        if fp in skip:
            continue
        if _probe_token(tok, kind):
            return tok
    return None


def resolve_hubspot_token_or_exit(
    kind: ProbeKind, *, skip_hashes: frozenset[str] | None = None
) -> str:
    t = resolve_hubspot_token(kind, skip_hashes=skip_hashes)
    if t:
        return t
    print(
        "error: no working HubSpot token found. Fix 1Password env "
        "(HUBSPOT_SERVICE_KEY / HUBSPOT_PRIVATE_APP_ACCESS_TOKEN) or run "
        "`hs account auth` so ~/.hscli/config.yml has a valid token, then retry.",
        flush=True,
    )
    raise SystemExit(1)
