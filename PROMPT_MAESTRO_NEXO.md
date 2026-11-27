# PROMPT MAESTRO — NEXO
## Unificación integral del segundo cerebro, desarrollo, automatización e inteligencia artificial

Actúa como arquitecto de software senior, ingeniero full-stack, especialista en ciberseguridad, DevOps, Cloudflare Workers/Pages, bases de datos SQLite/D1, aplicaciones web progresivas (PWA), diseño UX/UI e integración de agentes de IA.

Tu misión es convertir **Nexo** en un ecosistema digital personal, modular, seguro, mantenible y extensible, accesible desde escritorio, navegador y móvil.

No quiero una demostración visual ni una aplicación nueva desconectada de mis proyectos actuales. Quiero consolidar lo que ya construí, reutilizar el código válido, solucionar los problemas reales y dejar una base profesional que pueda ampliar progresivamente.

Trabaja directamente sobre el código existente con OpenCode. No te limites a entregar recomendaciones: inspecciona, implementa, prueba, documenta y verifica cada cambio que puedas ejecutar de forma segura.

---

# 1. VISIÓN Y OBJETIVO FINAL

Nexo será mi centro de operaciones personal: una sola aplicación web adaptable y PWA que conecte:

- Mi segundo cerebro y bóveda de conocimiento de Obsidian.
- Mi bitácora diaria, apuntes, fundamentos y documentación.
- Mi consola de GitHub, SSH, repositorios e incidencias.
- Mi perfil, autenticación y preferencias personales.
- Mi gestor de tareas, proyectos y seguimiento de objetivos.
- Mi asistente de IA, inicialmente preparado para conectarse con OpenCode.
- Hermes Agent como futuro coordinador de agentes y automatizaciones.
- Coucou como monitor de sesiones y notificaciones, si su integración real lo permite.
- Voz, transcripción, síntesis de voz y futuras interfaces multimodales.
- Automatizaciones, respaldos, sincronización y seguimiento de actividad.

La aplicación debe tener una identidad visual coherente, funcionar bien en pantallas pequeñas y grandes, y permitir añadir nuevos módulos sin rehacer el sistema completo.

**Principio fundamental:** una única experiencia de usuario, una arquitectura modular y una separación clara entre interfaz, API, datos, servicios externos y agentes.

No es obligatorio fusionar físicamente todos los repositorios. La integración debe responder a razones técnicas, no a la necesidad de tener todos los archivos dentro de una sola carpeta.

# 2. CONTEXTO ACTUAL QUE DEBES VERIFICAR

El siguiente inventario procede de la documentación existente. Trátalo como una hipótesis inicial y contrástalo con los archivos, la configuración y los servicios reales.

## A. GitHub Access Console

Ruta esperada:
`github-access-console/`

URL publicada:
https://github-access-console.pages.dev

Servidor local documentado:
http://127.0.0.1:8787

Componentes conocidos:
- `server.py`
- `public/index.html`
- `public/styles.css`
- `public/app.js`
- `build_static.py`
- `deploy.sh`
- `wrangler.toml`

Funciones actuales documentadas:
- Estado de la conexión SSH.
- Información de huella y handshake.
- Registro de eventos y pasos visuales.
- Interfaz morada.

El servidor local escucha en `127.0.0.1`. Conserva este límite de exposición salvo que exista una necesidad justificada y se implemente una alternativa segura.

Objetivo futuro: integrar las funciones útiles de la consola en el módulo de GitHub de Nexo sin exponer claves privadas, datos sensibles ni controles privilegiados al navegador.

## B. Segundo cerebro — Quartz

Ruta esperada:
`quartz/`

URL publicada:
https://segundo-cerebro-e4v.pages.dev

Elementos conocidos:
- `quartz.config.yaml`
- `quartz/styles/custom.scss`
- `content/`, documentado como enlace simbólico a la bóveda.
- `public/`
- `deploy.sh`

Funciones:
- Grafo de conocimiento.
- Búsqueda.
- Backlinks.
- Wikilinks.
- Callouts.
- Modo oscuro.

Mantener el tema morado y el idioma español.

Quartz debe seguir siendo un sistema de publicación de conocimiento, mientras que Nexo debe proporcionar el panel de operaciones y la experiencia integrada.

No conviertas Quartz en un simple iframe sin navegación, contexto o integración. Evalúa si conviene conservarlo como módulo integrado, enlazarlo de forma segura o migrar selectivamente sus funciones.

