# Arquitectura de Nexo

## Capas

1. **Presentación**: `unified-app/public/` (HTML, CSS, JS, PWA).
2. **API**: `unified-app/functions/api/` (Cloudflare Pages Functions).
3. **Datos**: Cloudflare D1 (`unified-app-db`).
4. **Integraciones**: GitHub (consola local/estática), Quartz (publicación), voz (Web Speech API).

## Módulos principales

- Autenticación y sesión: `functions/_lib/auth.js`, `api/register.js`, `api/login.js`, `api/logout.js`, `api/me.js`.
- Preferencias: `api/preferences.js`.
- Tareas: `api/tasks.js`.
- Voz: frontend Web Speech API.
- Segundo cerebro: iframe a Quartz + enlaces.

## Principios

- La identidad se deriva únicamente de la cookie de sesión validada en el servidor.
- Los servicios externos son opcionales y desactivables.
- Sin secretos en el frontend.
- Migraciones SQL versionadas en `migrations/`.
