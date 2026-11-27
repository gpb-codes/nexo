# Datos y migraciones

## Bases D1
- `auth-portal-db`: tabla `users`, 1 usuario (legacy).
- `unified-app-db`: tablas `users`, `tasks`, `sessions`, `projects`, `site_settings`, `notes`; sin datos de usuario en producción tras las pruebas.

## Migraciones
- `unified-app/migrations/0001_initial.sql`: crea/asegura `users`, `tasks`, `sessions` e índices.
- `unified-app/migrations/0002_add_theme.sql`: añade `users.theme` (no repetible).
- `unified-app/migrations/0003_projects.sql`: crea `projects`.
- `unified-app/migrations/0004_site_settings.sql`: crea la identidad de la web por usuario.
- `unified-app/migrations/0005_notes.sql`: crea `notes` para notas, contactos y fotos.
- `unified-app/schema.sql`: esquema completo de referencia.

## Aplicación segura
- Usar `wrangler d1 execute ... --file=...` para cada migración pendiente.
- No usar `wrangler d1 migrations apply`: la tabla `d1_migrations` está vacía por la deriva histórica y `0002` fallaría al repetir la columna `theme`.
- Las migraciones `0004` y `0005` son idempotentes (`CREATE TABLE/INDEX IF NOT EXISTS`).

## Migración de usuarios (pendiente de aprobación)
Migrar el usuario existente de `auth-portal-db` a `unified-app-db` conservando id, email, contraseña (ya en SHA-256 legacy; se migrará a PBKDF2 en el próximo login), avatar, accent y display_name.

## Reversión
- La migración solo añade la tabla `sessions`; no destruye datos.
- Para revertir código, restaurar la versión anterior de `functions/`.
- Para revertir datos, restaurar desde backup de D1 (exportar con `wrangler d1 execute ... --command ".dump"`).

## Migraciones aplicadas en desarrollo
- `0002_add_theme.sql`: añade `users.theme` (`oscuro` por defecto).
- `0003_projects.sql`: crea `projects` con aislamiento por `user_id`.
- `0004_site_settings.sql`: crea `site_settings` con identidad por `user_id`.
- `0005_notes.sql`: crea `notes` con índices por usuario, tipo y origen.
- `0006_ai_assistant.sql`: añade `users.ai_api_key`, `users.ai_model` y `users.ai_base_url` para Asistente IA.

## Imágenes en `notes`
- `image_data` guarda un JPEG comprimido como data URL, con un límite de 950.000 caracteres.
- El listado no devuelve la imagen completa: solo `hasImage`; el detalle (`/api/notes?id=...`) la incluye.
- Las imágenes se comprimen en el cliente (máximo 1280 px, calidad 0,72) antes de enviarse.
- Si D1 rechazara una fila por tamaño, la API devuelve error y la app no simula el guardado.
