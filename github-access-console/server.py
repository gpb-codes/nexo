#!/usr/bin/env python3
"""
GitHub Access Console — servidor local.

Solo escucha en 127.0.0.1. No envía datos a ningún sitio: lee el estado
real de SSH/git de esta máquina y ejecuta ssh-keygen / ssh en tu nombre
cuando pulsas un botón.

Uso:
    python3 server.py            # http://127.0.0.1:8787
    PORT=9000 python3 server.py
"""

from __future__ import annotations

import json
import mimetypes
import os
import platform
import shutil
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
STATE = ROOT / "state"
EVENTS = STATE / "events.jsonl"
LAST_TEST = STATE / "last-test.json"
SSH_DIR = Path.home() / ".ssh"
KEY = SSH_DIR / "id_ed25519"
PUBKEY = SSH_DIR / "id_ed25519.pub"
HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8787"))

_log_lock = threading.Lock()
_state_lock = threading.Lock()


# --------------------------------------------------------------------------
# Utilidades
# --------------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def run(cmd: list[str], timeout: int = 30) -> tuple[int, str, str]:
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout.strip(), p.stderr.strip()
    except FileNotFoundError:
        return 127, "", f"no encontrado: {cmd[0]}"
    except subprocess.TimeoutExpired:
        return 124, "", f"tiempo agotado tras {timeout}s"


def git_config(key: str) -> str:
    code, out, _ = run(["git", "config", "--global", "--get", key], timeout=5)
    return out if code == 0 else ""


def log_event(message: str, level: str = "info", actor: str = "consola") -> dict:
    STATE.mkdir(parents=True, exist_ok=True)
    rec = {"ts": time.time(), "iso": now_iso(), "level": level,
           "actor": actor, "message": message}
    with _log_lock:
        with EVENTS.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
    return rec


