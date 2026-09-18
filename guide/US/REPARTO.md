# Reparto de historias — Frontend

**Programa de Gestión de Mejora de Comprensión Lectora** (Peñascal)  
40 historias · 168 puntos · 3 personas  
Actualizado: 18/09/2026  

---

## 1. Cómo está hecho el reparto

**Por bloques verticales de funcionalidad y vistas, no por capas.** Cada persona hace su historia completa en la interfaz: vista (`views/`), subcomponentes específicos, servicio de comunicación (`services/`), composable asociado, validaciones y pruebas con MSW.

Repartir por capas —uno hace estilos CSS, otro los servicios de API y otro las pantallas Vue— es la peor trampa en frontend con tres personas:
- Nadie puede probar una pantalla real sin esperar a que otro termine su servicio o su hoja de estilos.
- Todo el mundo bloquea a todo el mundo a diario.
- Cada commit produce conflictos en ficheros compartidos (`api.js`, `components.css`, `main.js`).
- En cada integración se descubre que los tres interpretaban la respuesta del backend de forma diferente.

Cada bloque agrupa pantallas que comparten dominios de usuario, rutas y servicios afines, para que dos personas toquen los mismos ficheros lo menos posible.

---

## 2. Los tres bloques

### Bloque A — Datos, alumnado y segmentación
**Marlen** · 13 historias · 53 puntos

Todo lo relativo a la estructura organizativa (centros y secciones), el censo de alumnado, la ficha completa de estudiante, la ingesta masiva desde Alexia, los filtros multicriterio y la supervisión pedagógica (clasificación por niveles y detección de alumnado sin progreso).

| ID | Título | Backend | Pts | Prioridad |
| :--- | :--- | :--- | :---: | :--- |
| FE-04 | Dockerización y proxy | — | 5 | Alta *(Completado)* |
| FE-11 | Estados de pantalla (`StateBlock`) | — | 3 | Alta *(Completado)* |
| FE-12 | Formularios con validación | — | 5 | Alta *(Completado)*|
| FE-23 | Pantalla de importación (Alexia) | BE-09 | 5 | Alta *(Completado)* |
| FE-24 | Informe de errores de importación | BE-08 | 3 | Media *(Completado)* |
| FE-25 | Navegación por centros y secciones | BE-10 | 3 | Alta |
| FE-26 | Ficha del alumno (agregada) | BE-28 | 5 | Alta |
| FE-27 | Buscador de alumnos | BE-29 | 3 | Media |
| FE-28 | Filtros multicriterio | BE-27 | 5 | Alta *(Bloqueada)* |
| FE-32 | Comparativa por grupos | BE-32 | 5 | Media |
| FE-34 | Clasificación por nivel lector | BE-30 | 5 | Alta |
| FE-35 | Aviso de alumnos sin progreso | BE-34 | 3 | Baja |
| FE-40 | Manual de usuario | — | 3 | Media |

**Vistas y carpetas propias:** `src/views/centers/`, `src/views/student-detail/`, `src/views/import/`  
**Componentes propios:** `src/components/ui/StateBlock.vue`, `src/components/domain/LevelBadge.vue`, `src/components/domain/StudentSearch.vue`  
**Servicios y utilidades propias:** `src/services/studentsService.js`, `src/services/importService.js`, `src/utils/validation.js`  
**Simulacros MSW propios:** `src/tests/handlers/studentsHandlers.js`, `src/tests/handlers/importHandlers.js`

---

### Bloque B — El aula: catálogos, registro diario y salidas
**Yeremi** · 15 historias · 56 puntos

El día a día del docente en el aula y las salidas documentales. La gestión del catálogo de lecturas y pruebas, el flujo crítico de registro de resultados (individual y lote en el aula), la asignación de libros y la generación de salidas impresas y exportaciones.

