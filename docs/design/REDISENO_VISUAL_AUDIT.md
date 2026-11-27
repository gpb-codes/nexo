# Auditoría visual — Rediseño integral de Nexo

**Fecha:** 27 de noviembre de 2026  
**Repositorio:** https://github.com/gpb-codes/nexo  
**Alcance:** web principal (`unified-app/`), app nativa (`mobile/`) y segundo cerebro Next (`next-quartz/`). Quartz original se conserva como fuente/publicación legacy.

## 1. Estructura real encontrada

### Web principal — `unified-app/`

- `public/index.html`: una sola página con 11 paneles controlados por `data-tab`:
  `inicio`, `grafo`, `tareas`, `proyectos`, `captura`, `contactos`, `github`, `voz`, `chat`, `perfil`, `ajustes`.
- `public/app.js`: IIFE vanilla, sin framework. Maneja autenticación, navegación, render, formularios y PWA.
- `public/styles.css`: sistema de estilos único con variables CSS.
- `public/brain.js`: grafo 3D con Three.js vendored en `public/vendor/`.
- `public/avatars.js`: estilos de avatar DiceBear.
- `public/terminos.html`, `public/offline.html`, `public/sw.js`, `public/manifest.json`.
- `functions/`: Cloudflare Pages Functions con arquitectura limpia (`domain`, `application`, `infrastructure`, `api`).
- Migraciones D1 `0001`–`0008`.

### Móvil — `mobile/`

- Expo SDK 58 + React Native 0.88 + Expo Router.
- `app/` con pantallas: `index`, `login`, `tasks`, `projects`, `notes`, `contacts`, `settings`, `chat`.
- `src/` con capas `domain`, `application`, `infrastructure`, `presentation`.
- APK release generado e instalado en Android.

### Segundo cerebro Next — `next-quartz/`

- Next.js 14 App Router, exportación estática.
- `app/` con `page`, `grafo/client`, `[...slug]`, `note-anim`.
- `src/` con capas limpias para el grafo.
- 322 nodos y 718 conexiones desde `brain-graph.json`.

### Legacy

- `auth-portal/`: portal legacy.
- `github-access-console/`: consola local/estática.
- `quartz/`: publicación original del segundo cerebro (no se toca su interacción principal).

## 2. Dashboard actual

Elementos existentes:

- Topbar con buscador, cambio de tema y badge de usuario.
- Sidebar con navegación y footer con usuario, descarga, apoyo y logout.
- Hero con avatar circular, bienvenida y texto.
- Stats: tareas pendientes, proyectos activos, notas, repos.
- Accesos rápidos y actividad reciente.

Problemas visuales:

- El avatar es una imagen circular plana; no hay presencia 3D.
- La bienvenida usa siempre `Hola, …`; no comunica identidad de producto.
- Las tarjetas de stats compiten entre sí y no resumen tareas/proyectos reales de forma útil.
- “Actividad reciente” es estática y no representa datos reales.
- El acceso al Second Brain compite con enlaces externos en “Accesos rápidos”.
- No hay jerarquía clara entre identidad, actividad y herramientas.
- El encabezado no muestra notificaciones ni indicador de sesión.

## 3. Páginas internas

### Tareas

- CRUD real, filtros por estado y prioridad, barra de progreso y modal de edición.
- Problema: lista densa, poca jerarquía entre prioridad/fecha/estado; búsqueda global no equivaldría a búsqueda local.

### Proyectos

- CRUD real, estados y prioridad.
- Problema: no hay resumen por estado ni progreso derivado real; las tarjetas son uniformes.

### Notas

- CRUD real, filtros por tipo, modal de detalle.
- Problema: listado y formulario compiten por espacio; no hay búsqueda local.

### Contactos

- Formulario y lista con WhatsApp.
- Problema: no hay avatar, búsqueda ni jerarquía de acción.

### Second Brain

- Grafo Three.js real, HUD, etiquetas, búsqueda, WASD/flechas y joystick.
- Problema: panel de información del nodo es secundario; la selección y navegación podrían destacarse más.

### Ajustes

- Secciones: identidad, apariencia, nombre, IA, vista previa y legal.
- Problema: la API key se conserva en el input después de guardar; debe ocultarse.

## 4. Navegación

- Escritorio: sidebar fija; no se puede contraer.
- Móvil: drawer lateral; no hay navegación inferior.
- Los mismos `data-tab` son usados por sidebar y controles rápidos.

## 5. Dependencias y restricciones

- Three.js ya está disponible localmente; no añadir bibliotecas nuevas.
- No hay framework frontend en `unified-app/`; la interfaz debe seguir siendo vanilla para no romper Pages.
- DiceBear genera los avatares; `img-src` ya lo permite, pero el HUD de CSP debe revisarse si se carga como textura.
- Web NFC y cámara requieren HTTPS.
- No se deben cambiar endpoints ni esquemas por motivos visuales.
- No desplegar durante el rediseño.

## 6. Hallazgos priorizados

1. Dashboard sin esfera 3D ni bienvenida de producto.
2. Navegación móvil ocupa demasiado espacio en drawer.
3. API key visible en el input tras guardar.
4. Estilos de tarjetas y botones repetidos entre secciones.
5. Actividad reciente no usa datos reales.
6. Búsquedas locales ausentes en tareas, notas y contactos.
7. Sidebar no plegable en escritorio.
8. No hay tokens documentados para spacing/radii/motion.

## 7. Decisiones de rediseño

- Mantener la paleta y tipografía solicitadas.
- Crear un sistema de diseño con tokens y clases reutilizables.
- Dashboard nuevo con bienvenida dinámica, esfera 3D real y accesos claros.
- Sidebar plegable en escritorio; bottom nav en móvil.
- Componentes compartidos: `.ui-card`, `.ui-btn`, `.ui-input`, `.ui-badge`, `.ui-progress`, `.ui-empty`, `.ui-avatar`.
- Datos reales únicamente; estados honestos cuando no hay información.
- Seguir con grafo Three.js existente, sin sustituirlo por imagen.
- No publicar hasta validar.