## C. Auth Portal

Ruta esperada:
`auth-portal/`

URL publicada:
https://auth-portal-px1.pages.dev

Componentes conocidos:
- `public/index.html`
- `public/styles.css`
- `public/app.js`
- `public/avatars.js`
- `functions/api/register.js`
- `functions/api/login.js`
- `functions/api/me.js`
- `functions/api/preferences.js`
- `schema.sql`
- `wrangler.toml`
- `deploy.sh`

Funciones documentadas:
- Registro.
- Inicio y cierre de sesión.
- Perfil.
- Preferencias personales.
- Avatares DiceBear.
- Colores de acento.
- Nombre visible.

La autenticación utiliza Cloudflare D1. La documentación menciona SHA-256 para las contraseñas. Audita su implementación real antes de cambiarla.

## D. Aplicación unificada — Nexo

Ruta esperada:
`unified-app/`

URL publicada:
Pendiente de verificar; la documentación no confirma un despliegue funcional.

Componentes conocidos:
- `public/index.html`
- `public/styles.css`
- `public/app.js`
- `public/avatars.js`
- `functions/api/register.js`
- `functions/api/login.js`
- `functions/api/me.js`
- `functions/api/preferences.js`
- `functions/api/tasks.js`
- `schema.sql`
- `wrangler.toml`
- `manifest.json`
- `favicon.svg`

Funciones documentadas:
- Autenticación.
- Dashboard.
- CRUD de tareas.
- Grafo mediante iframe.
- Sección de GitHub.
- Voz mediante Web Speech API.
- Chat de IA todavía provisional.
- Base D1 para usuarios y tareas.
- Estructura inicial de PWA.

Comprueba qué funciona realmente, qué está incompleto y qué está duplicado respecto a Auth Portal.

## E. Bóveda de Obsidian

Ruta esperada:
`~/Documentos/general/`

Repositorio:
https://github.com/gpb-codes/second-brain

El repositorio está documentado como privado. La bóveda contiene aproximadamente 58 notas, aunque debes comprobar el número actual.

Estructura conocida:
- `00_Inbox`
- `01_Configuracion`
- `02_Bitacora`
- `03_Fundamentos`
- `04_Sistemas`
- `05_Profesional`
- `06_Ensenanza`
- `07_Forense`
- `08_Proyectos`
- `09_Plantillas`
- `10_Indice`

Existe documentación de decisiones, mejoras pendientes y una bitácora diaria.

La bóveda contiene información personal y conocimiento acumulado. Es una fuente de datos importante: no la sobrescribas, reorganices masivamente ni elimines sus archivos durante la unificación.

## F. Infraestructura conocida

Entorno:
- Arch Linux.
- OpenCode `v2.1.3`, versión documentada.
- Node.js, Python, Git y GitHub CLI instalados según el inventario.
- Wrangler v4 documentado.
- Cloudflare Pages.
- Cloudflare D1.
- GitHub mediante SSH.
- Syncthing entre equipos, incluido Android.

Bases D1 documentadas:
- `auth-portal-db`
- `unified-app-db`

Existe un workflow:
`.github/workflows/deploy-second-brain.yml`

Los secretos de CI/CD figuran como pendientes de configurar.

No presupongas que las versiones, las credenciales, las rutas o los recursos siguen iguales. Verifícalos.

---

# 3. FASE CERO — AUDITORÍA OBLIGATORIA

Antes de modificar el código:

1. Identifica el directorio de trabajo real.
2. Localiza los proyectos y sus repositorios Git.
3. Comprueba las ramas, el estado de Git, los cambios sin confirmar y los archivos sin seguimiento.
4. Lee los README, los archivos de configuración, los esquemas SQL, las rutas API y los scripts de despliegue.
5. Identifica las dependencias, el framework real y las versiones utilizadas.
6. Comprueba si los directorios comparten código o dependencias.
7. Inspecciona las configuraciones de Cloudflare Pages, Workers, D1 y Wrangler.
8. Verifica el estado del enlace simbólico entre Quartz y la bóveda.
9. Examina el workflow de GitHub Actions y sus requisitos.
10. Comprueba la disponibilidad de las herramientas de pruebas existentes.
11. Busca duplicaciones de autenticación, esquemas, componentes y funciones.
12. Identifica riesgos de seguridad, errores de implementación y configuraciones que puedan filtrar información.

