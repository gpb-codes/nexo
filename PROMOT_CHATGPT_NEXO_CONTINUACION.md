# Prompt para ChatGPT — Continuación de Nexo

**Fecha:** 27 de noviembre de 2026  
**Uso:** entregar este documento a ChatGPT para que continúe el desarrollo, mejore el diseño y profundice en los aspectos técnicos.  
**Regla principal:** no eliminar ni reemplazar la versión web ni sus despliegues; trabajar de forma aditiva y con rollback.

---

## 1. Qué llevamos hecho

### Núcleo web — `unified-app/`

URL: https://unified-app-n8d.pages.dev

Stack: Cloudflare Pages Functions + D1 (`unified-app-db`) + HTML/CSS/JS vanilla + Three.js local.

Funciones reales:

- Registro/login/logout con PBKDF2, sesiones opacas en D1 y cookie HttpOnly.
- `/api/me`, `/api/register`, `/api/login`, `/api/logout`.
- bearer token para clientes nativos: `/api/mobile/login`, `/api/mobile/register`; `Authorization: Bearer` soportado en `getSessionUser()` y `revokeSession()`.
- Tareas CRUD con categoría, fecha límite, prioridad, filtros, progreso y modal de edición.
- Proyectos CRUD con estados y prioridad.
- Notas, contactos y fotos en tabla `notes`; imágenes comprimidas como data URL.
- Captura NFC real con `NDEFReader` (Chrome Android, HTTPS, NDEF) y cámara real con `getUserMedia`.
- Pantalla de Contactos para posibles socios/colaboradores con acceso directo a WhatsApp.
- Ajustes: identidad del sitio, tema claro/oscuro, acento, avatar, nombre visible y API key/modelo/endpoint del asistente IA.
- Términos y condiciones en `/terminos`.
- PWA: `manifest.json`, service worker network-first, offline, instalación y descarga autodefinida.
- Botón de apoyo al proyecto con datos bancarios y enlace directo a transferencia.
- Grafo 3D estilo universo en `public/brain.js` con Three.js, estrellas, núcleo pulsante y lista de Quartz.
- Migraciones D1 aplicadas: `0001`–`0007`.

### Segundo cerebro original — `quartz/`

URL: https://segundo-cerebro-e4v.pages.dev

- Quartz v5 alimentado desde la bóveda Obsidian.
- Grafo suave configurado en `quartz.config.yaml`.
- Estilos personalizados en `quartz/styles/custom.scss`.

### Segundo cerebro Next.js — `next-quartz/`

URL: https://segundo-cerebro-next.pages.dev  
Grafo: https://segundo-cerebro-next.pages.dev/grafo/

Stack: Next.js 14 App Router + export estático + Three.js + anime.js.

- 322 nodos y 718 conexiones desde `brain-graph.json`.
- Grafo estilo JARVIS: HUD, labels CSS2D con nombre y archivo, conexiones curvas gruesas, búsqueda, hover y animaciones.
- Movimiento con WASD/flechas y joystick digital en móvil.
- Páginas estáticas para todas las notas del vault, incluida `09_plantillas/09-plantillas`.

### App nativa — `mobile/`

Stack: Expo SDK 58, React Native 0.88, TypeScript, Expo Router, TanStack Query, Zustand, SQLite, SecureStore, Camera, Notifications, Reanimated.

Estado:

- `mobile/` creado sin tocar la web productiva.
- JDK 17 y Android SDK 37 instalados en usuario.
- `expo prebuild --platform android` ejecutado.
- APK release generado en `~/Descargas/Nexo-mobile-release.apk` (116 MB, `com.gpbcode.nexo`, v0.1.0).
- APK instalado por USB con `adb install -r`.
- Dispositivo detectado por USB: `2806ac560d26` (`model:26081RA18L`).
- App abierta por USB sin errores fatales en `logcat`.
- Funciones móviles ya implementadas:
  - login/registro con token opaco guardado en SecureStore;
  - sesión verificada y logout;
  - tareas: listar, crear, completar, eliminar;
  - proyectos: listar, crear, completar/reabrir, eliminar;
  - notas: listar con filtros, crear, abrir y eliminar;
  - contactos: formulario, lista y WhatsApp;
  - ajustes: identidad, tema, acento y nombre visible;
  - caché SQLite y outbox básico para tareas.

Auditoría técnica: `docs/migration/AUDITORIA_NATIVE.md`.  
Plan maestro: `NEXO_NATIVE_ARQUITECTURA_Y_MIGRACION.md`.  
Documento de capacidades: `FUNCIONALIDADES_Y_DISENO.md`.

---

## 2. Diseño actual

### Paleta objetivo

