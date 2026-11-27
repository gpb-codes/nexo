# Nexo — Funcionalidades y diseño

> Documento maestro de capacidades ya implementadas, decisiones técnicas y características visuales.
> Actualizado: 26 de noviembre de 2026.

## 1. Alcance del proyecto

El repositorio de trabajo (`/home/gabrielpedreros/Documentos/Proyecto predeterminado`) contiene tres sistemas activos y varios módulos de apoyo:

| Ruta | Rol | Producción |
|---|---|---|
| `unified-app/` | Núcleo de Nexo: autenticación, tareas, proyectos, captura, contactos, ajustes, PWA | https://unified-app-n8d.pages.dev |
| `quartz/` | Segundo cerebro original publicado con Quartz, con grafo suave | https://segundo-cerebro-e4v.pages.dev |
| `next-quartz/` | Reemplazo del segundo cerebro con Next.js, Three.js y anime.js | https://segundo-cerebro-next.pages.dev |
| `github-access-console/` | Consola SSH local/estática para GitHub | — |
| `auth-portal/` | Portal de autenticación legacy | https://auth-portal-px1.pages.dev |
| `docs/` | Documentación de arquitectura, seguridad, migraciones y despliegue | — |

Los despliegues se realizan con Wrangler sobre Cloudflare Pages. La base de datos del núcleo es D1 `unified-app-db`.

---

## 2. Funcionalidades implementadas

### 2.1 Autenticación y sesión (`unified-app/`)

- Registro, inicio de sesión y cierre de sesión reales.
- Contraseñas derivadas con **PBKDF2** (`100000` iteraciones, salt aleatorio de 16 bytes).
- Migración automática de contraseñas legacy SHA-256 a PBKDF2 tras un login válido.
- Sesiones server-side guardadas en D1; cookie técnica **HttpOnly**, `SameSite=Lax`, con `Secure` en HTTPS.
- `/api/me` devuelve el usuario autenticado; las rutas privadas responden `401` sin sesión.
- Registro y login incluyen enlaces a términos y condiciones; el registro exige checkbox de aceptación en la UI.

### 2.2 Tareas

- CRUD completo por usuario (`tasks`).
- Campos: `title`, `description`, `priority` (`alta`/`media`/`baja`), `status` (`pendiente`/`completada`), `category`, `due_date`, `created_at`, `completed_at`.
- Barra de progreso con pendientes/total.
- Filtros: todas, pendientes, completadas, alta, media, baja.
- Orden real por estado, prioridad, fecha límite y creación.
- Modal de edición en móvil/escritorio para título, descripción, categoría y fecha límite.
- Atajo de `Enter` para agregar desde el input.

### 2.3 Proyectos

- CRUD completo por usuario (`projects`).
- Nombre, descripción, prioridad, estado y fecha de creación/actualización.
- Filtros por activo/completado y búsqueda global combinada con tareas.

### 2.4 Identidad del sitio y preferencias

- Tabla `site_settings` por usuario.
- Campos editables: nombre de la web, subtítulo, descripción, tema, color de acento, avatar y nombre visible.
- La identidad se refleja en título del navegador, meta descripción, barra lateral, pantalla de acceso y encabezados.
- Tema claro/oscuro con persistencia.
- Selector de acento y avatar con DiceBear.

### 2.5 Notas, contactos y fotos

- Tabla `notes` con `kind` (`nota`, `contacto`, `foto`, `nfc`) y `source` (`manual`, `nfc`, `camara`).
- API `/api/notes` con `GET` (listado y detalle por `id`), `POST` y `DELETE`.
- El listado no envía la imagen completa; el detalle (`?id=...`) sí la devuelve.
- Imágenes comprimidas en el cliente y guardadas como data URL (JPEG/PNG/WebP) con límite de 950.000 caracteres.
- Filtros: todas, notas, contactos, fotos y NFC.
- Modal de detalle con imagen, texto, metadatos y contacto.

### 2.6 Captura NFC y cámara

- Web NFC real vía `NDEFReader`: lectura de texto, URL, JSON, MIME y vCard; escritura de registros de texto.
- Disponible solo en Chrome para Android, HTTPS y etiquetas NDEF; en escritorio los controles se deshabilitan con mensaje honesto.
- Cámara real vía `getUserMedia`, cámara trasera preferida, captura en canvas y compresión JPEG antes de guardar.
- Requiere HTTPS o localhost y permiso explícito; la cámara se detiene al capturar, cambiar de pestaña o cerrar sesión.
- Sin simulación de hardware.

