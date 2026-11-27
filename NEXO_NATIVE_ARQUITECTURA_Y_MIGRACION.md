# Nexo Native — Arquitectura objetivo y plan de migración

**Versión:** 0.1  
**Fecha:** 26 de noviembre de 2026  
**Estado:** Fase 0 completada; Fases 1–3 y base de Fase 4 (caché SQLite + outbox) implementadas. APK release generado. Auditoría en `docs/migration/AUDITORIA_NATIVE.md`; `mobile/` con login/registro, tareas, proyectos, notas, contactos, ajustes y offline básico. Pendiente: sincronización remota del outbox, cámara/NFC nativos y prueba en dispositivo.

## 1. Decisiones de producto

- Plataforma inicial: Android.
- Plataforma futura: iOS.
- Estrategia: migración gradual por dominios funcionales.
- Destino: reemplazar la aplicación web por una aplicación móvil nativa.
- Backend: conservar y evolucionar los servicios actuales cuando la auditoría confirme que son reutilizables.
- No se debe eliminar la versión web ni sus despliegues hasta alcanzar paridad funcional, migrar los datos necesarios y validar la operación móvil.

## 2. Evidencia disponible y límites

El documento maestro describe:

- `unified-app/`: núcleo con autenticación, tareas, proyectos, notas, contactos, ajustes, PWA y endpoints `/api/*`.
- Cloudflare D1 `unified-app-db`.
- Migraciones `0001` a `0007`.
- Sesiones server-side y cookies HttpOnly.
- Notas/fotos guardadas como data URL en D1, con límite documentado de 950.000 caracteres.
- Web NFC mediante `NDEFReader`, limitado a Chrome Android y HTTPS.
- Cámara mediante `getUserMedia`.
- Asistente IA sin backend conectado; la API key/modelo/endpoint se guardan en columnas de `users`.
- Segundo cerebro integrado con Three.js y un grafo alimentado desde `brain-graph.json`.
- `next-quartz/`: Next.js 14, exportación estática, 322 nodos y 718 conexiones.
- Despliegues Cloudflare Pages.

No se ha inspeccionado el repositorio fuente. Por ello, este documento no afirma nombres de componentes, archivos, funciones, dependencias, contratos HTTP detallados ni compatibilidad real de paquetes. Toda ruta propuesta a continuación es una estructura objetivo, no una descripción del árbol actual.

## 3. Arquitectura objetivo

```text
NEXO MOBILE
Android primero / iOS después
React Native + Expo + TypeScript
        |
        +-- Presentación y navegación
        +-- Casos de uso / dominio
        +-- Adaptadores de plataforma
        +-- Persistencia local SQLite
        +-- Cola de sincronización
        |
        | HTTPS / JSON
        v
NEXO API
Cloudflare Workers (o Pages Functions existentes,
si la auditoría confirma que conviene conservarlas)
        |
        +-- Autenticación y sesiones
        +-- Tareas / proyectos
        +-- Notas / contactos
        +-- Preferencias
        +-- Integraciones externas
        |
        +----------+-----------+
        v          v           v
      D1         R2       Proveedores externos
   datos       archivos   GitHub / IA, etc.
```

### 3.1 Aplicación móvil

Tecnología propuesta:

- React Native + Expo + TypeScript.
- Expo Router para navegación.
- TanStack Query para estado remoto, caché y mutaciones.
- Zustand solo para estado global de interfaz que no pertenezca al servidor.
- SQLite mediante `expo-sqlite` para datos locales y sincronización.
- SecureStore para secretos y credenciales locales.
- Expo Camera para captura fotográfica.
- Expo Notifications para notificaciones, cuando se definan los casos de uso.
- Reanimated para animaciones de interfaz.
- Módulo nativo o biblioteca compatible verificada para NFC.

Usar un **development build** desde el inicio. Expo Go no debe ser el entorno de validación definitivo porque NFC y otras integraciones pueden requerir código/configuración nativa.

### 3.2 Separación por capas

1. **Presentación:** pantallas, componentes, navegación, accesibilidad y temas.
2. **Aplicación:** casos de uso como `CreateTask`, `CompleteTask`, `SaveNote` y `SyncPendingChanges`.
3. **Dominio:** entidades, reglas, validaciones y políticas independientes de React Native.
4. **Infraestructura:** cliente HTTP, SQLite, SecureStore, cámara, NFC y adaptadores externos.

No importar módulos de React Native, Expo ni componentes visuales desde el dominio.

### 3.3 Backend y API

