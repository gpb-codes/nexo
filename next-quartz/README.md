# Quartz Next

Reemplazo del sitio Quartz del segundo cerebro, construido con **Next.js (App Router)**, **Three.js** y **anime.js**.

## Desarrollo

```bash
npm install
npm run dev   # http://127.0.0.1:4100
```

## Producción

```bash
npm run build
npx wrangler pages deploy out --project-name segundo-cerebro-next --branch main --commit-dirty=true
```

URL: https://segundo-cerebro-next.pages.dev

## Funciones

- Grafo 3D estilo JARVIS con etiquetas de nombre y archivo.
- Conexiones curvas y gruesas (`LineSegments2`).
- Búsqueda por título/slug, resaltado con anime.js.
- Control WASD, flechas y joystick digital en móvil.
- Notas estáticas generadas desde `contentIndex.json` de Quartz.