### 2.7 Contactos

- Pantalla dedicada “Contactos”.
- Texto explicativo: sirve para registrar posibles socios o colaboradores, no para reemplazar la agenda del teléfono.
- Formulario con nombre, teléfono, correo, organización y nota de trabajo.
- Lista de contactos guardados con acceso directo a WhatsApp (`https://wa.me/<número>`).

### 2.8 Asistente IA

- Campo para **API key**, modelo y endpoint opcional en Ajustes.
- Persistencia en columnas `users.ai_api_key`, `ai_model`, `ai_base_url` (migración `0006`).
- El chat actual informa honestamente que no hay backend conectado; no simula respuestas.

### 2.9 Voz, GitHub y búsqueda

- Dictado con Web Speech API y lectura en voz alta (`SpeechSynthesis`).
- Consulta real a la API pública de GitHub: perfil y repositorios recientes.
- Buscador global de tareas y proyectos.

### 2.10 PWA y distribución

- `manifest.json` con nombre “Nexo — Segundo Cerebro”, `display: standalone`, iconos 192/512 y apple-touch-icon.
- Service worker network-first con caché de estáticos y fallback offline.
- Botón de instalación con estados y mensajes.
- Descarga autodefinida: `downloadApp()` genera un HTML con CSS y JS incrustados para que no se pierda el diseño al abrir el archivo descargado en móvil.
- Botón de apoyo al proyecto con datos bancarios (Banco Estado, CuentaRUT, RUT) y acceso directo a transferencia.

### 2.11 Segundo cerebro integrado en `unified-app/`

- Mapa 3D estilo universo con Three.js (`brain.js`).
- Estrellas de fondo, núcleo pulsante, armas espirales y conexiones aditivas.
- Lista curada de entradas de Quartz desde `brain-graph.json`, con búsqueda y enlaces.
- Controles: centrar, rotar, búsqueda de nodos, selección que abre el slug en Quartz y leyenda visual.

### 2.12 Segundo cerebro en Next.js (`next-quartz/`)

- Reemplazo del sitio Quartz con **Next.js 14 App Router**, exportación estática y despliegue en Pages.
- Páginas estáticas generadas desde `contentIndex.json` de Quartz (322 nodos, 718 conexiones).
- Ruta dinámica `[...slug]` para todas las notas, incluida `09_plantillas/09-plantillas`.
- Grafo JARVIS con Three.js:
  - Etiquetas CSS2D con **nombre de archivo** y ruta debajo de cada nodo.
  - Conexiones curvas gruesas con `LineSegments2`/`LineMaterial`.
  - HUD estilo JARVIS: esquinas, crosshair, scanline, texto de estado.
  - Búsqueda por título/slug y resaltado animado con anime.js.
  - Movimiento con **WASD** y **flechas**.
  - **Joystick digital** en pantalla para móvil/pointer coarse.
- Animaciones de entrada y hover con anime.js v4 (`animate()`).

### 2.13 Quartz original (`quartz/`)

- Jardín digital basado en la bóveda Obsidian.
- Configuración de grafos más suave: menor repulsión, mayor distancia de enlace y centrado más bajo.
- Estilos personalizados en `quartz/styles/custom.scss`.
- Plugin `content-index` y `graph` activos.

---

## 3. API y datos

### Rutas principales

| Ruta | Método | Función |
|---|---|---|
| `/api/register` | POST | Crear cuenta y sesión |
| `/api/login` | POST | Verificar credenciales y crear sesión |
| `/api/logout` | POST | Revocar sesión |
| `/api/me` | GET | Usuario autenticado |
| `/api/tasks` | GET/POST/PUT/DELETE | CRUD de tareas |
| `/api/projects` | GET/POST/PUT/DELETE | CRUD de proyectos |
| `/api/notes` | GET/POST/DELETE | Notas, contactos y fotos |
| `/api/preferences` | PUT | Identidad, tema, avatar y AI key |

### Migraciones D1

- `0001_initial.sql` — usuarios, tareas, sesiones.
- `0002_add_theme.sql` — columna `theme`.
- `0003_projects.sql` — proyectos.
- `0004_site_settings.sql` — identidad por usuario.
- `0005_notes.sql` — notas/contactos/fotos.
- `0006_ai_assistant.sql` — AI key/model/endpoint.
- `0007_task_details.sql` — categoría y fecha límite de tareas.

