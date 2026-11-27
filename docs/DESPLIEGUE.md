# Despliegue

## Estado actual
- URL: https://unified-app-n8d.pages.dev
- Proyecto Cloudflare Pages: `unified-app`
- Base D1: `unified-app-db`
- Último despliegue verificado: 25 nov 2026.

## Nexo (unified-app)
1. Revisar cambios (`git diff` si aplica).
2. Ejecutar pruebas disponibles (actualmente manuales).
3. Aplicar solo las migraciones pendientes, con `execute` (no `migrations apply`):
   ```bash
   npx wrangler d1 execute unified-app-db --remote --file=migrations/0004_site_settings.sql
   npx wrangler d1 execute unified-app-db --remote --file=migrations/0005_notes.sql
   npx wrangler d1 execute unified-app-db --remote --file=migrations/0006_ai_assistant.sql
   ```
   Son aditivas y usan `IF NOT EXISTS`. No volver a ejecutar `0002_add_theme.sql` en una base existente.
4. Desplegar:
   ```bash
   npx wrangler pages deploy public --project-name unified-app --branch main
   ```
5. Verificar:
   - `/` y `/terminos` devuelven 200.
   - `/api/me`, `/api/tasks` y `/api/notes` sin sesión devuelven 401.
   - `/api/register` con cuerpo vacío devuelve 400.
   - Login, tareas, proyectos, ajustes de identidad, notas, contactos y logout funcionan con un usuario temporal.
   - Crear nota manual, contacto, foto, listar, abrir detalle y eliminar.
   - Añadir API key del asistente de IA en Ajustes y comprobar que se guarda en la sesión.
   - Segundo cerebro: canvas activo, `brainStats` muestra nodos/conexiones, leyenda visible y lista de Quartz con 105 entradas; buscar filtra en Grafo y Quartz.
   - No hay errores de consola al cargar el mapa.
   - `Permissions-Policy` incluye `camera=(self)`; `script-src 'self' 'unsafe-inline'` permite el import map de Three.js.
   - El service worker queda activo y `/terminos`, `/brain.js` y los vendor de Three.js están cacheados.

## Verificación realizada
- Migraciones remotas aplicadas y esquema comprobado: `users`, `sessions`, `tasks`, `projects`, `site_settings`, `notes`, columnas `ai_api_key`, `ai_model`, `ai_base_url` en `users`.
- Flujo E2E en producción: registro, `/api/me`, proyecto, tarea, preferencias, listados y logout.
- Captura local: nota manual, contacto, foto, listado, detalle, filtros y borrado mediante `/api/notes`.
- Ajustes locales: identidad del sitio, tema, acento, avatar, nombre visible y API key del asistente; vaciar el nombre visible vuelve al nombre de la cuenta.
- Contactos locales: formulario, lista de contactos guardados y enlace directo a WhatsApp.
- Cámara sin dispositivo: error controlado y mensaje honesto; no se simula ninguna captura.
- Web NFC en escritorio: controles deshabilitados y explicación de compatibilidad.
- CSP permite `https://api.github.com` y el iframe de `https://segundo-cerebro-e4v.pages.dev`; ambos cargan sin errores de consola.
- `offline` responde 200; el service worker usa esa ruta canónica.

## Limitaciones de hardware
- Web NFC solo está disponible en Chrome para Android, en contexto HTTPS y con etiquetas NDEF. No lee tarjetas bancarias ni documentos protegidos.
- La cámara requiere HTTPS o localhost y permiso explícito del usuario.
- La verificación NFC real necesita un Android y una etiqueta física; no puede completarse en escritorio.
- Las fotos se guardan como JPEG comprimido en D1 con un límite de tamaño; si la imagen es demasiado grande, el servidor la rechaza y la app muestra el error.

## Quartz / bóveda
- El workflow `.github/workflows/deploy-second-brain.yml` requiere secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
- Antes de publicar, verificar la política de contenido público/privado.

## Rollback
- Pages permite revertir a un despliegue anterior desde el panel de Cloudflare.
- Las migraciones son aditivas; no destruyen datos.
