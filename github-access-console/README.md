# GitHub Access Console

Pequeña consola local (Python, sin dependencias) que muestra **el proceso real**
de conectar este equipo a GitHub por SSH: estado de la clave, huella, handshake
y un registro en vivo de cada acción. La clave privada nunca se muestra, nunca
se envía y nunca se escribe en el registro.

## Uso local

```bash
cd 08_Proyectos/github-access-console
python3 server.py          # http://127.0.0.1:8787
PORT=9000 python3 server.py
```

1. Pulsa **Generar clave SSH** (crea `~/.ssh/id_ed25519`, sin passphrase).
2. Pulsa **Copiar** y pega la pública en <https://github.com/settings/ssh/new>.
3. Pulsa **Probar conexión**. Debe decir «successfully authenticated».

## Versión estática para Cloudflare Pages

La página puede publicarse tal cual en Cloudflare Pages: el servidor local no
se necesita y el estado se congela como instantánea redactada.

Despliegue actual: <https://github-access-console.pages.dev>

```bash
cd 08_Proyectos/github-access-console
python3 build_static.py     # genera dist/
./deploy.sh                 # requiere: npx wrangler login (una sola vez)
```

`build_static.py` lee el estado real, redacta el correo y las rutas del
`$HOME` y genera `dist/` con `snapshot.json`. La clave privada nunca se
incluye. Los controles quedan deshabilitados en la versión estática.

## Estructura

```
server.py            API local + servidor estático (solo 127.0.0.1)
public/index.html    interfaz
public/styles.css    estilos (glassmorphism, sin CDN)
public/app.js        lógica, polling y modo demostración/instantánea
build_static.py      genera dist/ para Cloudflare Pages
deploy.sh            build + deploy con Wrangler
wrangler.toml        configuración de Pages
state/events.jsonl   registro local de acciones (ignorado por git)
state/last-test.json último resultado del handshake
```

## Notas de seguridad

- El servidor escucha únicamente en `127.0.0.1`; no hay telemetría.
- La clave se crea sin passphrase para permitir automatización. Si prefieres
  una passphrase, usa `ssh-agent` y arranca el agente en cada sesión.
- `state/` contiene actividad del equipo: no lo publiques.
- Para exponerlo en internet, publica solo la parte estática (modo guía) o
  pon el túnel detrás de Cloudflare Access. Nunca subas `state/` ni `~/.ssh`.
- En la versión estática se redactan el correo, las rutas del home y el
  estado se congela; la clave privada no se incluye.