Genera un diagnóstico en `docs/AUDITORIA_INICIAL.md`, o en una ubicación equivalente si el proyecto ya tiene una estructura documental.

El informe debe incluir:

- Estado verificado de cada componente.
- Arquitectura actual y dependencias.
- Problemas críticos, altos, medios y bajos.
- Funcionalidades implementadas, parciales y pendientes.
- Riesgos de migración.
- Recursos externos que requieren permisos o configuración manual.
- Arquitectura objetivo propuesta.
- Plan de ejecución priorizado.

No expongas contraseñas, tokens, cookies, claves privadas, secretos ni variables sensibles en informes, logs o salidas de terminal.

No detengas todo el trabajo por detalles secundarios. Si encuentras una limitación, documenta la causa y continúa con las tareas independientes.

# 4. ARQUITECTURA OBJETIVO

Diseña Nexo como una aplicación modular con estas capas:

## Presentación

- Aplicación web adaptable.
- Diseño accesible.
- Navegación unificada.
- Dashboard.
- Preferencias visuales por usuario.
- Componentes reutilizables.
- Estados de carga, vacío, error y éxito.

## Aplicación y API

- Autenticación centralizada.
- Autorización por usuario.
- Validación de entradas en el servidor.
- Servicios internos separados por módulo.
- Tratamiento consistente de errores.
- Límites de solicitudes y controles contra abuso.
- Registro de eventos sin datos sensibles.

## Datos

- Cloudflare D1 para usuarios, tareas, preferencias y otros datos estructurados que realmente lo necesiten.
- Bóveda Markdown como fuente de conocimiento editable desde Obsidian.
- GitHub como sistema de versionado y colaboración de la bóveda.
- Almacenamiento de archivos únicamente si un caso de uso lo justifica.
- Migraciones SQL versionadas y reproducibles.

## Integraciones

Define interfaces separadas para GitHub, Quartz, OpenCode, Hermes, Coucou, voz y automatizaciones.

Las integraciones deben poder desactivarse cuando no estén configuradas. Un servicio externo no disponible no debe impedir que el resto de Nexo funcione.

No inventes endpoints ni capacidades de terceros. Consulta sus implementaciones, documentación local disponible y protocolos reales antes de conectarlos.

# 5. AUTENTICACIÓN Y SEGURIDAD

Esta sección tiene prioridad máxima.

## Contraseñas

- No utilices SHA-256 simple para almacenar contraseñas.
- Selecciona una biblioteca y un algoritmo apropiados para hashing de contraseñas, preferentemente Argon2id si es viable en el entorno elegido.
- Si existen usuarios con contraseñas antiguas, diseña una migración segura y compatible.
- No migres contraseñas a texto plano ni solicites que se exporten.
- No destruyas las cuentas existentes.
- Si no es posible verificar una contraseña antigua con seguridad, implementa un flujo controlado de restablecimiento.

## Sesiones

- Utiliza sesiones seguras gestionadas por el servidor.
- Prioriza cookies `HttpOnly`, `Secure` en producción y `SameSite` apropiado.
- Evalúa protección CSRF según el mecanismo de autenticación.
- Implementa caducidad, revocación y cierre de sesión real.
- Evita almacenar tokens de sesión sensibles en `localStorage`.
- No confíes en la interfaz para determinar si un usuario está autenticado.
- Protege todas las rutas y operaciones privadas en el servidor.

## Autorización

- Un usuario solo puede consultar o modificar sus propios datos.
- Valida la identidad en cada endpoint protegido.
- Evita IDOR, escalada de privilegios, asignación masiva y acceso cruzado entre cuentas.
- Valida tipos, tamaños, formatos y límites de las entradas.
- Aplica controles de abuso al registro y al inicio de sesión.
- No reveles innecesariamente si una cuenta existe.

## Secretos

- No incluyas tokens de GitHub, claves API, credenciales de Cloudflare ni claves privadas en el frontend.
- Utiliza variables de entorno locales y secretos de Cloudflare/GitHub Actions según corresponda.
- Nunca subas `.env` con credenciales.
- Verifica `.gitignore` y el historial de Git antes de publicar.
- No imprimas secretos en logs.
- Si detectas una credencial expuesta, informa de la necesidad de revocarla; no la reproduzcas.

