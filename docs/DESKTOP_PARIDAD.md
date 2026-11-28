# Nexo Desktop — plan de paridad con web y móvil

**Fecha:** 28 de noviembre de 2026  
**Estado:** propuesta técnica; aún no existe carpeta `desktop/` en el repositorio.

## 1. Objetivo

Crear una app de escritorio de Nexo con **paridad funcional y visual** frente a la web (`unified-app/`) y la móvil (`mobile/`). No debe ser una versión reducida ni un simple atajo al navegador.

Paridad significa:

- Misma identidad visual, tokens, componentes y copy que web/móvil.
- Mismas pantallas principales: Inicio, Tareas, Proyectos, Documentos, Notas, Contactos, Ajustes, Chat IA y Second Brain.
- Mismos contratos API: `/api/me`, `/api/tasks`, `/api/projects`, `/api/documents`, `/api/project-members`, `/api/activity`, `/api/notes`, `/api/preferences`, `/api/ai/*`.
- Mismo modelo de sesión Bearer o cookie según plataforma.
- Misma lógica de roles: `owner`, `editor`, `viewer`.
- Mismo historial de actividad y versiones de documentos.
- Misma regla: datos reales, sin simulaciones de cámara, NFC ni IA.

---

## 2. Stack recomendado

### Tauri 2 (recomendado)

Razones:

- Reutiliza el frontend web existente (`unified-app/public/`) con pocos cambios.
- El proceso nativo es Rust, coherente con la decisión de servicios aislados.
- Menor tamaño de bundle que Electron.
- Acceso a keychain del sistema para session token y biometría local del SO.
- Permite empaquetar para Linux, macOS y Windows desde un solo código.

Estructura propuesta:

```text
desktop/
  src-tauri/            Rust: ventana, deep links, keychain, updater y comandos nativos
  src/                  frontend compartido o adaptado desde unified-app/public
  shared/               contratos TS compartidos con mobile y web (cuando sea posible)
  migrations/           solo caché local; nunca sustituye D1
```

### Alternativa: Electron

Usar solo si se requiere compatibilidad con extensiones de Node o APIs de Chrome no soportadas por Tauri. No se recomienda como primera opción por tamaño y consumo.

---

## 3. Arquitectura

```text
Desktop app
  ├── UI (web reutilizada / adaptada)
  ├── Cliente API (mismo contrato que móvil y web)
  ├── Caché local SQLite (tasks, projects, documents, notes)
  ├── Outbox idempotente por clientId
  ├── Secure storage del SO (Windows Hello / Touch ID / libsecret)
  └── Servicios opcionales Rust/Go/Python (configurables por URL)
```

Reglas:

- El backend sigue siendo Cloudflare Pages Functions + D1. Desktop no posee la fuente de verdad.
- La app puede funcionar offline con caché y outbox, igual que móvil.
- Los servicios Rust/Go/Python son opcionales; si no responden, la app usa el fallback actual.
- No duplicar reglas de negocio en el cliente. Las validaciones duras siguen en `_lib/domain/`.

---

## 4. Funciones que debe incluir

### Fase 1 — Base

- Login y registro con el backend real.
- Almacenamiento seguro del token en keychain del SO.
- Desbloqueo local con biometría del sistema cuando esté disponible:
  - Windows Hello, Touch ID o equivalente.
  - Igual semántica que móvil: desbloquea el token guardado; no passkeys ni cambio de auth.
- Sesión persistente, logout y revocación.
- Navegación lateral idéntica a la web de escritorio.
- Inicio con esfera 3D y bienvenida dinámica.

### Fase 2 — Productividad

- Tareas: CRUD, prioridad, categoría, fecha límite, proyecto, responsable, etiquetas y progreso.
- Proyectos: CRUD, estado, prioridad, fecha límite, color, miembros y detalle.
- Documentos: CRUD personal y de proyecto, versiones, actividad y restauración.
- Colaboración: invitación por correo, roles y registro de quién hizo qué.
- Notas, contactos y fotos desde el mismo endpoint `/api/notes`.
- Búsqueda local y filtros en todas las listas.