Conservar Cloudflare D1 y las reglas de negocio actuales inicialmente. No reescribir el backend por el solo hecho de migrar la interfaz.

Antes de implementar el cliente móvil, documentar cada endpoint existente: método, ruta, autenticación, payload, respuesta, errores, validación y aislamiento por usuario.

Para autenticación móvil, evaluar sesiones opacas server-side:

- El servidor genera un token aleatorio de alta entropía.
- El cliente conserva el secreto en SecureStore.
- D1 conserva el hash del token, vencimiento, revocación y metadatos de sesión.
- El cliente envía el token en `Authorization: Bearer`.
- Rotación y revocación deben estar definidas.
- No almacenar contraseñas ni tokens en SQLite, AsyncStorage o logs.

No introducir JWT por defecto. La decisión final depende de la implementación actual de sesiones y del modelo de amenazas.

### 3.4 Datos locales y sincronización

La aplicación debe poder abrir y consultar información previamente sincronizada sin conexión.

- SQLite es caché persistente local, no fuente de verdad global.
- Las escrituras offline se registran en una outbox con identificador único, usuario, entidad, operación, payload, fecha y estado.
- La sincronización debe ser idempotente.
- Definir política de conflictos por entidad antes de habilitar edición concurrente.
- No asumir sincronización bidireccional completa en la primera fase.
- Evitar borrar datos locales hasta confirmar la persistencia remota.

### 3.5 Archivos e imágenes

El documento actual indica que las imágenes se guardan como data URL en D1. Esto no es adecuado como estrategia de crecimiento para el cliente móvil.

Propuesta:

- Migrar binarios a Cloudflare R2.
- D1 conserva metadatos, propietario, tipo MIME, tamaño, checksum y clave del objeto.
- Subidas mediante URL firmada o endpoint controlado por el backend.
- Validar autorización, tamaño, MIME real y límites de cuota.
- Mantener una migración compatible para imágenes históricas hasta verificar su copia y lectura.

No ejecutar esta migración antes de medir el uso actual y diseñar un proceso de backfill verificable.

### 3.6 NFC y cámara

**NFC**
- Implementar una interfaz de dominio independiente de la plataforma.
- Android es el primer adaptador.
- Verificar biblioteca, permisos, formatos NDEF soportados, lectura/escritura, ciclo de vida y compatibilidad con la versión de Android objetivo.
- Mantener estados explícitos: no compatible, permiso denegado, NFC desactivado, esperando etiqueta, lectura correcta y error.
- Evaluar iOS por separado: Core NFC tiene restricciones de hardware, permisos, sesiones y tipos de etiquetas.
- No simular NFC en producción.

**Cámara**
- Usar API nativa de cámara.
- Solicitar permisos en contexto.
- Liberar la cámara al abandonar la pantalla o completar captura.
- Comprimir y validar la imagen antes de subirla.
- Probar rotación, ciclo de vida, denegación y revocación de permisos.

### 3.7 Segundo cerebro 3D

No migrar directamente el grafo web como si DOM/CSS2D fueran portables.

Realizar una prueba técnica separada para:
- Renderizado Three.js en React Native.
- Sustitución de etiquetas CSS2D por overlays nativos.
- Interacción táctil, selección, zoom, rotación y búsqueda.
- Rendimiento con el conjunto documentado de 322 nodos y 718 conexiones.
- Consumo de memoria, temperatura y tasa de cuadros en dispositivos Android de gama media.

Mantener el grafo como módulo posterior al núcleo funcional. Si el 3D no alcanza rendimiento aceptable, ofrecer primero una vista 2D/lista navegable sin eliminar la funcionalidad.

## 4. Estructura de referencia

La estructura definitiva debe adaptarse al package manager, convenciones y repositorio real. Una posible organización es:

```text
nexo/
├── unified-app/                 # backend actual; conservar hasta auditar
├── quartz/                      # publicación/contenido existente
├── next-quartz/                 # segundo cerebro web existente
├── mobile/                      # nueva aplicación Expo
│   ├── app/                     # rutas Expo Router
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── tasks/
│   │   │   ├── projects/
│   │   │   ├── notes/
│   │   │   ├── contacts/
│   │   │   ├── settings/
│   │   │   ├── capture/
│   │   │   └── brain/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── database/
│   │   ├── theme/
│   │   └── shared/
│   ├── assets/
│   ├── app.config.ts
│   └── package.json
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── security/
│   └── migration/
└── ...
```