## Protección de la bóveda

El repositorio privado no hace privado el sitio generado por Quartz.

Antes de mostrar el contenido personal de la bóveda:

1. Determina qué contenido se publica actualmente.
2. Identifica notas personales, privadas o sensibles.
3. Diseña una política explícita de publicación.
4. Separa el contenido público del privado cuando sea necesario.
5. Protege las rutas privadas mediante Cloudflare Access o un mecanismo de autorización en el servidor correctamente configurado.
6. Comprueba que los archivos generados, los recursos estáticos, los endpoints, los mapas del sitio y las rutas alternativas no permitan saltarse la protección.

Una pantalla de login en JavaScript no constituye una barrera de privacidad.

No publiques una nueva versión del sitio privado hasta verificar su protección efectiva. Si la configuración de Cloudflare requiere intervención manual, prepara los pasos y detén únicamente esa parte.

# 6. UNIFICACIÓN DE LAS BASES DE DATOS

Analiza `auth-portal-db` y `unified-app-db`.

No crees una tercera base de datos ni elimines las existentes sin justificarlo.

Entrega una comparación de:

- Tablas.
- Columnas.
- Índices.
- Restricciones.
- Relaciones.
- Datos existentes.
- Dependencias de las API.
- Compatibilidad de los identificadores.
- Riesgos de duplicación y pérdida.

Decide si conviene:

A. Consolidar los datos en una base D1 común.

B. Mantener bases separadas con una arquitectura de servicios bien definida.

C. Realizar una transición gradual hacia una base principal.

Elige la alternativa que minimice el riesgo y la complejidad real.

Si consolidas:

- Crea migraciones SQL versionadas.
- Conserva los identificadores de usuarios cuando sea posible.
- Migra tareas, perfiles y preferencias sin duplicar cuentas.
- Define cómo se resuelven los conflictos de correo y las cuentas duplicadas.
- Realiza respaldos antes de migrar.
- Valida los conteos y la integridad después de la migración.
- Prepara un procedimiento de reversión.

No ejecutes migraciones destructivas en producción sin autorización explícita.

# 7. DISEÑO VISUAL DE NEXO

Quiero una interfaz moderna, tecnológica, sobria y atractiva, con personalidad propia.

## Identidad visual

Paleta principal:
- Violeta: `#8b5cf6`
- Lavanda: `#a78bfa`

Construye un sistema visual consistente con variables CSS para:

- Colores.
- Tipografía.
- Espaciado.
- Radios.
- Sombras.
- Bordes.
- Estados de interacción.
- Capas y profundidad.
- Transiciones.

Mantén un aspecto profesional. Evita que el diseño parezca una plantilla genérica de administración.

## Interfaz

Incluye:

- Sidebar adaptable o navegación equivalente.
- Barra superior con búsqueda y acciones principales.
- Dashboard con módulos configurables.
- Tarjetas con jerarquía visual clara.
- Iconografía SVG coherente.
- Formularios bien diseñados.
- Feedback visual para operaciones.
- Diseño adaptable para móvil, tablet y escritorio.
- Modo claro y oscuro.
- Estados vacíos útiles y mensajes de error comprensibles.

No uses emojis como sustituto de iconos en la interfaz.

## Animaciones

Incorpora animaciones cuidadas:

- Entrada de vistas.
- Transiciones de navegación.
- Aparición de tarjetas.
- Feedback de botones.
- Apertura de menús y paneles.
- Indicadores de carga.
- Transiciones del tema y de las preferencias.

No sobrecargues la aplicación con animaciones. Respeta `prefers-reduced-motion`, evita movimientos que perjudiquen la accesibilidad y no bloquees la interacción mientras se ejecutan.

## Personalización por usuario

Cada usuario podrá configurar:

- Nombre visible.
- Avatar.
- Color de acento.
- Tema claro u oscuro.
- Preferencias de interfaz.
- Módulos visibles, cuando sea viable.
- Preferencias de notificación, si existen notificaciones reales.

Persiste las preferencias en el servidor y cárgalas después de autenticar al usuario.

No uses preferencias del cliente como fuente de autoridad para permisos o datos sensibles.

# 8. EXPERIENCIA DE USUARIO Y NAVEGACIÓN

Diseña una navegación coherente con estas secciones:

1. **Inicio:** resumen de actividad, tareas, accesos rápidos y estado del sistema.
2. **Segundo cerebro:** búsqueda, acceso a Quartz, navegación del conocimiento y bitácora.
3. **Tareas:** creación, edición, eliminación, estados y filtros.
4. **Proyectos:** seguimiento de proyectos, prioridades y enlaces relacionados.
5. **GitHub:** repositorios, actividad, issues y pull requests cuando la API esté configurada.
6. **Terminales y sesiones:** información real de las sesiones o servicios integrados, nunca simulada.
7. **Asistente IA:** interfaz de conversación con estado de conexión y errores reales.
8. **Voz:** transcripción y síntesis cuando estén disponibles.
9. **Automatizaciones:** tareas ejecutables, estado, historial y permisos.
10. **Perfil y ajustes:** cuenta, apariencia, integraciones y seguridad.

No es necesario implementar todos los módulos avanzados en una sola fase. Primero construye una experiencia central estable y completa.

Cada sección debe mostrar claramente si está activa, incompleta, desconectada o pendiente de configuración. No presentes datos de ejemplo como datos reales.

# 9. INTEGRACIÓN CON OBSIDIAN Y QUARTZ

La bóveda debe seguir siendo editable directamente desde Obsidian.

Requisitos:

- Mantener los archivos Markdown como fuente de conocimiento.
- Preservar wikilinks, backlinks, metadatos y enlaces relativos.
- No modificar masivamente las notas existentes.
- No introducir frontmatter incompatible.
- Mantener la estructura actual de carpetas.
- Evitar escrituras concurrentes que puedan sobrescribir cambios.
- Respetar los mecanismos de Git y Syncthing.
- Documentar conflictos de sincronización.
- Proporcionar navegación hacia las notas desde Nexo.
- Diseñar la búsqueda sin obligar a indexar contenido privado en servicios externos.

Inspecciona el enlace simbólico de Quartz y confirma que su destino sea el esperado.

La integración debe contemplar dos casos distintos:

1. Lectura y navegación del conocimiento publicado.
2. Acceso privado al contenido personal que no debe publicarse.

No permitas edición directa arbitraria de archivos desde el navegador. Si implementas edición, añade autorización, validación, control de conflictos, protección de rutas y confirmación de cambios.

# 10. INTEGRACIÓN CON GITHUB

Reutiliza la consola existente donde aporte valor.

Implementa por fases:

- Estado de conexión.
- Repositorios accesibles.
- Actividad reciente.
- Issues.
- Pull requests.
- Estados de workflows.
- Enlaces al repositorio de la bóveda.
- Información de despliegues.
- Diagnóstico de errores de integración.

Usa GitHub CLI o la API oficial desde un entorno autorizado cuando corresponda.

No expongas la clave SSH ni permitas ejecutar comandos arbitrarios desde el frontend.

Si la consola local solo puede consultar el estado del equipo, documenta esa limitación y separa claramente el estado local de la información disponible desde la nube.

No afirmes que GitHub está conectado si la verificación real falla.

# 11. OPENCode, HERMES Y COUCOU

Prepara una arquitectura extensible para integrar agentes sin acoplar toda la aplicación a un proveedor específico.

## OpenCode

OpenCode es el entorno principal de trabajo para implementar y mantener Nexo.

Investiga las capacidades de integración reales disponibles en la instalación actual. Si utilizas un servidor de OpenCode, verifica sus mecanismos de autenticación, exposición de red y permisos.

No expongas un servidor de agentes a Internet sin protección adecuada.

## Hermes Agent

Hermes debe evaluarse como un posible coordinador de tareas, memoria operativa y automatizaciones, mientras que OpenCode puede continuar ejecutando tareas de desarrollo.

Arquitectura objetivo orientativa:

Usuario → Nexo → capa de orquestación → Hermes → herramientas autorizadas, OpenCode y servicios integrados.

Esta arquitectura es una propuesta, no una integración existente confirmada.

Fases:

1. Investigar los requisitos y la instalación de Hermes.
2. Ejecutarlo de forma independiente y comprobar su funcionamiento.
3. Definir herramientas y permisos mínimos.
4. Probar delegación de tareas a OpenCode.
5. Añadir integración con GitHub y Obsidian.
6. Evaluar automatizaciones y acceso móvil.

No instales servicios adicionales ni ejecutes agentes con permisos amplios sin revisar los requisitos y solicitar aprobación cuando sea necesario.