### Fase 3 — Extensiones

- Chat IA configurable con proxy server-side; nunca guardar la clave en el bundle.
- Second Brain: abrir el grafo existente o embeberlo con el mismo HUD JARVIS.
- Captura con cámara real del sistema cuando exista dispositivo; sin simulación.
- Deep links `nexo://` y manejo de archivos.
- Actualizaciones automáticas firmadas.
- Sincronización remota del outbox y resolución de conflictos.

---

## 5. Diseño y UX

Mismos tokens que `docs/design/DESIGN_SYSTEM.md`:

- Morado `#8b5cf6`, suave `#a78bfa`.
- Cielo `#7dd3fc`, cian `#67e8f9`.
- Fondo oscuro `#050924`, superficie `#0f1022`.
- Fondo claro `#f8fafc`, superficie `#ffffff`.
- Inter para UI; monoespacio para HUD, IDs y fechas técnicas.
- Espaciado 4/8/12/16/24/32.
- Bordes sutiles, sombras difusas y movimiento reducido cuando el SO lo pida.

Componentes a compartir o portar:

- `ui-btn`, `ui-input`, `ui-card`, `ui-badge`, `ui-progress`, `ui-avatar`, `ui-empty`, `ui-modal`.
- Equivalentes móviles: `AppScreen`, `UiCard`, `UiButton`, `UiInput`, `Badge`, `ProgressBar`, `Avatar`, `EmptyState`, `PageHeader`.

Navegación:

- Desktop: sidebar fija, columna central y panel de detalle.
- Ventanas secundarias: proyecto, documento, ajustes, chat.
- Misma jerarquía visual que móvil; cambia la composición, no el contenido.

---

## 6. Seguridad

- Token en keychain del SO, nunca en localStorage.
- No guardar contraseñas.
- No exponer `AI_API_KEY` en el frontend.
- Comandos Rust con allowlist estricta; sin acceso arbitrario al filesystem.
- Deep links validados.
- Updater firmado; sin actualizaciones silenciosas sin verificación.
- Biometría local es desbloqueo de sesión, no autenticación remota nueva.

---

## 7. Pruebas de aceptación

1. Login con cuenta real y logout correcto.
2. Token persistente tras reiniciar la app.
3. Biometría del SO desbloquea la sesión; cancelar muestra opción de contraseña.
4. Crear, editar y completar tareas con proyecto y etiquetas.
5. Crear proyecto, invitar a un usuario existente y ver rol en miembros.
6. Crear documento de proyecto, editarlo y ver versión anterior.
7. Actividad muestra actor, acción y fecha reales.
8. Offline: crear tarea, reconectar y sincronizar sin duplicados por `clientId`.
9. Web, móvil y desktop muestran los mismos datos y estados.
10. Sin errores en consola ni logs nativos; sin secretos en el bundle.

---

## 8. Orden de trabajo

1. Crear `desktop/` con Tauri 2 y el frontend web adaptado.
2. Extraer contratos y tipos compartidos para evitar divergencia de API.
3. Implementar session store nativo y gate biométrico.
4. Conectar listas y detalle de tareas, proyectos y documentos a los endpoints existentes.
5. Añadir caché SQLite y outbox.
6. Alinear estilos con el sistema de diseño.
7. Empaquetar artefactos para Linux, macOS y Windows **sin publicarlos**.
8. Validar con cuenta real y D1 local; después solicitar aprobación para distribución.

---

## 9. Restricciones

- No desplegar ni distribuir sin aprobación explícita.
- No sustituir la web ni el backend actual.
- No usar datos inventados para demostrar funciones.
- No simular cámara, NFC ni biometría.
- No romper los contratos API existentes sin justificación y migración documentada.