| ID | Título | Backend | Pts | Prioridad |
| :--- | :--- | :--- | :---: | :--- |
| FE-01 | Andamiaje del proyecto | — | 5 | Crítica *(Completado)* |
| FE-13 | Uso en tableta | — | 5 | Baja |
| FE-14 | Alta de prueba | BE-11 | 3 | Alta |
| FE-15 | Edición y baja de pruebas | BE-13 | 3 | Media |
| FE-16 | Listado paginado de pruebas | BE-14 | 3 | Media |
| FE-17 | Catálogo de libros | BE-16, BE-17 | 3 | Alta *(Completado)* |
| FE-18 | Registrar el resultado de una prueba | BE-18 | 5 | **Crítica** |
| FE-19 | Corregir o anular un resultado | BE-21 | 3 | Alta *(Completado)* |
| FE-20 | Registro de resultados en lote | BE-22 | 8 | Alta *(Completado)* |
| FE-21 | Asignar un libro | BE-23, BE-25 | 3 | Alta *(Completado)* |
| FE-22 | Cerrar una lectura | BE-24 | 2 | Alta *(Completado)* |
| FE-29 | Historial por sección | BE-51 | 3 | Media *(Completado)* |
| FE-36 | Exportación a Excel | BE-35 | 3 | Alta *(Completado)* |
| FE-37 | Informe individual imprimible | BE-36 | 5 | Media *(Completado)* |
| FE-38 | Informe agregado de grupo | BE-37 | 5 | Media *(Completado)* |

**Vistas y carpetas propias:** `src/views/tests-catalog/`, `src/views/books-catalog/`, `src/views/bulk-entry/`, `src/views/section-detail/`, `src/views/reports/`  
**Componentes propios:** `src/components/domain/TestTypeBadge.vue`, `src/components/domain/DeltaPill.vue`, componentes de tabla de lote  
**Servicios y utilidades propias:** `src/services/testsService.js`, `src/services/booksService.js`, `src/services/resultsService.js`, `src/services/reportsService.js`, `src/utils/format.js`  
**Simulacros MSW propios:** `src/tests/handlers/catalogHandlers.js`, `src/tests/handlers/resultsHandlers.js`, `src/tests/handlers/reportsHandlers.js`

---

### Bloque C — Plataforma: autenticación, navegación y analítica
**Santiago** · 12 historias · 59 puntos

La infraestructura troncal del frontend: sistema de diseño, cliente HTTP de API con credenciales, arquitectura de navegación y enrutador (`vue-router`), gestión del ciclo de sesión con cookies OIDC, control de acceso por roles, visualización gráfica interactiva y el arnés de pruebas de interfaz.

| ID | Título | Backend | Pts | Prioridad |
| :--- | :--- | :--- | :---: | :--- |
| FE-02 | Sistema de diseño en CSS puro | — | 5 | Crítica *(Completado)* |
| FE-03 | Cliente de API centralizado | BE-40 | 5 | Crítica |
| FE-05 | Enrutado y layout base | BE-10 | 8 | Crítica |
| FE-06 | Pantalla de acceso con Google | BE-38, BE-39 | 3 | Crítica |
| FE-07 | Manejo de la sesión | BE-40 | 5 | Crítica |
| FE-08 | Pantalla de usuario pendiente | BE-41 | 3 | Alta |
| FE-09 | Interfaz adaptada al rol | BE-42 | 5 | Alta |
| FE-10 | Gestión de usuarios y roles | BE-43 | 5 | Alta |
| FE-30 | Componentes de gráfico | — | 5 | Media |
| FE-31 | Evolución individual | BE-31 | 5 | Alta |
| FE-33 | Proyección de evolución | BE-33 | 5 | Media |
| FE-39 | Batería de pruebas de interfaz | — | 5 | Alta |

**Vistas y carpetas propias:** `src/views/login/`, `src/views/pending/`, `src/views/users-admin/`, `src/views/dashboard/`  
**Layout y componentes propios:** `src/layout/` (`AppShell.vue`, `AppSidebar.vue`, `AppHeader.vue`), `src/components/charts/`, `src/components/domain/MetricCard.vue`  
**Servicios y composables propios:** `src/services/api.js`, `src/services/authService.js`, `src/services/usersService.js`, `src/composables/useAuth.js`, `src/composables/useFetch.js`, `src/composables/usePagination.js`  
**Enrutador y testing base:** `src/router/index.js`, `src/tests/setup.js`, `src/tests/handlers/authHandlers.js`, `src/tests/handlers.js`

---

## 3. Los cuatro contratos de las primeras 48 horas

La clave para que nadie se bloquee ni se pisen ficheros. **Cuatro piezas que se entregan de inmediato**, aunque tengan datos provisionales o mocks por dentro, para que cada persona construya sus pantallas contra una base firme.