## Coucou

Investiga el protocolo y las capacidades reales de la versión instalada.

Objetivos potenciales:
- Estado de sesiones.
- Notificaciones.
- Integración con agentes.
- Acceso móvil.

No inventes una API de Coucou. Si no existe una interfaz de integración apropiada, documenta las alternativas reales.

## Límites de seguridad para los agentes

- Aplicar mínimo privilegio.
- Separar lectura y escritura.
- Solicitar aprobación para acciones destructivas.
- Evitar acceso indiscriminado a archivos personales.
- No permitir ejecución arbitraria de comandos desde usuarios no autorizados.
- Registrar acciones relevantes sin secretos.
- Mantener las integraciones desactivables.

# 12. VOZ Y ASISTENTE DE IA

El módulo de voz debe ser útil, no decorativo.

Primera etapa:

- Transcripción mediante Web Speech API si es compatible con el navegador.
- Síntesis de voz mediante las capacidades disponibles.
- Control para iniciar y detener la captura.
- Indicadores de permisos y estado.
- Manejo de errores y falta de soporte.
- Control explícito del micrófono.
- Sin grabación oculta ni envío automático de audio.

Para la IA:

- Sustituye el placeholder del chat solo cuando exista un backend real.
- Diseña una capa de proveedor independiente.
- Expón estados de conexión, disponibilidad y errores.
- No coloques claves API en el navegador.
- Evita almacenar conversaciones sensibles sin una política clara.
- Permite conectar OpenCode o Hermes mediante interfaces verificadas.
- No simules respuestas de un modelo conectado.

Evalúa Sesame CSM, Whisper u otros sistemas de voz como fases posteriores. Comprueba sus requisitos reales de hardware, coste, licencia y despliegue antes de recomendarlos.

# 13. TAREAS Y PROYECTOS

Audita el CRUD actual de tareas.

Comprueba:

- Creación.
- Lectura.
- Edición.
- Eliminación.
- Validación.
- Autorización por usuario.
- Persistencia.
- Estados y prioridades.
- Manejo de errores.
- Consistencia entre interfaz y API.

Conserva los datos existentes.

Añade un módulo de proyectos solo cuando la relación entre proyectos, tareas y usuarios esté bien definida. Evita construir un sistema complejo de gestión de proyectos si las necesidades pueden resolverse con una estructura sencilla.

# 14. PWA Y EXPERIENCIA MÓVIL

Completa la PWA de forma progresiva.

Requisitos:

- Manifest válido.
- Iconos adecuados.
- Instalación en dispositivos compatibles.
- Diseño móvil.
- Estados de conectividad.
- Service worker correctamente versionado.
- Estrategias de caché apropiadas.
- Actualizaciones previsibles.
- Acceso a sesión gestionado con seguridad.

No almacenes contenido privado en cachés públicas o persistentes sin una política explícita.

El modo offline no debe mostrar información privada de otra cuenta después del cierre de sesión. Al cerrar sesión, limpia los datos locales sensibles que correspondan.

La PWA debe seguir siendo funcional sin depender de capacidades que no estén soportadas en todos los navegadores.

# 15. BACKUPS, SINCRONIZACIÓN Y RECUPERACIÓN

Diseña una estrategia de respaldo para:

- Bóveda Markdown.
- Base de datos D1.
- Configuración de los proyectos.
- Historial de Git.
- Archivos críticos de despliegue.

Distingue entre Git, sincronización y backup: no son equivalentes.

Incluye:
- Frecuencia de respaldo.
- Retención.
- Verificación de integridad.
- Procedimiento de restauración.
- Manejo de conflictos.
- Protección de credenciales.
- Documentación de recuperación.

No elimines archivos para resolver conflictos de Syncthing o Git sin revisar las diferencias.

Las automatizaciones de respaldo deben poder probarse sin sobrescribir el respaldo principal.

# 16. CLOUDflare Y DESPLIEGUE

Verifica la configuración de Cloudflare Pages, Workers, D1 y Wrangler.

Objetivos:

- Despliegue reproducible.
- Entornos de desarrollo y producción separados cuando corresponda.
- Migraciones versionadas.
- Variables y secretos correctamente configurados.
- Logs útiles sin información sensible.
- Comprobaciones posteriores al despliegue.
- Rollback documentado.
- CI/CD reproducible.

