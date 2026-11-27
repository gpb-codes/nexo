# Seguridad de Nexo

## Contraseñas
- Algoritmo actual: PBKDF2-HMAC-SHA-256, 100000 iteraciones, salt de 16 bytes.
- Formato: `pbkdf2$<iteraciones>$<salt_b64>$<hash_b64>`.
- Las contraseñas antiguas en SHA-256 se migran automáticamente a PBKDF2 al iniciar sesión correctamente.

## Sesiones
- Token aleatorio de 32 bytes (base64url), almacenado en D1 como SHA-256.
- Cookie: `HttpOnly`, `Path=/`, `SameSite=Lax`, `Secure` en HTTPS, expiración 7 días.
- Logout revoca la sesión en el servidor y borra la cookie.

## Autorización
- Todos los endpoints protegidos derivan el usuario de la sesión.
- No se confía en `userId`, `id` ni parámetros equivalentes enviados por el cliente.
- Las tareas se filtran por `user_id` de la sesión.

## Pendiente
- Rate limiting en registro/login.
- Protección CSRF explícita para formularios (mitigada parcialmente por SameSite).
- Revisión de exposición de la bóveda en Quartz.
- Auditoría de cabeceras en producción.
