# Sistema de diseño — Nexo

Versión 1.0 · 27 de noviembre de 2026

## Principios

- Minimalismo tecnológico: cada elemento debe tener una función.
- Claridad antes que decoración.
- Superficies oscuras azuladas, nunca negro puro.
- Morado como identidad; cian/azul como estados e interacción.
- Componentes reutilizables y consistentes.
- Responsive por composición, no solo por escala.
- Movimiento sutil y respetuoso con `prefers-reduced-motion`.

## Tokens

### Color

| Token | Valor | Uso |
|---|---|---|
| `--accent` | `#8b5cf6` | Identidad Nexo |
| `--accent-2` | `#a78bfa` | Acentos suaves |
| `--sky` | `#7dd3fc` | Estados secundarios |
| `--cyan` | `#67e8f9` | Interacción/HUD |
| `--ink` | `#f8fafc` | Texto principal |
| `--metal` | `#e8eaed` | Texto/metadatos |
| `--bg-1` | `#050924` | Fondo principal |
| `--surface-1` | `#0f1022` | Superficies |

### Tipografía

- Principal: `Inter`.
- Monoespacio: metadatos, IDs, fechas técnicas y HUD del grafo.

### Radios y espaciado

- Radios: `8px`, `12px`, `18px`, `24px`.
- Espaciado base: `4/8/12/16/24/32`.
- Bordes: `1px` con opacidad baja.
- Sombras: difusas y poco intensas; evitar glow en todos los componentes.

## Componentes

| Componente | Clases base | Reglas |
|---|---|---|
| Botón | `.ui-btn`, `.ui-btn--primary`, `.ui-btn--ghost` | Alto táctil mínimo 42px, feedback al hover/active |
| Input | `.ui-input` | Borde sutil, foco cian, etiqueta siempre visible |
| Card | `.ui-card` | Superficie, borde tenue, sin sombra exagerada |
| Badge | `.ui-badge` | Estado/prioridad; texto pequeño en uppercase |
| Progress | `.ui-progress` | Barra neutra con relleno de acento |
| Avatar | `.ui-avatar` | Circular; imagen real del usuario cuando existe |
| Empty state | `.ui-empty` | Mensaje honesto, sin ficción |
| Loading | `.ui-loading` | Spinner discreto |
| Modal | `.ui-modal` | Overlay, foco, cierre por Escape/backdrop |
| Tooltip | `.ui-tooltip` | Texto corto, contraste suficiente |

## Navegación

### Escritorio

Sidebar plegable con secciones principales y footer de cuenta. Estado activo con acento morado y fondo muy tenue.

### Móvil

Bottom navigation con Inicio, Tareas, Proyectos, Second Brain y Notas. Botón “Más” abre hoja con el resto de secciones. Áreas táctiles ≥42px.

## Interacciones

- Transiciones de página: fade/translate corto.
- Hover: cambio de borde/fondo, no glow excesivo.
- Movimiento de esfera: lento, pausable por `prefers-reduced-motion`.
- Grafo: conservar rotación, zoom y selección existentes.
- Evitar bucles infinitos que no aporten información.

## Accesibilidad

- Contraste AA para texto principal.
- `aria-label` en controles iconográficos.
- Focus visible en todos los controles.
- Modales con cierre por Escape y backdrop.
- Etiquetas en inputs.
- Movimiento reducido respetado.

## Responsive

| Ruptura | Composición |
|---|---|
| ≥1200px | Sidebar + header + grid de 2-4 columnas |
| 768–1199px | Sidebar o drawer + grid de 2 columnas |
| <768px | Bottom nav + una columna + tarjetas compactas |

## Reglas de implementación

- No crear una librería de componentes nueva.
- Preferir variables CSS y clases utilitarias compartidas.
- No duplicar estilos entre secciones.
- No introducir datos ficticios.
- No ocultar funcionalidades existentes.
- No desplegar hasta validación completa.
