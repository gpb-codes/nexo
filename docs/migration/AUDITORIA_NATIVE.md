# Auditoría técnica para migración nativa de Nexo

**Fecha:** 26 de noviembre de 2026  
**Entrada:** `NEXO_NATIVE_ARQUITECTURA_Y_MIGRACION.md` y `FUNCIONALIDADES_Y_DISENO.md`  
**Estado:** Fase 0 completada. No se modificó comportamiento productivo.

## 1. Árbol y herramientas

- Paquetes/manifiestos encontrados:
  - `unified-app/wrangler.toml` (Pages Functions + D1).
  - `next-quartz/package.json`, `next-quartz/package-lock.json`, `next-quartz/tsconfig.json`.
  - `quartz/package.json`, `quartz/package-lock.json`, `quartz/tsconfig.json`.
  - `auth-portal/wrangler.toml`, `github-access-console/wrangler.toml`.
- No existe `mobile/`.
- No hay monorepo: cada proyecto tiene su propio lockfile y scripts.
- Node `v26.12.0`, npm `12.2.1`.
- No hay `java`, `sdkmanager` ni `adb` en el entorno actual. Por tanto, **no se puede compilar Android localmente todavía**; se puede crear el esqueleto y validar TypeScript, pero no `expo run:android`.
- Versiones disponibles en registro: Expo `58.1.0`, expo-router `58.0.33`, expo-dev-client `58.0.22`, expo-sqlite `58.0.18`, expo-secure-store `58.0.3`, expo-camera `58.0.14`, TanStack Query `5.108.4`, Zustand `5.1.0`, Reanimated `4.8.0`.

## 2. Backend real (`unified-app/`)

### 2.1 Arquitectura

- Runtime: Cloudflare Pages Functions.
- Archivos: `functions/api/*.js` y helper `functions/_lib/auth.js`.
- Binding D1: `DB` → `unified-app-db` (`ffef4150-c7d6-4fe1-a003-f5cfa0e686b7`).
- `pages_build_output_dir = "public"`.
- No hay `package.json` en `unified-app/`: se gestiona con Wrangler CLI directamente.

### 2.2 Autenticación

Archivo: `functions/_lib/auth.js`.

- Cookie: `nexo_session`.
- TTL: 7 días (`SESSION_TTL_MS`).
- Token opaco aleatorio de 32 bytes, codificado base64url (`generateToken`).
- En D1 se guarda `SHA-256(token)` en `sessions.token_hash` (`hashToken`), nunca el token plano.
- Sesión válida exige: fila existente, `revoked_at` nulo y `expires_at` futuro (`getSessionUser`).
- Contraseñas:
  - PBKDF2-SHA256, 100000 iteraciones, salt de 16 bytes (`hashPassword`).
  - Formato `pbkdf2$iterations$salt$hash`.
  - Soporte legacy SHA-256 migrado al login (`verifyPassword` + `login.js`).
  - Comparación con `timingSafeEqualBytes`/`timingSafeEqualHex`.
- Cookie HttpOnly, `SameSite=Lax`, `Path=/`, `Secure` solo si la petición es HTTPS (`buildSessionCookie`). Revocación con `buildClearCookie`.
- Rutas:
  - `POST /api/register`: valida nombre 2–80, email regex y longitud ≤254, password 8–128; crea usuario, `site_settings` inicial y sesión; responde `201` con `user` y `Set-Cookie`.
  - `POST /api/login`: valida email/password, verifica usuario, migra hash legacy, actualiza `last_login`, crea sesión, responde `200` con `user` y `Set-Cookie`. Errores `400` y `401`.
  - `POST|GET /api/logout`: revoca sesión y limpia cookie, responde `200`.
  - `GET /api/me`: usa `getSessionUser`; `401` sin sesión.

**Hallazgo A1:** `login.js` construye `safeUser` con `aiApiKey`, `aiModel` y `aiBaseUrl`, pero su `SELECT` no incluye esas columnas. En login esos campos siempre quedan `null`; `/api/me` sí los devuelve porque `getSessionUser` los selecciona. Corregir en Fase 2, con prueba de caracterización.

**Hallazgo A2:** no hay rotación de token ni endpoint de refresh. El token vive hasta expiración o revocación en logout.

### 2.3 Catálogo de endpoints