No convertir todavía el repositorio en monorepo ni mover carpetas existentes. Primero revisar workspaces, lockfiles, scripts, pipelines y límites actuales. Extraer paquetes compartidos solo cuando haya lógica de dominio realmente reutilizable.

## 5. Migración gradual por fases

### Fase 0 — Auditoría y línea base

**Objetivo:** conocer exactamente qué existe y qué puede reutilizarse.

Tareas:
- Inspeccionar árbol, package manifests, lockfiles y scripts.
- Identificar frontend, handlers API, middleware, bindings D1 y configuración Cloudflare.
- Leer migraciones `0001`–`0007` y comparar con el esquema remoto/documentado.
- Trazar flujos completos de autenticación, tareas, proyectos, notas y preferencias.
- Revisar aislamiento por usuario, CSRF, CSP, rate limiting y secretos.
- Inventariar dependencias de navegador: DOM, `window`, `localStorage`, Web NFC, `getUserMedia`, Web Speech, Service Worker y APIs web.
- Medir tamaño de imágenes, consultas y grafo.
- Crear pruebas de caracterización para contratos actuales.

**Salida:** informe de auditoría, mapa de dependencias, catálogo de endpoints, riesgos y backlog priorizado. No modificar comportamiento todavía.

### Fase 1 — Fundación móvil

**Objetivo:** compilar una aplicación Android mínima real.

Tareas:
- Crear `mobile/` sin alterar los proyectos existentes.
- Configurar Expo, TypeScript, Expo Router y development build.
- Definir identificadores de aplicación, entornos y configuración por ambiente.
- Crear cliente API tipado, manejo centralizado de errores y logging sin secretos.
- Implementar tema y tokens visuales basados en la identidad existente.
- Configurar CI para lint, typecheck y pruebas.
- Generar e instalar un build Android en dispositivo físico.

**Criterio de salida:** app instalable, navegación funcional, configuración reproducible y conexión HTTPS al backend de pruebas.

### Fase 2 — Identidad y autenticación

**Objetivo:** establecer una sesión móvil segura.

Tareas:
- Definir contrato de login, logout, refresh/renovación y revocación.
- Adaptar backend sin romper clientes existentes durante la transición.
- Guardar credenciales únicamente en SecureStore.
- Manejar expiración, sesión revocada, conexión perdida y cierre de sesión.
- Probar aislamiento entre usuarios y rotación de tokens.

**Criterio de salida:** pruebas automatizadas de sesión y autorización, incluyendo acceso cruzado denegado.

### Fase 3 — Núcleo funcional

Orden recomendado:
1. Dashboard y preferencias.
2. Tareas.
3. Proyectos.
4. Notas.
5. Contactos.
6. Búsqueda.

Cada módulo debe migrarse con contrato API, estados de carga/vacío/error, validación, accesibilidad, pruebas y telemetría básica.

**Criterio de salida:** paridad funcional verificada módulo por módulo contra la aplicación actual.

### Fase 4 — Persistencia offline y multimedia

Tareas:
- Diseñar esquema SQLite y versionado local.
- Implementar outbox y sincronización idempotente.
- Definir conflictos y reintentos.
- Migrar imágenes a R2 con backfill, checksum y verificación.
- Probar pérdida de red, reinicio de app, duplicados y sesión expirada.

**Criterio de salida:** las operaciones admitidas offline sobreviven reinicios y se sincronizan sin duplicar registros ni exponer datos de otro usuario.

### Fase 5 — Capacidades nativas

Orden:
1. Cámara.
2. NFC Android.
3. Dictado y síntesis de voz.
4. Notificaciones, si se definen casos de uso.
5. Integración de contactos del dispositivo solo si se requiere; no confundir con la agenda de colaboradores ya existente.

**Criterio de salida:** pruebas físicas en dispositivos compatibles y estados de permisos/error correctamente tratados.

### Fase 6 — Segundo cerebro

Crear una prueba de concepto del grafo 3D y comparar rendimiento con una vista simplificada. Adaptar navegación y etiquetas al modelo de interfaz nativa.

**Criterio de salida:** interacción usable y rendimiento medido en dispositivos de referencia.

### Fase 7 — Sustitución de la web y lanzamiento Android

- Completar matriz de paridad.
- Migrar o verificar los datos de usuarios.
- Ejecutar pruebas de regresión, seguridad, accesibilidad y rendimiento.
- Preparar firma, versionado, backups, política de privacidad y publicación.
- Mantener un período de transición y rollback.
- Retirar la web solo después de confirmar que no quedan flujos o datos dependientes de ella.

### Fase 8 — Preparación iOS