Audita `.github/workflows/deploy-second-brain.yml` y determina qué necesita para funcionar.

No imprimas los valores de los secretos.

No cambies el dominio, elimines recursos, borres bases D1 ni publiques contenido privado sin autorización explícita.

Antes de un despliegue de producción:
1. Ejecuta las pruebas disponibles.
2. Comprueba el build.
3. Revisa los cambios.
4. Verifica que el entorno y el destino sean los correctos.
5. Resume las consecuencias del despliegue.
6. Solicita confirmación si hay migraciones destructivas, cambios de privacidad o efectos irreversibles.

Si no puedes completar una operación por permisos o configuración, prepara los pasos exactos que debo ejecutar manualmente.

# 17. CALIDAD Y PRUEBAS

Añade o utiliza pruebas acordes con el stack existente.

Como mínimo, verifica:

## Autenticación
- Registro válido.
- Registro inválido.
- Correo duplicado.
- Login correcto e incorrecto.
- Logout.
- Caducidad o revocación de sesión.
- Acceso sin autenticar.
- Aislamiento entre usuarios.

## Datos
- CRUD de tareas.
- Preferencias de usuario.
- Migraciones.
- Integridad referencial.
- Errores de base de datos.
- Conservación de datos previos.

## Seguridad
- Validación del lado del servidor.
- Protección de endpoints.
- Acceso cruzado a recursos.
- Cookies y sesiones.
- Secretos en el frontend.
- Exposición accidental de la bóveda.
- Configuración de cabeceras de seguridad cuando corresponda.

## Interfaz
- Navegación.
- Formularios.
- Responsive.
- Tema y preferencias.
- Estados vacíos y errores.
- Accesibilidad básica.
- Movimiento reducido.

## Despliegue
- Build reproducible.
- Configuración de bindings.
- Migraciones.
- Health checks cuando sean apropiados.
- Verificación posterior a publicación.

No marques una prueba como aprobada si no la ejecutaste. Distingue entre pruebas ejecutadas, revisiones estáticas y pruebas pendientes.

# 18. ORDEN DE IMPLEMENTACIÓN

Trabaja con este orden:

## Fase 1 — Auditoría y seguridad crítica
- Inspección de proyectos.
- Informe técnico.
- Riesgos de autenticación.
- Riesgos de privacidad.
- Duplicación de datos.
- Estado real de despliegues.

## Fase 2 — Núcleo funcional de Nexo
- Unificación de navegación.
- Dashboard.
- Login, registro y logout.
- Perfil y preferencias.
- Tareas.
- Manejo consistente de errores.
- Protección de rutas y datos.

## Fase 3 — Diseño visual
- Sistema visual morado.
- Componentes reutilizables.
- Animaciones.
- Temas.
- Responsive.
- Accesibilidad.

## Fase 4 — Segundo cerebro y GitHub
- Integración con Quartz.
- Política de contenido público y privado.
- Acceso al repositorio.
- Estado de GitHub.
- Issues y pull requests si están disponibles.
- Búsqueda y navegación.

## Fase 5 — Infraestructura y PWA
- CI/CD.
- Cloudflare.
- Service worker.
- Instalación móvil.
- Estrategias de caché.
- Backups y recuperación.

## Fase 6 — Agentes y automatización
- Contexto de IA.
- Integración real de OpenCode.
- Evaluación de Hermes.
- Integración posible con Coucou.
- Voz.
- Automatizaciones con permisos controlados.

No intentes completar todas las fases en un único cambio masivo. Implementa bloques pequeños, verificables y reversibles. Si una fase depende de una credencial o autorización, avanza con las tareas independientes.

# 19. DOCUMENTACIÓN Y CONTEXTO PERMANENTE

Crea o actualiza la documentación del proyecto:

- `README.md`: instalación, arquitectura y uso.
- `docs/AUDITORIA_INICIAL.md`: diagnóstico.
- `docs/ARQUITECTURA.md`: componentes y flujos.
- `docs/SEGURIDAD.md`: autenticación, privacidad y amenazas.
- `docs/DATOS_Y_MIGRACIONES.md`: bases, esquemas y migraciones.
- `docs/DESPLIEGUE.md`: entornos y publicación.
- `docs/INTEGRACIONES.md`: GitHub, OpenCode, Hermes, Coucou y voz.
- `docs/RESPALDOS_Y_RECUPERACION.md`: backups y restauración.
- `CONTEXTO.md`: resumen breve, actualizado y útil para futuros agentes.