- Morado suave como identidad: `#8b5cf6`, `#a78bfa`.
- Azul cielo: `#7dd3fc`, `#67e8f9`.
- Blanco metálico/grises: `#e8eaed`, `#dfe6ff`, `#f8fafc`.
- Fondos oscuros azulados: `#050924`, `#0f1022`.
- Superficies con cristal, bordes finos y sombras suaves.

### Principios

- Minimal, denso pero legible, estilo HUD/JARVIS sin caer en ciencia ficción recargada.
- Tipografía `Inter` para UI y monoespacio para metadatos, rutas y grafo.
- Sidebar fija en escritorio, drawer en móvil.
- Targets táctiles mínimos de 42 px.
- Modales con scroll interno y padding reducido en móvil.
- Grafo: universo con estrellas, conexiones curvas, halos, labels de archivo y HUD.

---

## 3. URLs para revisar e inspirarse

Antes de proponer cambios, abre/visita estas URLs si tienes browsing:

- https://unified-app-n8d.pages.dev
- https://unified-app-n8d.pages.dev/grafo
- https://unified-app-n8d.pages.dev/terminos
- https://segundo-cerebro-next.pages.dev
- https://segundo-cerebro-next.pages.dev/grafo/
- https://segundo-cerebro-next.pages.dev/09_plantillas/09-plantillas/
- https://segundo-cerebro-e4v.pages.dev

También busca referencias visuales modernas de:

- HUD/JARVIS minimalista.
- Dashboards espaciales y maps de conocimiento.
- Interfaces glass/metal con azul cielo y morado suave.
- Apps móviles tipo Linear, Raycast, Things o Arc.

No copies literalmente; extrae principios y adáptalos a la identidad Nexo.

---

## 4. Instrucción para ChatGPT

Copia y pega esto:

```text
Actúa como ingeniero senior de producto, frontend, mobile y arquitectura. Trabaja sobre el repositorio en /home/gabrielpedreros/Documentos/Proyecto predeterminado.

Lee primero:
- FUNCIONALIDADES_Y_DISENO.md
- NEXO_NATIVE_ARQUITECTURA_Y_MIGRACION.md
- docs/migration/AUDITORIA_NATIVE.md
- README.md
- mobile/README.md

Antes de proponer cambios, revisa las URLs del documento PROMOT_CHATGPT_NEXO_CONTINUACION.md para inspirarte visualmente. Si tienes navegación web, abre las URLs de producción y busca referencias de diseño HUD/JARVIS minimalista, dashboards espaciales y apps móviles modernas. Si no puedes navegar, dilo y trabaja con la descripción del documento.

Objetivo: continuar Nexo con mejoras reales, no simulaciones.

Prioridades:
1. Mejorar el diseño completo sin romper lo que ya funciona: web, next-quartz y app móvil.
2. Mejorar el grafo 3D: labels, conexiones, rendimiento, interacción táctil y estilo JARVIS.
3. Continuar la app nativa: sincronización real del outbox, cámara nativa, NFC Android y después iOS.
4. Mantener la identidad: minimal, plateado, azul cielo, blanco metálico y morado suave.
5. Conservar datos, despliegues y compatibilidad con la web.

Reglas:
- No elimines la versión web ni sus despliegues.
- No simules NFC, cámara ni IA.
- No expongas secretos ni datos privados.
- No ejecutes migraciones destructivas.
- Cita siempre rutas de archivo y nombres de función.
- Si tocas backend, añade pruebas o comandos de verificación.
- Si tocas UI, verifica móvil, tablet y escritorio.
- Si tocas el grafo, mide rendimiento con 322 nodos y 718 conexiones.

Entrega primero un plan corto por fases, luego ejecuta el cambio de mayor valor y explica qué verificaste.
```

---

## 5. Trabajo pendiente sugerido

- P0: sincronización remota del outbox y manejo de conflictos.
- P0: probar login y tareas en el celular contra la API de producción.
- P1: cámara nativa y subida de fotos; evaluar R2 en vez de data URL en D1.
- P1: NFC Android real y estados explícitos de permiso/lectura/escritura.
- P1: pantalla de búsqueda global en móvil.
- P2: grafo 3D nativo con Three.js en React Native o fallback 2D.
- P2: backend real para el Asistente IA con proxy de secretos.
- P2: notificaciones y deep links.
- P3: preparación iOS con EAS Build y adaptadores nativos.

---

## 6. Comandos útiles

```bash
# Web principal
cd unified-app
npx wrangler pages deploy public --project-name unified-app --branch main

# Quartz original
cd quartz
npx quartz build
npx wrangler pages deploy public --project-name segundo-cerebro --branch main --commit-dirty=true

# Next Quartz
cd next-quartz
npm run build
npx wrangler pages deploy out --project-name segundo-cerebro-next --branch main --commit-dirty=true

# Mobile
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