def read_events(after: float = 0.0, limit: int = 250) -> list[dict]:
    if not EVENTS.exists():
        return []
    out: list[dict] = []
    with EVENTS.open("r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            if rec.get("ts", 0) > after:
                out.append(rec)
    return out[-limit:]


def read_last_test() -> dict:
    try:
        return json.loads(LAST_TEST.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def write_last_test(data: dict) -> None:
    STATE.mkdir(parents=True, exist_ok=True)
    LAST_TEST.write_text(json.dumps(data, ensure_ascii=False, indent=2),
                         encoding="utf-8")


def fingerprint() -> str:
    if not PUBKEY.exists():
        return ""
    code, out, _ = run(["ssh-keygen", "-lf", str(PUBKEY)], timeout=10)
    return out if code == 0 else ""


def public_key() -> str:
    try:
        return PUBKEY.read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def key_created_at() -> str:
    if not KEY.exists():
        return ""
    return datetime.fromtimestamp(KEY.stat().st_mtime).astimezone().isoformat(
        timespec="seconds")


def ssh_dir_perms() -> str:
    if not SSH_DIR.exists():
        return "no existe"
    return oct(SSH_DIR.stat().st_mode & 0o777)


def status_payload() -> dict:
    key_exists = KEY.exists() and PUBKEY.exists()
    last = read_last_test()
    name = git_config("user.name")
    email = git_config("user.email")

    steps = [
        {
            "id": 1,
            "title": "Generar la clave",
            "desc": "Un par ed25519: la privada se queda en tu equipo, la pública viaja a GitHub.",
            "state": "done" if key_exists else "active",
            "detail": fingerprint() if key_exists else "Pendiente de generar",
        },
        {
            "id": 2,
            "title": "Autorizarla en GitHub",
            "desc": "Pegar la clave pública en GitHub → Settings → SSH and GPG keys.",
            "state": "done" if last.get("ok") else ("active" if key_exists else "pending"),
            "detail": ("Verificada por SSH" if last.get("ok")
                       else "Copia la clave y pégala en GitHub"),
        },
        {
            "id": 3,
            "title": "Verificar el handshake",
            "desc": "ssh -T git@github.com debe responder «successfully authenticated».",
            "state": "done" if last.get("ok") else "pending",
            "detail": last.get("message", "Sin comprobar todavía") if last else "Sin comprobar todavía",
        },
    ]

    return {
        "host": platform.node(),
        "os": f"{platform.system()} {platform.release()}",
        "time": now_iso(),
        "git": {"name": name, "email": email, "version": run(["git", "--version"], 5)[1]},
        "key": {
            "exists": key_exists,
            "path": str(KEY),
            "public_path": str(PUBKEY),
            "public": public_key(),
            "fingerprint": fingerprint(),
            "created_at": key_created_at(),
            "ssh_dir_perms": ssh_dir_perms(),
        },
        "test": last,
        "github": {"reachable": check_github(timeout=3)},
        "steps": steps,
        "tools": {"ssh": shutil.which("ssh") or "", "git": shutil.which("git") or "",
                  "gh": shutil.which("gh") or ""},
    }


_gh_cache = {"at": 0.0, "value": False}


def check_github(timeout: int = 3) -> bool:
    """Comprobación barata y cacheada de que github.com responde en 443."""
    now = time.time()
    if now - _gh_cache["at"] < 30:
        return bool(_gh_cache["value"])
    sock = None
    ok = False
    try:
        import socket
        sock = socket.create_connection(("github.com", 443), timeout=timeout)
        ok = True
    except OSError:
        ok = False
    finally:
        if sock:
            sock.close()
    _gh_cache.update({"at": now, "value": ok})
    return ok


# --------------------------------------------------------------------------
# Acciones
# --------------------------------------------------------------------------
def generate_key() -> dict:
    if KEY.exists() and PUBKEY.exists():
        log_event("La clave ya existe; no se sobrescribe.", "warn", "consola")
        return {"ok": True, "already": True, "message": "La clave ya existía."}

    SSH_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chmod(SSH_DIR, 0o700)
    log_event(f"Preparando {SSH_DIR} con permisos 700.", "info", "consola")

    comment = f"{git_config('user.name') or 'gpb-codes'}@{platform.node()}"
    log_event("Ejecutando ssh-keygen -t ed25519 (sin passphrase).", "info", "consola")
    code, out, err = run([
        "ssh-keygen", "-t", "ed25519", "-N", "", "-C", comment,
        "-f", str(KEY),
    ], timeout=30)
    if code != 0:
        log_event(f"ssh-keygen falló: {err or out}", "error", "consola")
        return {"ok": False, "message": err or out}

    os.chmod(KEY, 0o600)
    os.chmod(PUBKEY, 0o644)
    fp = fingerprint()
    log_event("Clave creada correctamente.", "ok", "consola")
    log_event(f"Huella: {fp}", "info", "consola")
    return {
        "ok": True,
        "already": False,
        "fingerprint": fp,
        "public": public_key(),
        "message": "Clave ed25519 generada.",
    }


def test_connection() -> dict:
    if not PUBKEY.exists():
        msg = "Todavía no hay ninguna clave pública. Genera la clave primero."
        log_event(msg, "warn", "consola")
        return {"ok": False, "message": msg, "checked_at": now_iso()}

    log_event("Probando ssh -T git@github.com …", "info", "consola")
    code, out, err = run([
        "ssh", "-T",
        "-o", "BatchMode=yes",
        "-o", "StrictHostKeyChecking=accept-new",
        "-o", "ConnectTimeout=15",
        "git@github.com",
    ], timeout=30)

    raw = "\n".join(part for part in (out, err) if part).strip()
    ok = "successfully authenticated" in raw
    useful = [ln for ln in raw.splitlines()
              if ln.strip() and not ln.startswith(("Warning:", "Permanently added"))]
    first = useful[-1] if useful else (raw.splitlines()[0] if raw
                                       else f"ssh terminó con código {code}")
    if ok:
        log_event("Handshake correcto: GitHub reconoce la clave.", "ok", "consola")
    elif "Permission denied" in raw:
        log_event("GitHub rechazó la clave: aún no está autorizada en tu cuenta.",
                  "warn", "consola")
    else:
        log_event(f"Sin éxito: {first}", "error", "consola")

    result = {
        "ok": ok,
        "code": code,
        "message": first,
        "raw": raw,
        "checked_at": now_iso(),
    }
    with _state_lock:
        write_last_test(result)
    return result


# --------------------------------------------------------------------------
# HTTP
# --------------------------------------------------------------------------
class Handler(BaseHTTPRequestHandler):
    server_version = "AccessConsole/1.0"

    def log_message(self, fmt: str, *args) -> None:  # silencio en consola
        pass

    # -- helpers ------------------------------------------------------------
    def _json(self, data: dict | list, code: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length <= 0 or length > 1_000_000:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return {}

    def _static(self, path: str) -> None:
        rel = path.lstrip("/") or "index.html"
        candidate = (PUBLIC / rel).resolve()
        try:
            candidate.relative_to(PUBLIC.resolve())
        except ValueError:
            self._json({"error": "ruta no permitida"}, 403)
            return
        if candidate.is_dir():
            candidate = candidate / "index.html"
        if not candidate.is_file():
            self._json({"error": "no encontrado"}, 404)
            return
        ctype, _ = mimetypes.guess_type(str(candidate))
        ctype = ctype or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript",
                                                   "application/json",
                                                   "image/svg+xml"):
            ctype += "; charset=utf-8"
        body = candidate.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    # -- rutas --------------------------------------------------------------
    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/status":
            self._json(status_payload())
        elif path == "/api/public-key":
            self._json({"public": public_key(), "fingerprint": fingerprint(),
                        "path": str(PUBKEY), "exists": PUBKEY.exists()})
        elif path == "/api/events":
            after = 0.0
            if "after=" in self.path:
                try:
                    after = float(self.path.split("after=", 1)[1].split("&")[0])
                except ValueError:
                    after = 0.0
            self._json({"events": read_events(after)})
        elif path.startswith("/api/"):
            self._json({"error": "endpoint desconocido"}, 404)
        else:
            self._static(path)

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/key":
            self._json(generate_key())
        elif path == "/api/test":
            self._json(test_connection())
        elif path == "/api/event":
            data = self._read_json()
            message = str(data.get("message", "")).strip()[:2000]
            if not message:
                self._json({"error": "mensaje vacío"}, 400)
                return
            level = str(data.get("level", "info"))
            actor = str(data.get("actor", "agente"))
            self._json({"ok": True, "event": log_event(message, level, actor)})
        else:
            self._json({"error": "endpoint desconocido"}, 404)


def main() -> int:
    STATE.mkdir(parents=True, exist_ok=True)
    if not EVENTS.exists():
        log_event("Consola iniciada. Esperando acciones.", "info", "consola")
    else:
        log_event("Consola reiniciada.", "info", "consola")

    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"  GitHub Access Console  →  http://{HOST}:{PORT}", flush=True)
    print("  Ctrl+C para detener.\n", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDetenido.")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
