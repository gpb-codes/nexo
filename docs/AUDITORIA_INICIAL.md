# Auditoría inicial — Ecosistema Nexo

Fecha: 2026-10-27

## 1. Alcance y método

Se inspeccionaron los directorios locales, la configuración de Cloudflare, las bases D1 remotas, el repositorio de la bóveda y el servidor local de la consola GitHub. No se desplegó nada ni se modificaron datos de producción durante la auditoría (salvo consultas de lectura).

## 2. Inventario verificado

| Componente | Ruta | Git | Despliegue verificado |
|---|---|---|---|
| GitHub Access Console | `github-access-console/` | No es repo Git | Local `127.0.0.1:8787`; Pages `github-access-console.pages.dev` (según docs) |
| Auth Portal | `auth-portal/` | No es repo Git | Pages `auth-portal-px1.pages.dev`; D1 `auth-portal-db` |
| App unificada (Nexo) | `unified-app/` | No es repo Git | No desplegado verificado |
| Quartz | `quartz/` | Repo `v5` (upstream), cambios locales sin commit | Pages `segundo-cerebro-e4v.pages.dev` (según docs) |
| Bóveda Obsidian | `~/Documentos/general/` | Repo `main`, limpio | GitHub privado `gpb-codes/second-brain` |

## 3. Estado verificado de cada componente

### 3.1 GitHub Access Console
- `server.py` escucha únicamente en `127.0.0.1` (correcto).
- Expone estado SSH, huella, handshake, registro de eventos.
- `build_static.py` redacta correo y rutas del home; no incluye clave privada.
- No tiene base de datos.
- Riesgo: la versión estática afirma estado "congelado"; no debe presentarse como estado en tiempo real.

### 3.2 Auth Portal / App unificada
- Código casi duplicado entre `auth-portal/` y `unified-app/`.
- Ambas usan Cloudflare Pages Functions y D1.
- Esquemas idénticos para `users`.
- `unified-app` añade `tasks`.
- **Autenticación insegura**: contraseñas con SHA-256 simple, sin salt.
- **Sin sesiones de servidor**: el frontend guarda `userId` en `localStorage` y lo envía en queries/body. Cualquier cliente puede leer/modificar datos de otro usuario (IDOR).
- CORS configurado como `*`.
- `me.js` acepta `id` por query string → IDOR directo.
- `tasks.js` acepta `userId` por body/query sin verificar identidad → IDOR directo.
- `preferences.js` acepta `id` por body → IDOR directo.
- No hay endpoint de logout real.
- `app.js` invocaba `boot()` sin definirla (error en consola) en la versión original.
- `loadGithubStatus()` afirmaba "Conectado" sin verificación real.
- `sendChat()` simulaba una respuesta de IA.
- Manifest PWA presente, pero no había service worker.

### 3.3 Quartz / Bóveda
- `quartz/content` es symlink válido a `~/Documentos/general`.
- La bóveda tiene 58 notas Markdown y la estructura documentada.
- `ignorePatterns` ignora `private`, `templates`, `.obsidian`, `.git`, `.github` y artefactos de proyectos.
- El plugin `encrypted-pages` está habilitado.
- Riesgo de privacidad: la publicación depende de nombres de carpeta/ignorePatterns. No existe una política explícita de publicación por nota. El repositorio privado no hace privado el sitio generado.
- El workflow `.github/workflows/deploy-second-brain.yml` clona Quartz upstream y copia `quartz.config.yaml` solo si existe en la raíz de la bóveda; en el estado actual ese archivo está en `quartz/`, por lo que el workflow probablemente no aplica la configuración personalizada. Además el nombre de proyecto en el workflow (`segundo-cerebro`) puede no coincidir con el proyecto real (`segundo-cerebro-e4v`).

### 3.4 Bases de datos D1
- `auth-portal-db` (`bab414e4-...`): tabla `users`, 1 usuario real.
- `unified-app-db` (`ffef4150-...`): tablas `users` y `tasks`, 0 usuarios y 0 tareas.
- No existe tabla `sessions`.
- No hay migraciones versionadas aplicadas en producción.

## 4. Problemas críticos

1. Contraseñas con SHA-256 sin salt (crítico).
2. IDOR en `me`, `preferences` y `tasks` por confiar en identificadores enviados por el cliente (crítico).
3. Ausencia de sesiones gestionadas por el servidor y de cookies seguras (crítico).
4. CORS `*` en endpoints privados (alto).
5. Posible exposición del contenido personal de la bóveda por Quartz si no se valida la protección (alto).
6. Workflow de GitHub Actions incompleto/posiblemente roto (medio).
7. Duplicación de código entre Auth Portal y app unificada (medio).
8. Funciones simuladas en la UI (GitHub "conectado", chat IA) (medio).

## 5. Arquitectura objetivo propuesta

- **Núcleo único**: `unified-app/` como aplicación Nexo.
- **Auth Portal** se considera fuente de usuarios existentes; se migrará su único usuario a `unified-app-db` cuando se apruebe.
- **Sesiones**: tabla `sessions` en D1, cookie `HttpOnly`, `Secure` en producción, `SameSite=Lax`.
- **Contraseñas**: PBKDF2 (Web Crypto) con salt e iteraciones, con migración transparente desde SHA-256 legacy.
- **Autorización**: cada endpoint deriva la identidad únicamente de la sesión del servidor.
- **Integraciones**: interfaces desacopladas y desactivables (GitHub, Quartz, voz, IA).
- **PWA**: service worker versionado, caché solo de recursos estáticos, sin datos privados.

## 6. Decisiones tomadas en esta fase

- No se consolidaron las dos bases D1 todavía. Se mantienen separadas para minimizar riesgo; `unified-app-db` queda como base principal de Nexo y se documenta la migración del usuario existente.
- Se implementó hashing PBKDF2 en lugar de Argon2id porque Argon2 no está disponible de forma nativa en Cloudflare Pages Functions y requeriría dependencias pesadas. PBKDF2 usa Web Crypto, disponible en el runtime.
- Se añadió una tabla `sessions` mediante migración no destructiva.
- Se corrigió el flujo de autenticación para usar cookies de sesión.
- Se eliminaron las afirmaciones no verificadas de "GitHub conectado" y la respuesta simulada del chat.

## 7. Riesgos abiertos

- Aplicar la migración `sessions` en producción requiere ejecución manual con Wrangler.
- Migrar el usuario existente de `auth-portal-db` a `unified-app-db` requiere aprobación (aunque es un único usuario).
- La privacidad real del sitio Quartz depende de Cloudflare Access o de una política de publicación revisada; no se cambió en esta fase.
- Rate limiting y protección CSRF avanzada quedan como trabajo posterior.
- No se ejecutaron pruebas automatizadas (no existen en el repositorio).

## 8. Acciones manuales requeridas

1. Aplicar `unified-app/migrations/0001_initial.sql` a `unified-app-db` en producción cuando se apruebe el despliegue.
2. Migrar el usuario `gabriel.pedreros.dev@gmail.com` desde `auth-portal-db` a `unified-app-db` si se desea conservar la cuenta en Nexo.
3. Configurar secretos de GitHub Actions (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) para el workflow de la bóveda.
4. Activar Cloudflare Access o definir una política explícita de publicación para Quartz antes de publicar contenido nuevo potencialmente privado.
PY