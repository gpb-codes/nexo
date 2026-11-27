# Nexo — Ecosistema personal

Repositorio: https://github.com/gpb-codes/nexo

Centro de operaciones personal que unifica segundo cerebro, tareas, proyectos, notas, contactos, fotos, capturas NFC/cámara, perfil, GitHub, Asistente IA con API key y voz.

## Estructura
- `unified-app/` — aplicación principal (Nexo).
- `auth-portal/` — portal de autenticación legacy.
- `github-access-console/` — consola SSH local/estática.
- `quartz/` — publicación original del segundo cerebro.
- `next-quartz/` — reemplazo del segundo cerebro con Next.js, Three.js y anime.js (https://segundo-cerebro-next.pages.dev).
- `mobile/` — esqueleto nativo Android con Expo/React Native (Fase 1 de migración).
- `docs/` — documentación.
- `CONTEXTO.md` — contexto para futuros agentes.

## Producción
- App: https://unified-app-n8d.pages.dev
- Proyecto Cloudflare Pages: `unified-app`
- Base D1: `unified-app-db`
- Estado: desplegado y verificado (25 nov 2026).

## Funciones principales
- Registro/login/logout con sesiones en cookie HttpOnly y contraseñas PBKDF2.
- Tareas y proyectos CRUD aislados por usuario.
- Identidad de la web editable por usuario: nombre, subtítulo, descripción, tema, acento, avatar y nombre visible.
- Notas, contactos y fotos guardados en la cuenta (`notes`).
- Pantalla de Contactos para posibles socios/colaboradores con acceso directo a WhatsApp.
- Mapa 3D del segundo cerebro en forma de universo con Three.js y lista curada de Quartz.
- Captura NFC (Web NFC, Chrome Android + HTTPS) y cámara con compresión de imagen.
- Asistente IA con campo para API key en Ajustes (`users.ai_api_key`).
- Página pública de términos en `/terminos`.
- PWA instalable como app web (`manifest.json`, `sw.js`, botón de instalación en Perfil).
- Botones de **descarga de app** y **apoyo al proyecto** (RUT, Banco Estado, CuentaRUT, acceso directo a transferencia).
- Botones de **descarga de app** y **apoyo al proyecto** (RUT, Banco Estado, CuentaRUT, acceso directo a transferencia).

## Desarrollo
```bash
cd unified-app
npx wrangler d1 execute unified-app-db --local --file=migrations/0004_site_settings.sql
npx wrangler d1 execute unified-app-db --local --file=migrations/0005_notes.sql
npx wrangler d1 execute unified-app-db --local --file=migrations/0006_ai_assistant.sql
npx wrangler pages dev public --port 8799
```

## Despliegue
```bash
cd unified-app
npx wrangler d1 execute unified-app-db --remote --file=migrations/0004_site_settings.sql
npx wrangler d1 execute unified-app-db --remote --file=migrations/0005_notes.sql
npx wrangler d1 execute unified-app-db --remote --file=migrations/0006_ai_assistant.sql
npx wrangler pages deploy public --project-name unified-app --branch main
```

Las migraciones `0004`–`0006` son aditivas. No se deben ejecutar las migraciones `0001`–`0003` de nuevo en una base existente porque `0002` añade una columna que ya puede estar presente.

Ver `docs/` para más detalle.
