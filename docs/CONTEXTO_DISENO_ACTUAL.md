# Nexo — Contexto, estilo y diseño (estado actual)

**Fecha:** 28 de noviembre de 2026  
**Repositorio:** https://github.com/gpb-codes/nexo  
**Rama:** `main`  
**Último commit base:** `787aa59` (`rediseño visual: dashboard con esfera 3D y sistema de diseño`)

Este documento consolida el contexto funcional, la arquitectura y el lenguaje visual de Nexo. Complementa `CONTEXTO.md` y `docs/design/DESIGN_SYSTEM.md`; no los reemplaza.

---

## 1. Qué es Nexo

Nexo es un centro de operaciones personal que unifica segundo cerebro, tareas, proyectos, notas, contactos, fotos, capturas NFC/cámara, perfil, GitHub, voz y asistente IA configurable.

- La **web** sigue activa y no se retira hasta lograr paridad funcional en móvil.
- La **app móvil** es Android con Expo/React Native, en migración gradual desde la web.
- El **segundo cerebro** vive en Quartz/Next.js y se abre desde la app y la web.
- Todo el contenido mostrado debe venir de datos reales. No se inventan tareas, proyectos ni actividad.

---

## 2. Mapa del repositorio

| Ruta | Rol | Estado |
|---|---|---|
| `unified-app/` | Web + Cloudflare Pages Functions + D1. Auth, tareas, proyectos, notas, ajustes, PWA, capturas y grafo. | Producción: https://unified-app-n8d.pages.dev. Rediseño local en `main` pendiente de aprobación para despliegue. |
| `quartz/` | Segundo cerebro original con Quartz. | https://segundo-cerebro-e4v.pages.dev |
| `next-quartz/` | Reemplazo con Next.js + Three.js + grafo JARVIS. | https://segundo-cerebro-next.pages.dev/grafo/ |
| `mobile/` | App Android Expo/React Native. | APK de prueba instalado por USB; paquete `com.gpbcode.nexo`. |
| `auth-portal/` | Portal legacy. | Legacy. |
| `github-access-console/` | Consola local para GitHub. | Local. |
| `docs/design/` | Sistema de diseño, auditoría y changelog visual. | Documentación técnica. |
| `docs/DESKTOP_PARIDAD.md` | Plan para app desktop en paridad. | Propuesta, sin implementar. |

---

## 3. Arquitectura

### Backend (`unified-app/functions/`)

Se mantiene Cloudflare Pages Functions como núcleo. No se reescribe el backend.

```text
functions/
  api/                         controladores delgados (HTTP)
  _lib/
    domain/                    entidades, errores, validaciones puras
    application/               casos de uso, container, usuario actual
    infrastructure/
      d1/                      repositorios D1
      security/                PBKDF2, tokens opacos y cookies
      http/                    respuestas ok/fail/readJson
      ai/                      proxy OpenAI-compatible
```

Contratos importantes:

- Web: cookie HttpOnly `nexo_session`.
- Móvil: `Authorization: Bearer <token>` desde SecureStore.
- Contraseñas: PBKDF2; en D1 solo se guarda hash del token, nunca el token plano.
- No usar `wrangler d1 migrations apply`: existe deriva histórica. Aplicar con `wrangler d1 execute --file=...`.

### Móvil (`mobile/src/`)

Arquitectura limpia:

```text
src/
  domain/          entidades e interfaces de repositorio
  application/     casos de uso, container y query keys
  infrastructure/  cliente HTTP, SecureStore, SQLite, repositorios y outbox
  presentation/    hooks de TanStack Query, componentes UI y tokens
app/               pantallas Expo Router
```

Stack: Expo SDK 58, React Native 0.88, TypeScript, Expo Router, TanStack Query, Zustand, expo-sqlite, expo-secure-store, expo-local-authentication, cámara, notificaciones y Reanimated.

### Servicios Rust / Go / Python

Decisión acordada: **servicios aislados**, sin sustituir auth ni D1.

- Rust: búsqueda/índice de contenido.
- Go: sincronización/outbox y normalización de operaciones.
- Python: análisis de documentos y apoyo al asistente IA.