| Ruta | Métodos | Autenticación | Payload relevante | Respuesta |
|---|---|---|---|---|
| `/api/register` | POST | no | `name`, `email`, `password` | `201 {ok,user}` + cookie |
| `/api/login` | POST | no | `email`, `password` | `200 {ok,user}` + cookie |
| `/api/logout` | POST/GET | no (revoca cookie) | — | `200 {ok}` |
| `/api/me` | GET | cookie | — | `200 {ok,user}` |
| `/api/tasks` | GET/POST/PUT/DELETE | cookie | tarea con `title`, `description`, `priority`, `status`, `category`, `due_date`, `id` | listas, `{ok,...}`; `400/401/404/500` |
| `/api/projects` | GET/POST/PUT/DELETE | cookie | `name`, `description`, `status`, `priority`, `id` | listas, `{ok,...}`; `400/401/404/500` |
| `/api/notes` | GET/POST/DELETE | cookie | `kind`, `title`, `content`, `contact`, `image`, `source`, `id` | listas/detalle, `{ok,...}`; `400/401/404/500` |
| `/api/preferences` | PUT | cookie | `siteName`, `siteTagline`, `siteDescription`, `avatar`, `accent`, `theme`, `displayName`, `aiApiKey`, `aiModel`, `aiBaseUrl` | `200 {ok,message,site}` |

Validaciones confirmadas:

- `tasks.js`: `ALLOWED_PRIORITY = {alta,media,baja}`, `ALLOWED_STATUS = {pendiente,completada}`, fecha `YYYY-MM-DD`, título 1–200. El `GET` ordena por estado, prioridad, `due_date` y `created_at`.
- `projects.js`: prioridades `{alta,media,baja}`; estados `{activo,pausado,completado,archivado}`; nombre 1–120.
- `notes.js`: `ALLOWED_KINDS = {nota,contacto,foto,nfc}`, `ALLOWED_SOURCES = {manual,nfc,camara}`; imagen data URL JPEG/PNG/WebP, máximo 950000 caracteres; foto exige imagen.
- `preferences.js`: avatars de DiceBear whitelist, color `#[0-9a-fA-F]{6}`, tema `claro|oscuro`, longitudes acotadas.

**Hallazgo A3:** todas las escrituras filtran por `user_id` en `WHERE`/`INSERT`; el aislamiento por usuario está presente en las rutas auditadas.

**Hallazgo A4:** no hay rate limiting, ni token CSRF explícito. La cookie `SameSite=Lax` y el uso de JSON limitan el riesgo, pero conviene reforzar antes de exponer nuevos clientes.

### 2.4 Esquema D1 remoto verificado

Tablas: `users`, `sessions`, `tasks`, `projects`, `site_settings`, `notes`, `_cf_KV`.

- `users`: `id`, `name`, `email`, `password`, `avatar`, `accent`, `display_name`, `created_at`, `last_login`, `theme`, `ai_api_key`, `ai_model`, `ai_base_url`.
- `sessions`: `id`, `user_id`, `token_hash`, `created_at`, `expires_at`, `revoked_at`.
- `tasks`: incluye `due_date` y `category` al final de la definición por migración aditiva.
- `projects`: `status`, `priority`, timestamps.
- `site_settings`: `user_id` PK, `site_name`, `tagline`, `description`, `updated_at`.
- `notes`: campos de contacto e `image_data` TEXT.

**Hallazgo A5:** la deriva histórica es real. `users.theme` fue añadido por `0002` aunque `0001` ya lo contemplaba en el archivo local; `d1_migrations` no aparece entre las tablas remota. No ejecutar `wrangler d1 migrations apply`; usar `wrangler d1 execute --file=...` ya aplicado.

**Hallazgo A6 (datos actuales):** conteos remotos: `users=1`, `sessions=3`, `notes=1`; la única nota no tiene imagen. No hay evidencia de fotos históricas que migrar a R2 en este momento. Igualmente, el límite de 950000 caracteres de data URL sigue siendo un techo artificial que conviene sustituir antes de crecer.

## 3. Dependencias de navegador a reemplazar

Archivo principal: `public/app.js`.

| API web | Ubicación | Reemplazo móvil |
|---|---|---|
| `NDEFReader` | `app.js:771, 894, 931, 943` | módulo NFC nativo Android; iOS separado |
| `getUserMedia` | `app.js:775, 1002, 1012` | Expo Camera / API nativa |
| `SpeechRecognition` / `speechSynthesis` | `app.js:1344, 1345, 1350, 1408` | speech recognition/TTS nativo |
| `serviceWorker` | `app.js:1831, 1832` | instalación nativa + SQLite/sync |
| Three.js DOM/WebGL + `CanvasTexture` | `public/brain.js:28, 119` | Three.js en RN u overlay nativo |
| CSS2D implícito | `brain.js` sprites | overlays nativos |
| PWA/install prompt | `manifest.json`, `app.js` | build nativo |