### Contrato 1 — El cliente HTTP base (`src/services/api.js`) (Santiago, Día 1 mañana)

`FE-03` es el canal por el que viajan todas las peticiones:
- Función exportada: `request(endpoint, options = {})`.
- Configurado con `credentials: 'include'` (imprescindible para las cookies de sesión `HttpOnly`).
- Prefijo relativo `/api/v1` (enrutado por el proxy nginx/Vite sin CORS).
- Manejo uniforme de respuestas: `204` devuelve `null`, `401` redirige a login, `403` lanza `ForbiddenError` sin redirigir.
- Mapeo estandarizado de `ApiError` con campos `status`, `message` y `data`.

**Acuerdo:** Yeremi y Marlen **no tocan** `api.js`. Simplemente importan `request` en sus servicios (`studentsService.js`, `resultsService.js`, etc.). Santiago es el único dueño de este archivo.

### Contrato 2 — Enrutado base y cascarones de pantalla (`src/router/index.js` y `layout/`) (Santiago, Día 1 tarde)

`FE-05` toca la estructura global de navegación. **No se edita después a trozos.**
- Santiago instala `vue-router` y define todas las rutas de la aplicación con carga perezosa (`() => import(...)`).
- Monta los componentes cascarón mínimos (`<template><div>Pantalla X en construcción</div></template>`) en cada carpeta de `views/`.
- Monta el layout en `src/layout/` (`AppShell`, `AppSidebar`, `AppHeader`) con los enlaces principales y soporte de roles.
- Define la guarda global `router.beforeEach` que comprueba sesión con `useAuth`.

**Acuerdo:** Una vez subido este commit, **nadie más vuelve a editar `src/router/index.js`**. Cada persona trabaja exclusivamente dentro de los archivos de su carpeta en `views/<su-seccion>/`.

### Contrato 3 — Bloque de estados de pantalla (`src/components/ui/StateBlock.vue`) (Marlen, Día 1)

`FE-11` resuelve el estado visual de cualquier pantalla:
- Cuatro estados contemplados: `loading` (spinner/esqueleto), `empty` (sin datos + acción recomendada), `error` (mensaje + botón de reintentar) y `forbidden` (aviso de permiso insuficiente tras un 403).
- Props claras: `:state`, `:title`, `:message`, evento `@retry`.

**Acuerdo:** Marlen entrega este componente el primer día. Yeremi y Santiago lo importan inmediatamente en sus vistas para no dejar ninguna pantalla en blanco ante fallos o tiempos de carga.

### Contrato 4 — Utilidades de formato y validación (`src/utils/`) (Yeremi y Marlen, Día 1)

Funciones puras de JavaScript, sin estado y con pruebas unitarias:
- **`src/utils/format.js` (Yeremi):** `formatPPM(val)`, `formatVef(val)`, `formatDate(isoString)`, `formatPercent(val)`. Incluye el tratamiento de cifras tabulares y decimales.
- **`src/utils/validation.js` (Marlen):** `validateRequired(val)`, `validateRange(val, min, max)`, `isPlausibleReadingTime(seconds)` (detecta cuando un profesor introduce minutos en lugar de segundos).

**Acuerdo:** Se entregan el día 1. Evita que cada persona invente su propio formateo de fechas o su regex de validación, garantizando coherencia en toda la aplicación.

---

## 4. Plan de la primera semana

