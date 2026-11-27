# Integraciones

## GitHub
- La consola local (`github-access-console/server.py`) solo escucha en `127.0.0.1`.
- La versión estática de Pages es una instantánea redactada, no tiempo real.
- Nexo muestra estado "No verificado" hasta integrar un endpoint real.

## Quartz / Obsidian
- `quartz/content` → symlink a la bóveda.
- La bóveda sigue siendo la fuente de verdad editable en Obsidian.
- No se implementó edición desde el navegador.

## Voz
- Transcripción y TTS mediante Web Speech API cuando el navegador lo soporta.
- Sin grabación oculta ni envío automático.

## Asistente IA
- API key editable en Ajustes (`users.ai_api_key`); el mensaje del chat actualmente indica que IA no está conectada.
- Migración aditiva: `migrations/0006_ai_assistant.sql`; usar `execute`, no `migrations apply`, por la deriva de `0002_add_theme.sql`.

## Segundo cerebro (Three.js)
- Mapa 3D mediante `public/brain.js` y `public/brain-graph.json` (datos públicos del sitio Quartz).
- Depende de Three.js local: `public/vendor/build/three.module.js` y `OrbitControls`.
- Búsqueda de nodos por título/slug, selección abre el slug en Quartz, estadísticas de nodos/conexiones.
- Añade import map `three` → `/vendor/build/three.module.js`; `script-src 'self' 'unsafe-inline'` lo permite.

## NFC
- Web NFC (`NDEFReader`), disponible solo en Chrome para Android, contexto HTTPS y etiquetas NDEF.
- Lectura de texto, URL, JSON, MIME y vCard; escritura de registros de texto.
- No lee tarjetas bancarias, documentos protegidos ni etiquetas no NDEF.
- En escritorio o navegadores sin soporte los controles se deshabilitan y se muestra la limitación; no se simula.

## Cámara
- `getUserMedia` con cámara trasera preferida (`facingMode: environment`).
- Requiere HTTPS o localhost y permiso del usuario.
- Captura en canvas, compresión JPEG en el dispositivo y guardado en `notes` como `kind: "foto"`.
- La cámara se detiene al capturar, cambiar de pestaña o cerrar sesión.

## IA
- No hay backend conectado. El chat informa que la IA no está disponible.
- La integración con OpenCode/Hermes queda como trabajo posterior.

## Agentes (Hermes/Coucou)
- No instalados ni verificados en esta fase. Se documenta como pendiente.