Otras dependencias web: `window`, `document`, `localStorage` indirecto vía cookies, `fetch` con credenciales de cookie. El cliente móvil necesitará bearer token en `Authorization`.

## 4. Segundo cerebro

- `unified-app/public/brain.js`: universe graph con Three.js, sprites de etiquetas, estrellas, halo central y detalle de notas.
- `unified-app/public/brain-graph.json`: grafo derivado del índice de Quartz.
- `next-quartz/app/grafo/client.tsx`: reemplazo Next.js con:
  - `CSS2DRenderer` para nombres/rutas de archivo.
  - `LineSegments2`, `LineSegmentsGeometry`, `LineMaterial` para conexiones curvas.
  - `OrbitControls`, WASD/flechas y joystick digital.
  - anime.js v4 para entradas/hover/search.
- 322 nodos y 718 conexiones en `next-quartz/public/brain-graph.json`.

**Hallazgo A7:** las etiquetas CSS2D y el HUD no son portables a React Native. Requieren prueba de concepto separada, con fallback 2D/lista si el rendimiento no es aceptable.

## 5. Seguridad observada

- TLS en producción.
- Headers en `public/_headers`: CSP con `script-src 'self' 'unsafe-inline'` para import map de Three.js, `Permissions-Policy` con `camera=(self)`, `X-Frame-Options: DENY`, HSTS.
- Sesiones opacas server-side, hash en D1.
- Contraseñas PBKDF2, comparación timing-safe.
- `AI API key` se guarda en D1 y se devuelve en `/api/me` al usuario autenticado; en móvil debe vivir solo en el backend/proxy, nunca en el bundle.
- No se encontraron secretos hardcodeados en los archivos auditados.

## 6. Decisiones de migración confirmadas

1. Conservar `unified-app/` y los despliegues web hasta paridad móvil.
2. Reutilizar D1 y las reglas de negocio actuales inicialmente.
3. Cliente móvil Expo + TypeScript, development build desde el inicio.
4. Bearer token opaco en `Authorization`, con el hash en D1; revisar compatibilidad con la cookie actual en una capa de transición.
5. SQLite local como caché y outbox; no como fuente de verdad.
6. R2 para binarios solo después de medir y diseñar backfill.
7. NFC y cámara como adaptadores nativos; sin simulación.
8. Grafo 3D como módulo posterior al núcleo funcional.

## 7. Backlog inmediato

- P0: corregir A1 y añadir prueba decharacterization de login/me.
- P0: crear `mobile/` sin tocar producción; configurar Expo Router, tema y cliente API tipado.
- P0: definir contrato de autenticación móvil compatible con sesiones opacas.
- P1: instalar JDK/Android SDK o usar EAS Build para validar compilación Android.
- P1: characterization tests de `/api/tasks`, `/api/projects`, `/api/notes`, `/api/preferences`.
- P1: diseñar esquema SQLite y outbox.
- P2: prueba de concepto de Three.js en React Native.
- P2: diseñar proxy backend para IA.

## 8. Avances posteriores a la auditoría

- Corregido `login.js`: el `SELECT` ahora incluye `ai_api_key`, `ai_model` y `ai_base_url` (hallazgo A1).
- `functions/_lib/auth.js` acepta `Authorization: Bearer` además de la cookie, también para revocación.
- Añadidos contratos móviles aditivos:
  - `POST /api/mobile/login` → `{ok,user,token,expiresAt}`.
  - `POST /api/mobile/register` → `{ok,user,token,expiresAt}`.
  - Logout reutiliza `POST /api/logout` con Bearer.
- `mobile/` incorpora login/registro, SecureStore, sesión verificada, tareas, proyectos, notas, contactos, ajustes y caché SQLite con outbox para tareas.
- Verificado con usuario temporal: registro móvil, `/api/me` con Bearer, `/api/tasks` con Bearer, logout y `401` posterior. Usuario temporal eliminado.

## 9. Comandos de verificación usados

```bash
node --check functions/api/*.js functions/_lib/auth.js
npx wrangler d1 execute unified-app-db --remote --command "SELECT name, sql FROM sqlite_master WHERE type='table';"
npx wrangler d1 execute unified-app-db --remote --command "SELECT COUNT(*) AS notes, SUM(CASE WHEN image_data IS NOT NULL THEN 1 ELSE 0 END) AS with_image, MAX(LENGTH(image_data)) FROM notes;"
grep -RInE "NDEFReader|getUserMedia|SpeechRecognition|serviceWorker|THREE" public functions
```