> No usar `wrangler d1 migrations apply`: la tabla `d1_migrations` está vacía por deriva histórica y `0002` no es repetible. Aplicar cada migración con `wrangler d1 execute --file=...`.

---

## 4. Características del diseño

### 4.1 Paleta

- Morado suave como identidad: `#8b5cf6` / `#a78bfa`.
- Azul cielo: `#7dd3fc`, con acentos `#67e8f9` en el grafo.
- Blanco metálico y grises: `#e8eaed`, `#dbeafe`, `#dfe6ff`.
- Fondos oscuros azulados (`#050924`, `#0a1030`) y modo claro (`#f8fafc`, `#eef2f8`).
- Superficies tipo cristal con `backdrop-filter` y bordes de baja opacidad.

### 4.2 Tipografía y jerarquía

- `Inter` para interfaz general.
- Monoespacio (`JetBrains Mono`/`ui-monospace`) para metadatos, JARVIS HUD y rutas de archivos.
- Títulos con `letter-spacing` negativo y pesos altos; textos secundarios en tonos apagados.

### 4.3 Layout

- Sidebar fija en escritorio, colapsable en móvil con overlay.
- Topbar sticky con búsqueda, cambio de tema y usuario.
- Grillas adaptativas:
  - Dashboard: 4 columnas → 2 → 1.
  - Captura, contactos, ajustes y perfil: 2 columnas → 1.
  - Quartz: tarjetas `auto-fill`.
- Márgenes y paddings reducidos en móvil; objetivos táctiles mínimos de 42 px.
- Modales con `max-height: 92vh`, scroll interno y padding reducido en móvil.

### 4.4 Grafo JARVIS

- Centro vacío con anillo holográfico, rejilla tenue y polvo estelar.
- Nodos con colores fríos (cian, azul, plata, violeta suave).
- Enlaces curvos y luminosos; hover resalta el nodo y sus conexiones.
- Etiquetas tipo HUD: nombre arriba, ruta del archivo abajo, fondo semitransparente y borde cian.
- Overlay JARVIS con esquinas, crosshair, scanline y textos “JARVIS // NEXUS”.
- Joystick digital de 4 direcciones visible en móvil o pantallas táctiles.

### 4.5 PWA e instalación

- Iconos redondeados, color primario morado y fondo oscuro/metálico.
- `display: standalone`; se comporta como app nativa al instalar.
- Offline con service worker y caché de estáticos, incluyendo assets del grafo.

---

## 5. Instrucción para ChatGPT — profundizar en aspectos técnicos

```text
Actúa como ingeniero de software senior y analiza este repositorio sin inventar datos.
Antes de responder, inspecciona las rutas unified-app/, quartz/, next-quartz/ y docs/.

Profundiza en los aspectos técnicos de las funcionalidades ya implementadas. Para cada una:
1. Explica el flujo de datos de extremo a extremo (UI → API → D1/almacenamiento → respuesta).
2. Describe los contratos de API, validaciones, códigos de estado y manejo de errores.
3. Detalla el esquema de datos y la relación entre migrations 0001–0007.
4. Analiza seguridad: sesiones, PBKDF2, cookies HttpOnly, CSP, Permissions-Policy, aislamiento por usuario.
5. Evalúa rendimiento: consultas D1, payloads de imágenes, caché del service worker, render de Three.js y número de nodos/enlaces.
6. Señala límites honestos: Web NFC solo en Chrome Android/HTTPS, cámara con permiso, IA sin backend, deriva de migraciones.
7. Propón mejoras concretas y ordenadas por prioridad, indicando archivos y funciones a modificar.
8. Incluye comandos de verificación y pruebas (node --check, wrangler d1 execute, next build, curl a /api/*).

Cita siempre rutas de archivo y nombres de función. No propongas simulaciones de hardware ni prometas capacidades no implementadas.
```

---

## 6. Estado y pendientes

- **Desplegado:** núcleo Nexo, Quartz original y reemplazo Next.js.
- **Pendiente:** backend real para el Asistente IA.
- **Pendiente:** prueba física de NFC en Android con etiqueta NDEF.
- **Pendiente:** rate limiting y CSRF avanzado.
- **Pendiente:** revisar privacidad de Quartz original con Cloudflare Access si se quiere restringir contenido.
