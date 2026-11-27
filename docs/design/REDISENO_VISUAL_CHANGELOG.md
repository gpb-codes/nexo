# Changelog — Rediseño visual integral de Nexo

**Fecha:** 27 de noviembre de 2026  
**Estado:** implementado y validado localmente · **sin despliegue en producción**

## Fase 1 — Auditoría visual

- `docs/design/REDISENO_VISUAL_AUDIT.md`: inventario de rutas, componentes, datos reales, dependencias y problemas visuales del dashboard, tareas, proyectos, notas, contactos, Second Brain, ajustes y navegación.

## Fase 2 — Sistema de diseño

- `docs/design/DESIGN_SYSTEM.md`: tokens de color, tipografía, espaciado, radios, componentes `.ui-*`, navegación, accesibilidad, responsive y reglas de implementación.
- `unified-app/public/styles.css`: nuevos tokens `--cyan`, `--surface-1`, `--space-*` y primitivas compartidas:
  `.ui-card`, `.ui-btn`, `.ui-input`, `.ui-badge`, `.ui-progress`, `.ui-empty`, `.ui-avatar`, `.ui-loading`, `.ui-tooltip`.
- No se introdujo ninguna biblioteca de componentes nueva.

## Fase 3 — Dashboard

- `unified-app/public/index.html`: nueva pantalla de inicio con:
  - encabezado “Bienvenido de vuelta,” + nombre del usuario autenticado;
  - subtítulo “Tu segundo cerebro, en un solo lugar.”;
  - esfera 3D real como protagonista visual;
  - acceso destacado a Segundo Cerebro;
  - paneles de tareas diarias y proyectos con datos reales;
  - barra de progreso derivada del estado real de las tareas;
  - herramientas secundarias y estado de actividad honesto.
- `unified-app/public/profile-sphere.js`: esfera Three.js con textura del avatar real, material translúcido, luces morada/azul/cian, órbita geométrica, respuesta al cursor y pausa con `prefers-reduced-motion`.
- `unified-app/public/app.js`: montaje diferido de la esfera, bienvenida dinámica sin nombres escritos en código, render de tareas/proyectos del dashboard, marcar tareas como completadas desde el dashboard y crear proyecto desde el panel.
- Topbar: marca Nexo, notificaciones, selector de tema, acceso al perfil e indicador de sesión.
- Sidebar plegable en escritorio.

## Fase 4 — Páginas internas

- Búsqueda local en Tareas, Notas/Captura y Contactos (`#taskSearch`, `#noteSearch`, `#contactSearch`), combinada con los filtros existentes.
- Ajustes:
  - la API key ya no se escribe en el DOM tras cargar o guardar;
  - se muestra estado “API key configurada · no se muestra”;
  - guardar sin escribir una clave no borra la clave existente.
- Se conservan íntegramente:
  - formularios y CRUD de tareas, proyectos, notas y contactos;
  - NFC y cámara reales;
  - pantallas de GitHub, voz, chat IA, perfil y términos;
  - grafo Three.js del Second Brain;
  - app nativa Expo, cuyos tokens (`mobile/src/presentation/theme/tokens.ts`) ya usan la paleta exacta y no requieren cambios destructivos.

## Fase 5 — Responsive

- `@media (max-width: 1080px)`: hero y paneles del dashboard en una columna, órbita reducida.
- `@media (max-width: 900px)`: bottom navigation fija con Inicio, Tareas, Proyectos, Cerebro y Notas; botón “Más” para el resto de secciones; areas táctiles ≥42px; padding inferior para no tapar contenido.
- `@media (max-width: 640px)`: métricas en 2 columnas, título ajustado, acciones flexibles.
- La sidebar se contrae en escritorio y el drawer sigue disponible en móvil.

## Fase 6 — Validación local

- `node --check unified-app/public/app.js` — correcto.
- `node --check unified-app/public/profile-sphere.js` — correcto.
- IDs HTML únicos y todas las referencias `$("id")` resueltas.
- Consola del navegador local sin errores de módulos ni de runtime.
- Esfera montada: canvas 240×240 CSS → 300×300 dispositivo (DPR 1.25), textura DiceBear real con respuesta HTTP 200.
- Datos reales verificados: tarea y proyecto creados vía API, paneles del dashboard actualizados.
- Búsquedas locales verificadas: coincidencia y estado vacío.
- API key verificada: input vacío, placeholder seguro y clave ausente del DOM tras guardar.
- Sidebar plegable verificado en ambos sentidos.
- No se ejecutó `wrangler pages deploy` ni cualquier otro despliegue.

## Fase 7 — Documentación

- `docs/design/REDISENO_VISUAL_AUDIT.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/design/REDISENO_VISUAL_CHANGELOG.md` (este archivo)

## Limpieza

- Usuario temporal local `diseno-1795808681495@example.com` y sus filas asociadas eliminadas de la D1 local.

## Estado final

- Cambios listos para revisión.
- **No se ha desplegado nada en producción.**
