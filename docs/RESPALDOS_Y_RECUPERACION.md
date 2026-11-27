# Respaldos y recuperación

## Bóveda
- Git + GitHub privado.
- Syncthing entre equipos.
- No equivalente a backup: mantener copias periódicas independientes.

## D1
- Exportar: `wrangler d1 execute DB --remote --command ".dump"` (o desde el panel).
- Antes de cualquier migración, exportar la base.

## Configuración
- Versionar `wrangler.toml`, `schema.sql`, `migrations/`.
- No versionar `.wrangler/`, `.env` ni claves.

## Recuperación
1. Restaurar código desde Git.
2. Recrear base D1 y aplicar `migrations/0001_initial.sql`.
3. Importar dump si existe.
4. Verificar login, tareas y preferencias.
