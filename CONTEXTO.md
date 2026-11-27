# CONTEXTO — Nexo

## Qué es Nexo
Centro de operaciones personal que unifica segundo cerebro (Obsidian/Quartz), tareas, proyectos, notas, contactos, fotos, capturas NFC/cámara, Asistente IA con API key, perfil, GitHub y voz. Núcleo actual: `unified-app/`.

## Ubicación de proyectos
- `github-access-console/` — consola SSH local/estática.
- `auth-portal/` — portal de autenticación (legacy, 1 usuario).
- `unified-app/` — app unificada (Nexo core).
- `quartz/` — publicación del segundo cerebro.
- `~/Documentos/general/` — bóveda de Obsidian (repo privado).

## Qué funciona realmente
- Registro/login/logout con sesiones en cookie HttpOnly.
- Contraseñas con PBKDF2 + migración desde SHA-256 legacy.
- Tareas y proyectos CRUD aislados por usuario (sesión del servidor).
- Preferencias por usuario, incluyendo tema claro/oscuro.
- Identidad de la web por usuario en `site_settings`: nombre, subtítulo, descripción, tema, acento, avatar y nombre visible.
- Notas, contactos y fotos en `notes`, aislados por cuenta.
- Pantalla de Contactos para posibles socios/colaboradores con acceso directo a WhatsApp.
- Mapa 3D del segundo cerebro en forma de universo con Three.js (`brain.js`, `brain-graph.json`) + leyenda, controles de centro/rotación y lista curada de Quartz.
- Asistente IA con campo para API key en Ajustes (`users.ai_api_key`).
- Captura real con Web NFC (solo Chrome Android + HTTPS + etiquetas NDEF) y cámara (`getUserMedia`, HTTPS/localhost).
- Página pública de términos y condiciones en `/terminos`.
- GitHub: consulta real de la API pública (perfil y repositorios).
- Voz (Web Speech API) en navegadores compatibles.
- PWA con service worker (caché solo estáticos) e instalación.

## Producción
- URL: https://unified-app-n8d.pages.dev
- Proyecto Pages: `unified-app`.
- Base D1 remota: `unified-app-db`.
- Migraciones remotas aplicadas: `0001_initial.sql`, `0002_add_theme.sql`, `0003_projects.sql`, `0004_site_settings.sql`, `0005_notes.sql`, `0006_ai_assistant.sql`.
- Despliegue verificado el 25 nov 2026.

## Pendiente
- Migración del usuario existente de `auth-portal-db`.
- Rate limiting, CSRF avanzado.
- Integración real de IA, Hermes/Coucou (GitHub ya usa API pública real).
- Privacidad efectiva de Quartz.
- CI/CD de la bóveda.
- Repositorio Git para `unified-app` (no existe todavía).

## Decisiones vigentes
- Base principal de Nexo: `unified-app-db`.
- Sesiones server-side en D1.
- PBKDF2 en lugar de Argon2id por compatibilidad con el runtime.
- No se fusionaron físicamente todos los repositorios.

## Comandos habituales
- Dev: `cd unified-app && npx wrangler pages dev public --port 8799`
- Migración local: `npx wrangler d1 execute unified-app-db --local --file=migrations/0006_ai_assistant.sql`
- Migración remota: `npx wrangler d1 execute unified-app-db --remote --file=migrations/0006_ai_assistant.sql`
- Despliegue: `npx wrangler pages deploy public --project-name unified-app --branch main`
- No usar `wrangler d1 migrations apply` con esta base: la migración `0002` no es repetible y la tabla `d1_migrations` está vacía por la deriva histórica.

## Pruebas ejecutadas
- Registro, login, logout, me, tareas, preferencias y proyectos mediante curl en dev local.
- Flujo completo en producción con usuario temporal: registro, sesión, `/api/me`, creación de proyecto, creación de tarea, cambio de tema, listados y logout.
- Datos temporales de producción eliminados; conteos finales en 0.
- Migración de contraseña SHA-256 legacy a PBKDF2 verificada.
- Acceso no autenticado devuelve 401; sesión cerrada también devuelve 401.
- Service worker activo y sin errores de consola en producción.
- Captura local verificada: nota manual, listado, detalle, filtros y borrado.
- Pantalla de Contactos verificada: guardado por UI, acceso WhatsApp en la lista y texto honesto.
- Mapa 3D verificado en el navegador: canvas activo, `brainStats` con nodos/conexiones y sin errores de consola.
- Ajustes verificados: identidad de la web persistida, nombre visible restablecido al vaciar el campo y API key del asistente guardada.
- Cámara sin dispositivo: la interfaz muestra un error honesto y no simula la captura.
- Web NFC no disponible en escritorio: los controles se deshabilitan y se explica la limitación.
- Cámara en producción requiere HTTPS; NFC real requiere Android con Chrome y etiqueta NDEF física.

## Riesgos conocidos
- Sin rate limiting.
- Sin protección CSRF explícita más allá de SameSite.
- Sitio Quartz puede exponer contenido si no se configura Access.
- `auth-portal` duplica código y sigue usando SHA-256.

## Próximo paso recomendado
Migrar el usuario existente de `auth-portal-db` a `unified-app-db`, configurar Cloudflare Access para Quartz y crear un repositorio Git para `unified-app`.

## Actualización — rediseño integral
- Interfaz reconstruida con sidebar adaptable, topbar con búsqueda global, tema claro/oscuro y navegación móvil.
- Módulo de proyectos con CRUD completo (`projects`, `/api/projects`).
- Dashboard con métricas de tareas, proyectos, notas y GitHub.
- GitHub consulta la API pública real (perfil y repositorios).
- PWA con service worker network-first, `offline.html` e instalación.
- Migraciones: `0002_add_theme.sql`, `0003_projects.sql`.