Estado: decisión arquitectónica registrada; implementación pendiente. Deben exponerse como servicios propios y ser opcionales: si no hay URL configurada, Nexo debe seguir funcionando con el backend actual.

---

## 4. Funcionalidades actuales

### Web

- Login, registro, logout y sesión real.
- Tareas con prioridad, categoría, fecha límite, filtros y progreso.
- Proyectos con estado y prioridad.
- Notas, contactos y fotos; cámara y NFC reales cuando el dispositivo los soporta.
- Ajustes de tema, acento, avatar, nombre visible e identidad del sitio.
- Asistente IA con clave detrás del servidor.
- PWA instalable y service worker network-first.
- Grafo 3D estilo universo con HUD JARVIS.
- Rediseño visual local: esfera 3D, bienvenida dinámica, paneles con datos reales, sidebar, bottom nav y búsquedas locales.

### Móvil

- Login/registro con token en SecureStore.
- **Desbloqueo biométrico local** con `expo-local-authentication`:
  - Tras login con contraseña se ofrece activar huella/rostro.
  - El flag se guarda en SecureStore; la biometría desbloquea el token ya guardado.
  - Al arrancar aparece una pantalla de bloqueo si biometría está activa.
  - “Usar contraseña” limpia token y flag, y vuelve al login.
  - Cerrar sesión limpia también el flag biométrico.
  - No cambia el backend ni introduce passkeys/WebAuthn.
- Tareas con proyecto, responsable, etiquetas, SQLite cache y outbox idempotente por `clientId`.
- Proyectos con fecha límite, color, rol, miembros, progreso y acceso al detalle.
- Detalle de proyecto con tareas, documentos, miembros e invitaciones.
- Documentos personales y de proyecto, con historial de versiones y actividad.
- Notas, contactos, ajustes, chat IA y segundo cerebro embebido.
- Shell visual compartido: topbar, bottom nav, “Más” y pantallas consecuentes.

### Colaboración (backend + móvil)

Migración no destructiva: `unified-app/migrations/0009_collaboration.sql`.

Tablas nuevas:

- `project_members`: `owner`, `editor`, `viewer`.
- `documents`: documento personal o vinculado a un proyecto.
- `document_versions`: snapshot de cada edición.
- `activity_log`: actor, acción, entidad, proyecto y detalle JSON.

Columnas nuevas:

- `projects.due_date`, `projects.color`.
- `tasks.project_id`, `tasks.assignee_id`, `tasks.tags`.

Endpoints nuevos/ampliados:

- `GET /api/projects?id=` → detalle con proyecto, miembros, documentos, tareas y actividad.
- `GET|POST|DELETE /api/project-members` → invitaciones y roles.
- `GET|POST|PUT|DELETE /api/documents` → documentos y versiones.
- `GET /api/activity?projectId=` → actividad del proyecto.
- `/api/tasks` y `/api/projects` aceptan los nuevos campos sin romper los anteriores.

Reglas:

- La invitación requiere cuenta previa; no se envían correos automáticos.
- `owner` puede invitar y quitar miembros; `viewer` solo lee.
- `editor` puede editar tareas, proyectos y documentos.
- Eliminar proyecto y documento queda restringido al propietario.

Estado: código implementado y chequeado con `node --check`. Migración aplicada en D1 local; **no aplicada en remoto ni desplegada**. La web todavía no consume la UI de colaboración.

---

## 5. Sistema visual

### Principios

- Minimalismo tecnológico: cada elemento tiene una función.
- Claridad antes que decoración.
- Superficies oscuras azuladas, nunca negro puro.
- Morado como identidad; cian/azul para interacción y estados.
- Componentes reutilizables y consistentes entre web y móvil.
- Responsive por composición, no solo por escala.
- Movimiento sutil y respetuoso con `prefers-reduced-motion`.
- Sin datos ficticios y sin ocultar funciones existentes.

### Tokens compartidos

