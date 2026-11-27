# Nexo — Contexto general

**Repositorio:** https://github.com/gpb-codes/nexo  
**Fecha:** 27 de noviembre de 2026  
**Nota:** este documento reemplaza todos los Markdown anteriores del proyecto, incluido el README original.

## 1. Qué es Nexo

Nexo es un centro de operaciones personal que unifica segundo cerebro, tareas, proyectos, notas, contactos, fotos, capturas NFC/cámara, perfil, GitHub, voz y un asistente IA configurable. Existe como aplicación web, como sitio del segundo cerebro y como app nativa Android en migración gradual.

La versión web sigue activa y no se retira hasta alcanzar paridad funcional en móvil.

## 2. Proyectos del repositorio

| Ruta | Rol | Producción |
|---|---|---|
| `unified-app/` | Núcleo web: auth, tareas, proyectos, notas, ajustes, PWA, captura y grafo | https://unified-app-n8d.pages.dev |
| `quartz/` | Segundo cerebro original publicado con Quartz | https://segundo-cerebro-e4v.pages.dev |
| `next-quartz/` | Reemplazo del segundo cerebro con Next.js, Three.js y anime.js | https://segundo-cerebro-next.pages.dev |
| `mobile/` | App nativa Android con Expo/React Native | APK release en `~/Descargas/Nexo-mobile-release.apk` |
| `auth-portal/` | Portal legacy | legacy |
| `github-access-console/` | Consola local/estática para GitHub | local |

## 3. Funciones implementadas

### Web (`unified-app/`)

- Registro, login y logout reales; PBKDF2; sesiones opacas en D1; cookie HttpOnly para web.
- Bearer token para clientes móviles: `/api/mobile/login`, `/api/mobile/register`; `Authorization: Bearer` soportado.
- Tareas CRUD con categoría, fecha límite, prioridad, filtros, progreso y edición.
- Proyectos CRUD.
- Notas, contactos y fotos en `notes`; imágenes comprimidas como data URL.
- NFC real (`NDEFReader`) y cámara real (`getUserMedia`), con mensajes honestos cuando no hay soporte.
- Pantalla de Contactos para socios/colaboradores con acceso a WhatsApp.
- Ajustes: identidad del sitio, tema, acento, avatar, nombre visible y API key del asistente IA.
- Términos en `/terminos`.
- PWA instalable, service worker network-first y descarga autodefinida.
- Grafo 3D estilo universo con Three.js y lista de entradas de Quartz.
- Botón de apoyo con datos bancarios y enlace de transferencia.
- Migraciones D1: `0001`–`0007`.

### Segundo cerebro

- Quartz original con grafo suave y estilos personalizados.
- Next.js con 322 nodos y 718 conexiones.
- Grafo JARVIS: HUD, nombres de archivo bajo los nodos, conexiones curvas, búsqueda, WASD/flechas y joystick digital.
- Notas estáticas generadas desde `contentIndex.json`.

### Móvil (`mobile/`)

Arquitectura limpia aplicada:

- `src/domain/`: entidades (`task`, `project`, `note`, `session`, `preferences`) e interfaces de repositorio.
- `src/application/`: casos de uso, contenedor de dependencias y query keys.
- `src/infrastructure/`: cliente HTTP, SecureStore, SQLite, repositorios concretos y outbox.
- `src/presentation/`: hooks de TanStack Query y tokens de tema.
- `app/`: pantallas Expo Router; dependen solo de hooks y tokens.

Stack: Expo SDK 58, React Native 0.88, TypeScript, Expo Router.
- TanStack Query, Zustand, expo-sqlite, SecureStore, cámara, notificaciones y Reanimated.
- Login/registro con SecureStore; sesión verificada y logout.
- Tareas, proyectos, notas, contactos y ajustes.
- Caché SQLite y outbox básico para tareas.
- APK release generado e instalado por USB en `com.gpbcode.nexo`.

## 4. Arquitectura de datos

D1 `unified-app-db`:

- `users`, `sessions`, `tasks`, `projects`, `site_settings`, `notes`.
- `users` incluye `ai_api_key`, `ai_model`, `ai_base_url`.
- `tasks` incluye `category` y `due_date`.
- Sesiones: token opaco; solo hash SHA-256 en D1; expiración y revocación.
- Imágenes históricas: data URL en `notes`; pendiente evaluar migración a R2.

> No usar `wrangler d1 migrations apply`: existe deriva histórica. Aplicar migraciones con `wrangler d1 execute --file=...`.

## 5. Diseño

- Minimal, plateado, azul cielo, blanco metálico y morado suave.
- Morado: `#8b5cf6` / `#a78bfa`; cielo: `#7dd3fc` / `#67e8f9`.
- Fondos oscuros `#050924` / `#0f1022`; claros `#f8fafc` / `#eef2f8`.
- `Inter` para UI y monoespacio para metadatos/HUD.
- Sidebar fija en escritorio, drawer en móvil, targets táctiles ≥42 px.
- Grafo: universo con estrellas, núcleo pulsante, etiquetas, conexiones curvas y HUD JARVIS.

## 6. Estado operativo

- Web, Quartz y Next Quartz desplegadas y verificadas.
- Repositorio GitHub público: https://github.com/gpb-codes/nexo.
- APK release: 116 MB, `com.gpbcode.nexo`, v0.1.0, compileSdk 37.
- Dispositivo de prueba detectado por USB: `2806ac560d26`.
- App abierta por `adb` sin errores fatales en `logcat`.

## 7. Pendiente

- Sincronización remota del outbox y resolución de conflictos.
- Cámara nativa y NFC Android; después iOS.
- Búsqueda global en móvil.
- Backend real para el asistente IA con proxy de secretos.
- Prueba de rendimiento del grafo 3D nativo o fallback 2D.
- Notificaciones y deep links.
- No retirar la web hasta completar paridad y rollback.

## 8. Reglas para continuar

- No eliminar la versión web ni sus despliegues.
- No simular NFC, cámara ni IA.
- No exponer secretos ni datos privados.
- No ejecutar migraciones destructivas.
- Citar rutas de archivo y funciones reales.
- Verificar móvil, tablet y escritorio al cambiar UI.
- Mantener la identidad visual y el estilo JARVIS.

## 9. Comandos útiles

```bash
# Web
cd unified-app
npx wrangler pages deploy public --project-name unified-app --branch main

# Quartz
cd quartz
npx quartz build
npx wrangler pages deploy public --project-name segundo-cerebro --branch main --commit-dirty=true

# Next Quartz
cd next-quartz
npm run build
npx wrangler pages deploy out --project-name segundo-cerebro-next --branch main --commit-dirty=true

# Móvil
cd mobile
npx tsc --noEmit
npx expo-doctor
cd android
./gradlew assembleRelease

# Instalar por USB
export PATH="$HOME/.local/share/android-sdk/platform-tools:$PATH"
adb devices -l
adb -s 2806ac560d26 install -r ~/Descargas/Nexo-mobile-release.apk
adb -s 2806ac560d26 logcat -d -t 300
```
