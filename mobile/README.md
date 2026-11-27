# Nexo Mobile (Fase 1)

Esqueleto Android nativo de Nexo, creado sin modificar la versión web productiva.

## Stack

- Expo SDK 58 + React Native 0.88 + TypeScript.
- Expo Router.
- TanStack Query para estado remoto.
- expo-sqlite, expo-secure-store, expo-camera, expo-notifications.
- react-native-reanimated, safe-area-context y screens.
- development build (`expo-dev-client`) desde el inicio.

## Estado actual

- Navegación mínima con `app/_layout.tsx` y `app/index.tsx`.
- Cliente API tipado en `src/infrastructure/api/client.ts`.
- Almacenamiento de sesión en SecureStore (`src/infrastructure/storage/session.ts`).
- Tokens visuales en `src/theme/tokens.ts`.
- Variables de entorno: copiar `.env.example` a `.env`.

> El backend conserva la cookie HttpOnly para la web y añadió endpoints móviles que devuelven un token opaco. El cliente lo guarda en SecureStore y lo envía como `Authorization: Bearer`.

## Verificación

```bash
npx tsc --noEmit
npx expo-doctor
```

Para compilar en Android se instalaron JDK 17 y Android SDK 37 en usuario. El build debug es un development client y necesita Metro; el build release (`./gradlew assembleRelease`) genera el APK independiente con el bundle JS incluido. El APK release se instaló por USB con `adb install -r` y se abrió sin errores fatales en `logcat`.

## Funciones ya migradas

- Login/registro con token opaco (`/api/mobile/login`, `/api/mobile/register`).
- Persistencia del token en SecureStore y envío `Authorization: Bearer`.
- Pantalla de sesión verificada y logout.
- Módulo de tareas: listar, crear, completar y eliminar.
- Módulo de proyectos: listar, crear, completar/reabrir y eliminar.
- Ajustes: identidad del sitio, nombre visible, tema y color de acento.
- Notas: listar con filtros, crear, abrir y eliminar.
- Contactos: formulario, lista y acceso a WhatsApp.
- Offline básico: caché SQLite de tareas y outbox para operaciones sin red.

## Próximo

1. Proyectos y preferencias.
2. SQLite local y outbox offline.
3. Cámara/NFC nativos.