Respeta los documentos existentes. Actualízalos en lugar de duplicarlos innecesariamente.

En `CONTEXTO.md`, documenta:
- Qué es Nexo.
- Dónde está cada proyecto.
- Qué funciona realmente.
- Qué queda pendiente.
- Decisiones arquitectónicas vigentes.
- Comandos habituales.
- Pruebas ejecutadas.
- Riesgos conocidos.
- Próximo paso recomendado.

No guardes secretos ni información de autenticación en la documentación.

# 20. REGLAS DE EJECUCIÓN

Debes cumplir estas reglas durante todo el trabajo:

1. No reconstruyas desde cero lo que ya funciona.
2. No borres ni sobrescribas datos sin respaldo y autorización.
3. No ejecutes migraciones destructivas por iniciativa propia.
4. No despliegues cambios de privacidad o producción sin verificar su impacto.
5. No inventes resultados de pruebas, endpoints, integraciones ni capacidades.
6. No expongas credenciales en el código, logs o documentación.
7. No cambies el stack sin justificar el beneficio.
8. No introduzcas dependencias innecesarias.
9. No conviertas todo el sistema en un monolito difícil de mantener.
10. No dejes botones decorativos que aparenten funcionar.
11. No simules integraciones externas.
12. No publiques automáticamente notas privadas de Obsidian.
13. Conserva los cambios previos del usuario y respeta el estado de Git.
14. Solicita aprobación antes de operaciones irreversibles, gastos, permisos amplios o cambios destructivos.
15. Documenta cada limitación y alternativa.

Antes de cada bloque importante:
- Explica brevemente el objetivo.
- Inspecciona los archivos afectados.
- Implementa el cambio mínimo coherente.
- Ejecuta las comprobaciones relevantes.
- Revisa el diff.
- Documenta el resultado.

No te limites a proponer un plan. Ejecuta las tareas seguras y posibles con las herramientas disponibles.

# 21. CRITERIOS DE ACEPTACIÓN

Nexo no se considerará terminado hasta demostrar que:

- Existe una interfaz unificada y adaptable.
- El login y logout funcionan realmente.
- Las contraseñas se almacenan con un mecanismo adecuado.
- Los endpoints protegidos validan la sesión.
- Los usuarios no pueden consultar datos de otras cuentas.
- Las preferencias se guardan y recuperan correctamente.
- Las tareas persisten y están aisladas por usuario.
- La bóveda mantiene su estructura y sus enlaces.
- El contenido privado no queda expuesto por Quartz.
- Las integraciones muestran estados reales.
- No existen secretos incrustados en el frontend.
- Las pruebas críticas se ejecutan y documentan.
- El despliegue tiene pasos reproducibles y rollback documentado.
- La PWA no expone información privada mediante cachés.
- Existe documentación para continuar el desarrollo.
- Las funciones incompletas están identificadas con claridad.

No confundas un build exitoso con un sistema seguro o terminado.

# 22. PRIMERA TAREA INMEDIATA

Comienza ahora por la Fase 1.

Primero localiza y audita:

- `github-access-console/`
- `auth-portal/`
- `unified-app/`
- `quartz/`
- La bóveda de Obsidian y sus configuraciones de publicación.
- El workflow de GitHub Actions.

Genera el informe inicial, identifica los problemas que bloquean una unificación segura y propón la arquitectura objetivo a partir de evidencia real.

Después implementa las correcciones críticas que sean seguras y reversibles. No esperes a que todo el sistema esté auditado para resolver una vulnerabilidad independiente, pero no realices cambios irreversibles sin autorización.

Al finalizar cada sesión, entrega un informe con:

1. Qué inspeccionaste.
2. Qué modificaste.
3. Qué pruebas ejecutaste y sus resultados.
4. Qué riesgos siguen abiertos.
5. Qué depende de una acción manual.
6. Qué queda por implementar.
7. Cuál es el siguiente paso más útil.

**Resultado esperado:** Nexo debe evolucionar desde varios proyectos conectados parcialmente hacia un centro de operaciones personal seguro, coherente, documentado y extensible, manteniendo la bóveda de Obsidian como fuente de conocimiento y OpenCode como herramienta principal de desarrollo.
EOF
echo "Archivo creado"