| Día | Marlen (A) | Yeremi (B) | Santiago (C) |
| :--- | :--- | :--- | :--- |
| **1 mañana** | **Sesión conjunta:** Contratos 1 a 4, acuerdo de rutas y árbol de MSW | | |
| **1 tarde** | **Contrato 3:** `StateBlock.vue`<br>**Contrato 4 (parte):** `validation.js` | **Contrato 4 (parte):** `format.js`<br>Pruebas unitarias de formato | **Contrato 1:** `api.js` centralizado<br>**Contrato 2:** `vue-router` + cascarones + layout |
| **2** | **FE-12:** Formularios con validación<br>**FE-25:** Vista centros y secciones (mock) | **FE-14 / FE-15 / FE-16:** Listado y alta de pruebas (`tests-catalog/`) | **FE-06:** Pantalla login Google<br>**FE-07:** `useAuth.js` y manejo de sesión |
| **3** | **FE-27:** Buscador de alumnos (`StudentSearch`)<br>**FE-26:** Ficha alumno (estructura inicial) | **FE-17:** Catálogo de libros (`books-catalog/`)<br>**FE-21:** Asignar libro | **FE-08:** Pantalla usuario pendiente<br>**FE-09:** Control de interfaz por rol |
| **4** | **FE-26:** Histórico y datos agregados en ficha<br>**FE-34:** Componente `LevelBadge` y bandas | **FE-18:** Registrar prueba individual<br>**FE-19:** Corregir/anular resultado | **FE-10:** Gestión de usuarios (`users-admin/`)<br>**FE-30:** Infraestructura de gráficos |
| **5** | **FE-23 / FE-24:** Pantalla e informe de importación Alexia | **FE-20:** Registro en lote (`bulk-entry/`, primera versión) | **FE-31:** Gráfico de evolución individual<br>**FE-39:** Setup base de Vitest + MSW |

Nadie se queda esperando:
- En la tarde del Día 1, mientras Santiago monta el enrutador y la API, Marlen y Yeremi producen los bloques de utilidad y estados que todos usarán al día siguiente.
- En los días 2 a 5, cada uno trabaja en sus vistas dentro de su propia carpeta, consumiendo sus propios servicios y simulacros de MSW.

---

## 5. Dependencias que quedan y cómo se sortean

| Quién espera | A quién | Cómo se evita el bloqueo |
| :--- | :--- | :--- |
| **Marlen y Yeremi** | **Santiago** (`api.js` base) | **Contrato 1:** Se entrega en la mañana del Día 1. Mientras tanto, se definen interfaces JSDoc de servicios. |
| **Marlen y Yeremi** | **Santiago** (Rutas y layout) | **Contrato 2:** Santiago sube los cascarones en la tarde del Día 1. Nadie necesita tocar `router/index.js` después. |
| **Yeremi y Santiago** | **Marlen** (`StateBlock`) | **Contrato 3:** Componente entregado el Día 1. Hasta entonces, un `<div>` provisional. |
| **Yeremi** (Registro) | **Marlen** (Lista de alumnos) | Yeremi usa un mock local con alumnos ficticios en `resultsHandlers.js` hasta que `studentsService` esté listo. |
| **Marlen** (Ficha alumno) | **Yeremi** (Resultados y lecturas) | Marlen maqueta las secciones de la ficha usando `testsService` y `resultsService` simulados; Yeremi solo le pasa la firma acordada. |
| **Santiago** (Gráficos) | **Yeremi y Marlen** (Datos de pruebas) | Santiago implementa los gráficos (`components/charts/`) con generadores de series numéricas puras sin depender de las pantallas finales. |
| **Todos** | **Backend** (Endpoints en desarrollo) | **Regla de oro:** Se utiliza la especificación OpenAPI (`BE-48`). Si el endpoint no existe en Docker, se simula con MSW. **Nadie para el desarrollo por esperar al backend.** |

---

## 6. Puntos de fricción en el repositorio

Ficheros y zonas calientes donde tres personas podrían provocar conflictos de fusión (*merge conflicts*).

| Fichero / Área | Riesgo | Acuerdo estricto |
| :--- | :--- | :--- |
| `src/router/index.js` | **El más peligroso.** Si los tres añaden rutas se rompe el historial. | **Santiago lo crea con todas las rutas el Día 1.** Rutas perezosas (`views/*/index.vue`). Nadie vuelve a editar este fichero sin avisar en la daily. |
| `src/layout/AppSidebar.vue` | Conflictos al añadir botones de navegación. | Se definen todos los ítems de navegación desde el inicio con directivas `v-if="hasRole(...)"`. |
| `package.json` y `package-lock.json` | Dependencias añadidas a la vez (`vue-router`, librería de gráficos, etc.). | Se instalan en la sesión conjunta del Día 1. **Prohibido instalar paquetes nuevos individualmente** sin comunicarlo al equipo. |
| `src/services/api.js` | Modificaciones simultáneas de interceptores o headers. | **Propiedad exclusiva de Santiago.** Si alguien requiere un cambio de cabecera o tratamiento de error, se le solicita a él. |
| `src/tests/handlers.js` | Conflictos al agregar respuestas simuladas de API. | **No usar un fichero único.** Se crea la carpeta `src/tests/handlers/` con `studentsHandlers.js` (Marlen), `catalogHandlers.js` (Yeremi), `authHandlers.js` (Santiago), y se agregan en `handlers.js` mediante spread (`...`). |
| `src/assets/styles/tokens.css` y `components.css` | Cambios de colores o clases comunes. | Las variables de diseño ya están fijadas (FE-02). Lo específico de cada pantalla va en su `<style scoped>`. Ninguna clase se promociona a `components.css` sin que la usen al menos dos pantallas distintas. |