- Revisar módulos nativos y dependencias multiplataforma.
- Implementar adaptadores iOS para cámara, NFC y permisos.
- Validar navegación, safe areas, notificaciones y almacenamiento seguro.
- Compilar y probar en dispositivos iOS.
- Resolver restricciones de distribución y publicación.

## 6. Seguridad y requisitos no funcionales

- TLS obligatorio.
- Autorización server-side en cada recurso y operación.
- Tokens aleatorios, rotables y revocables; nunca secretos en logs.
- Rate limiting para autenticación y endpoints sensibles.
- Validación de payloads en servidor, no solo en cliente.
- Protección de datos locales y limpieza al cerrar sesión cuando corresponda.
- No incluir API keys de proveedores en el bundle móvil.
- El asistente IA requiere backend real/proxy; no llamar directamente al proveedor desde el cliente con una clave persistida en el dispositivo.
- Política de privacidad, retención y eliminación de datos.
- Observabilidad con identificadores de petición, sin contenido sensible.
- Pruebas de accesibilidad, rendimiento, conectividad inestable y ciclo de vida móvil.

## 7. Matriz de paridad funcional

| Capacidad actual | Estrategia móvil | Prioridad |
|---|---|---:|
| Registro/login/logout | Adaptar contrato y almacenamiento seguro | P0 |
| Tareas CRUD y filtros | Migración nativa | P0 |
| Proyectos CRUD | Migración nativa | P0 |
| Identidad, tema y preferencias | Migración nativa | P0 |
| Notas y contactos | Migración nativa | P1 |
| Fotos | Cámara nativa + R2 | P1 |
| NFC | Módulo nativo Android primero | P1 |
| Búsqueda global | Migración nativa | P1 |
| GitHub API | Reutilizar integración backend o cliente seguro | P2 |
| Voz | APIs nativas | P2 |
| Asistente IA | Implementar backend antes del cliente | P2 |
| Grafo 3D | Prueba de rendimiento y adaptación | P3 |
| Instalación/offline PWA | Sustituir por instalación nativa y SQLite/sync | P0 |

P0/P1/P2/P3 son prioridades propuestas, no estados de implementación.

## 8. Riesgos y decisiones pendientes

1. **Autenticación:** el esquema actual usa cookies HttpOnly. Confirmar cómo se crean, validan y revocan sesiones antes de diseñar el contrato móvil.
2. **Backend:** confirmar si `/api/*` vive en Pages Functions, Workers u otra capa.
3. **Migraciones D1:** el documento advierte deriva histórica y que `wrangler d1 migrations apply` no debe usarse sin resolverla. No modificar migraciones a ciegas.
4. **Imágenes:** medir datos históricos antes de moverlos a R2.
5. **NFC:** seleccionar y probar biblioteca concreta; verificar Android y luego iOS.
6. **Three.js:** validar renderizador y etiquetas sin DOM.
7. **IA:** definir proveedor, proxy, gestión de secretos y límites de uso.
8. **Reemplazo web:** no retirar producción hasta cerrar paridad, migración y rollback.

## 9. Entorno de desarrollo y compilación

El desarrollo Android puede realizarse localmente en Linux con Android SDK, JDK y herramientas requeridas por Expo/React Native. Para iOS, la compilación local requiere macOS y Xcode; una alternativa es usar compilación en la nube cuando se alcance esa fase.

Usar development builds y no depender exclusivamente de Expo Go, ya que la aplicación necesitará módulos nativos personalizados o de terceros.

Comandos iniciales, únicamente después de auditar el package manager y crear el proyecto:

```bash
npx create-expo-app@latest mobile
cd mobile
npx expo install expo-dev-client
npx expo run:android
```

No ejecutar estos comandos sobre el repositorio actual hasta confirmar que `mobile/` no existe y definir la estrategia de dependencias.

## 10. Orden inmediato de trabajo

1. Obtener el repositorio completo o acceso de lectura.
2. Inspeccionar estructura y herramientas de workspace.
3. Auditar autenticación y API.
4. Auditar D1/migraciones y almacenamiento de imágenes.
5. Inventariar dependencias web que deben reemplazarse.
6. Entregar diagnóstico con archivos y funciones reales.
7. Aprobar arquitectura detallada y contratos móviles.
8. Crear el esqueleto Android sin tocar la versión productiva.
9. Migrar autenticación y luego módulos funcionales uno por uno.

**Regla de ejecución:** no eliminar ni reescribir funcionalidades existentes sin evidencia, pruebas de equivalencia y una ruta de rollback.
