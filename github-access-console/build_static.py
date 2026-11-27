#!/usr/bin/env python3
"""
Genera dist/ — versión estática publicable en Cloudflare Pages.

Toma una instantánea del estado real, la redacta (correo, rutas del home)
y copia la interfaz. La clave privada no se lee, no se copia y no se publica.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import server

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
PUBLIC = ROOT / "public"
MASKED_EMAIL = "g.***@gmail.com"

HEADERS = """/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
"""

ROBOTS = """User-agent: *
Allow: /
"""


def sanitize_status(status: dict) -> tuple[dict, str]:
    clean = json.loads(json.dumps(status))
    real_email = (clean.get("git") or {}).get("email") or ""
    if real_email:
        clean["git"]["email"] = MASKED_EMAIL

    key = clean.get("key") or {}
    key["path"] = "~/.ssh/id_ed25519"
    key["public_path"] = "~/.ssh/id_ed25519.pub"

    tools = clean.get("tools") or {}
    clean["tools"] = {
        name: (Path(value).name if value else "")
        for name, value in tools.items()
    }
    clean["snapshot"] = True
    return clean, real_email


def sanitize_events(events: list[dict], email: str) -> list[dict]:
    out = []
    home = str(Path.home())
    for event in events:
        item = dict(event)
        if isinstance(item.get("message"), str):
            if email:
                item["message"] = item["message"].replace(email, MASKED_EMAIL)
            item["message"] = item["message"].replace(home, "~")
        out.append(item)
    return out


def main() -> int:
    status, email = sanitize_status(server.status_payload())
    events = sanitize_events(server.read_events(0, 500), email)

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    for name in ("index.html", "styles.css", "app.js", "favicon.svg"):
        shutil.copy2(PUBLIC / name, DIST / name)

    snapshot = {
        "generated_at": status["time"],
        "status": status,
        "events": events,
    }
    (DIST / "snapshot.json").write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")

    (DIST / "_headers").write_text(HEADERS, encoding="utf-8")
    (DIST / "robots.txt").write_text(ROBOTS, encoding="utf-8")

    steps = sum(1 for s in status["steps"] if s["state"] == "done")
    print(f"dist/ listo · {steps}/3 pasos · {len(events)} eventos")
    print("correo y rutas del home redactados; clave privada nunca incluida.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