| Uso | Valor |
|---|---|
| Identidad morada | `#8b5cf6` / acento suave `#a78bfa` |
| Cielo y cian | `#7dd3fc` / `#67e8f9` |
| Fondo oscuro | `#050924`, superficie `#0f1022` |
| Fondo claro | `#f8fafc`, superficie `#ffffff` |
| Texto | `#f8fafc` sobre oscuro, `#0f172a` sobre claro |
| Espaciado | `4 / 8 / 12 / 16 / 24 / 32` |
| Radios web | `8 / 12 / 18 / 24 px` |
| Radios móvil | `10 / 14 / 20 / 26 / pill` |
| Tipografía | `Inter` para UI; monoespacio para metadatos y HUD |

### Web

- Variables CSS y clases `.ui-*` en `unified-app/public/`.
- Sidebar fija en escritorio; bottom nav en móvil.
- Dashboard con esfera 3D y bienvenida dinámica.
- Ver `docs/design/DESIGN_SYSTEM.md` y `docs/design/REDISENO_VISUAL_AUDIT.md`.

### Móvil

- Sistema en `mobile/src/presentation/components/ui.tsx`.
- `AppScreen`, `TopBar`, `BottomNav`, `UiCard`, `UiButton`, `UiInput`, `Badge`, `ProgressBar`, `Avatar`, `EmptyState` y `PageHeader`.
- Avatares DiceBear: SVG en web, PNG en móvil.
- `back` en `AppScreen` para pantallas de detalle.
- La navegación inferior mantiene Inicio, Tareas, Proyectos, Second Brain, Notas y Más.
- Documentos y detalle de proyecto/documento comparten el mismo lenguaje visual.

### Accesibilidad

- Targets táctiles ≥42 px.
- `aria-label` / `accessibilityLabel` en controles iconográficos.
- Foco visible en web y estados pressed en móvil.
- Etiquetas visibles en inputs.
- Movimiento reducido respetado en el grafo y la esfera.

---

## 6. Estado operativo y validación

- TypeScript móvil: `npx tsc --noEmit` aprobado.
- Backend: `node --check` aprobado en repositorios, casos de uso y controladores nuevos.
- D1 local: migraciones `0001`–`0009` aplicadas en `/tmp/nexo-d1` con `wrangler d1 execute --local`. `0002` reporta columna duplicada por deriva histórica conocida; `0009` aplicó correctamente.
- Servidor local de validación: `wrangler pages dev public --local --persist-to /tmp/nexo-d1 --port 8788`.
- APK: build local de depuración para instalación por USB; producción no tocada. Se removió `expo-dev-client` para que el APK abra directamente la app y no el Dev Launcher que pide una URL de Metro.
- Dispositivo de prueba detectado por USB: `2806ac560d26`.

### No hacer sin aprobación explícita

- Desplegar el rediseño web a producción.
- Aplicar `0009` a D1 remoto.
- Publicar una nueva versión de la app en tiendas.
- Sustituir Cloudflare Functions por otros servicios.
- Usar secretos reales, datos inventados, NFC/cámara simulados o migraciones destructivas.

---

## 7. Comandos útiles

```bash
# Móvil
cd mobile
npx tsc --noEmit
npx expo prebuild --platform android --no-install
cd android
ANDROID_HOME="$HOME/.local/share/android-sdk" ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a

# Instalar por USB
export PATH="$HOME/.local/platform-tools:$PATH"
adb devices -l
adb -s 2806ac560d26 install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk

# Backend local
cd unified-app
for f in migrations/000*.sql; do
  npx wrangler d1 execute DB --local --persist-to /tmp/nexo-d1 --file="$f"
done
npx wrangler pages dev public --local --persist-to /tmp/nexo-d1 --port 8788
```

---

## 8. Pendiente

1. Terminar verificación de los endpoints nuevos con D1 local.
2. Aplicar `0009` a D1 remoto solo tras aprobación.
3. Desplegar backend de colaboración y confirmar que la web consume los mismos contratos.
4. Integrar UI de colaboración en la web.
5. Implementar servicios aislados Rust/Go/Python con fallbacks opcionales.
6. Probar biometría real en el dispositivo (huella o rostro).
7. Commit/push y posterior aprobación para despliegue.
8. Crear la app desktop en paridad; plan en `docs/DESKTOP_PARIDAD.md`.