---

## 7. Reglas para que el reparto funcione

1. **Nadie toca la carpeta de vistas de otro.**  
   Marlen es dueña de `views/centers/`, `views/student-detail/` e `views/import/`.  
   Yeremi es dueño de `views/tests-catalog/`, `views/books-catalog/`, `views/bulk-entry/` y `views/reports/`.  
   Santiago es dueño de `views/login/`, `views/pending/`, `views/users-admin/` y `views/dashboard/`.  
   Si necesitas incrustar un componente de otra persona, impórtalo; no modifiques su código interno.

2. **Los cuatro contratos son sagrados.**  
   Cualquier modificación en la firma de `request()`, en las rutas de `router/index.js` o en las propiedades de `StateBlock.vue` rompe el trabajo de los demás. No se tocan sin consenso en la reunión diaria.

3. **Ni un solo `fetch` fuera de `services/`.**  
   Todo acceso a datos pasa por `services/xxxService.js` y a través de `api.js`. Un componente con `fetch` directo será rechazado en la revisión de código.

4. **Desarrollo desacoplado con MSW.**  
   Si un endpoint del backend no está desplegado o devuelve error, se simula con MSW replicando la forma exacta del OpenAPI (`BE-48`). Al desplegar el backend real, la pantalla debe funcionar sin cambiar una sola línea del componente.

5. **Integración continua y PRs pequeñas.**  
   Hacer `git pull` de `dev` a diario antes de empezar la jornada. Subir ramas de vida corta (`feat/FE-xx-nombre`).  
   Antes de abrir cualquier PR, verificar localmente:
   ```bash
   npm run test
   npm run build
   ```
   Si el build falla, no se abre la PR.

6. **Revisión cruzada obligatoria.**  
   Nadie fusiona su propia PR. Se rota la revisión para asegurar que todo el equipo conoce la evolución del código global.

---

## 8. Equilibrio del reparto

| Persona | Bloque | Historias | Puntos | Reparto (%) |
| :--- | :--- | :---: | :---: | :---: |
| **Marlen** | **Bloque A:** Datos, alumnado y segmentación | 13 | 53 | 31,5% |
| **Yeremi** | **Bloque B:** El aula: catálogos, registro y salidas | 15 | 56 | 33,3% |
| **Santiago** | **Bloque C:** Plataforma, navegación y analítica | 12 | 59 | 35,1% |
| **Total** | | **40** | **168** | **100%** |

### Justificación del equilibrio

- **Yeremi (56 pts, 15 historias):** Mayor número de historias pero muy acotadas y directas (mantenimientos CRUD de pruebas y libros, lecturas, exportación a Excel e informes imprimibles). Incluye la historia clave del aula: el registro en lote (`FE-20`, 8 puntos).
- **Santiago (59 pts, 12 historias):** Menor número de historias pero con alto peso técnico estructural (cliente API, enrutado dinámico completo con guardas de rol, sesión con OIDC, motor de gráficos de evolución y suite de pruebas de interfaz).
- **Marlen (53 pts, 13 historias):** Historias con alta densidad de datos y reglas de negocio (importador de Alexia con reporte de incidencias, navegación jerárquica de centros/secciones, ficha agregada del alumno, filtros multicriterio, bandas de nivel y estados de pantalla transversales).

La diferencia máxima entre los tres miembros es de solo 6 puntos (entre 53 y 59 puntos), garantizando una carga perfectamente equitativa y autónoma para todo el equipo.

---

*Ver `guide/US/INDEX.md` para la lista completa de historias, `guide/structure.md` para la arquitectura de carpetas y `guide/workflow.md` para el flujo de trabajo de Git.*
