# Backlog — Frontend

**HARE-S** · Programa de Gestión de Mejora de Comprensión Lectora (Peñascal)
Equipo: Marlen Álvarez, Santiago Patiño, Yeremi Peralta · Coordinación: Andrés Ocina
**Stack: Vue 3 + Vite + JavaScript + CSS puro + Vitest**
40 historias · 168 puntos · Actualizado: 15/09/2026

> Historias de interfaz. Las de servidor están en `back-hares/guide/US/INDEX.md`.
> La columna **Backend** indica de qué historia del servidor depende cada una.

---

## Cómo leer este documento

| Marca | Significado |
|---|---|
| ⏳ | Depende de un endpoint aún no disponible — se avanza con MSW |
| 🔒 | Bloqueada por una decisión del cliente o del equipo |
| ✅ | Terminada |

---

## Lo que el backend garantiza

Tres compromisos que la interfaz da por ciertos. Si cambian, se avisa antes de fusionar:

- **Toda la API cuelga de `/api/v1`.** Ruta relativa, mismo origen, sin CORS.
- **La sesión viaja en cookie `HttpOnly`.** El frontend **nunca ve ni maneja un token**.
- **Sin sesión se devuelve `401`, nunca una redirección.** Es la interfaz quien decide qué hacer.

---

## EP-F1 — Base del proyecto

### FE-01 — Andamiaje del proyecto ✅
**Como** desarrollador **quiero** el proyecto configurado **para** poder construir pantallas.

- Vue 3 + Vite, compilación a estáticos servibles desde nginx.
- Estructura de `guide/structure.md`.
- Vitest configurado con jsdom.

**Puntos:** 5 · **Crítica** · **Terminada**

---

### FE-02 — Sistema de diseño en CSS ✅
**Como** desarrollador **quiero** un sistema de diseño en variables CSS **para** que toda la interfaz sea coherente sin depender de un framework de estilos.

- `tokens.css` con colores, tipografía, espaciado, radios y sombras.
- `base.css` con reset, rejilla, responsive e impresión.
- `components.css` con botones, tarjetas, métricas, distintivos, tablas y formularios.
- Bandas de nivel sobre **velocidad eficaz**: `>85`, `25-85`, `<25`, más ausencia de dato.
- Cifras tabulares activadas en tablas y métricas.

**Notas:** el `badge--nodata` no estaba en el diseño original y es imprescindible. Si un alumno sin prueba se pinta igual que uno con velocidad eficaz baja, el coordinador intervendrá sobre quien no lo necesita.
**Puntos:** 5 · **Crítica** · **Terminada**

---

### FE-03 — Cliente de API centralizado
**Como** desarrollador **quiero** un único punto de contacto con la API **para** manejar sesión y errores en un solo sitio.

- **Ni un `fetch` suelto en un componente.** Todo pasa por `services/`.
- Todas las peticiones con **`credentials: 'include'`**.
- `401` → redirección al login. `403` → error de permiso, **sin redirigir**.
- `204` devuelve `null` sin intentar parsear JSON.
- Errores con forma estable, mostrables sin adivinar.
- **Se elimina la cabecera `X-User-Role`** en cuanto exista la sesión de servidor.

**Notas:** sin `credentials: 'include'` la cookie no viaja y todo devuelve `401` tras un login aparentemente correcto. Es el fallo silencioso más habitual con sesiones en cookie.
**Backend:** BE-40
**Puntos:** 5 · **Crítica**

---

### FE-04 — Dockerización y proxy ✅
**Como** usuario **quiero** acceder por una única URL **para** no conocer puertos ni servicios.

- `Dockerfile` multietapa: Node compila, nginx sirve. Sin `node_modules` en la imagen final.
- `try_files` para que recargar en una ruta profunda devuelva `200`.
- `index.html` sin caché; `assets/` cacheado.
- Proxy enrutando `/api` al backend y el resto al frontend.

**Puntos:** 5 · **Alta** · **Terminada**

---

### FE-05 — Enrutado y layout base
**Como** usuario **quiero** una navegación clara **para** encontrar lo que busco sin aprenderme la herramienta.

- `vue-router` instalado y configurado.
- `AppShell`, `AppSidebar` y `AppHeader` según el sistema de diseño.
- Navegación entre Alumnado, Pruebas, Libros, Informes y Administración.
- **La ruta actual se refleja en la URL y es recargable.**
- Migas de pan: centro → sección → alumno.
- Guarda de navegación que redirige al login sin sesión.

**Puntos:** 8 · **Crítica**

---

## EP-F2 — Autenticación e identidad

### FE-06 — Pantalla de acceso ⏳
- Un único botón de entrada con Google.
- Estado de carga durante el flujo.
- Cuenta ajena al dominio: mensaje claro de que no está autorizada, no un error genérico.

**Backend:** BE-38, BE-39
**Puntos:** 3 · **Crítica**

---

### FE-07 — Manejo de sesión ⏳
- El estado del usuario vive en `useAuth`, en memoria, **nunca en `localStorage`**.
- Al cargar se pregunta al backend con `GET /api/v1/auth/me`.
- Al caducar: se llega al login **sin pantalla rota y sin perder lo tecleado**.
- Cierre de sesión visible, con nombre y correo de la persona conectada.

**Notas:** no hay token que guardar. Si aparece código leyendo un token de `localStorage`, se ha colado un patrón de otro proyecto.
**Backend:** BE-40
**Puntos:** 5 · **Crítica**

---

### FE-08 — Pantalla de usuario pendiente ⏳
- Un usuario con rol `pending` ve una pantalla explicando que espera asignación de permisos.
- **No ve ningún dato de alumnado.**
- Los administradores ven aviso de usuarios pendientes.

**Backend:** BE-41
**Puntos:** 3 · **Alta**

---

### FE-09 — Interfaz según rol ⏳
- Cada rol ve solo las acciones que le corresponden.
- Un tutor solo ve sus secciones asignadas.
- Un `403` del servidor muestra permiso insuficiente, **sin bucle de login**.

**Notas:** ocultar un botón no protege nada; el backend rechaza igualmente. La interfaz oculta para no confundir, no para asegurar.
**Backend:** BE-42
**Puntos:** 5 · **Alta**

---

### FE-10 — Gestión de usuarios ⏳
- Listado con rol y último acceso.
- Cambio de rol y asignación de secciones.
- Confirmación explícita al cambiar un rol.

**Backend:** BE-43
**Puntos:** 5 · **Alta**

---

## EP-F3 — Transversales

### FE-11 — Estados de pantalla
**Como** usuario **quiero** entender qué ocurre cuando no hay datos o algo falla **para** no quedarme ante una pantalla en blanco.

- Componente `StateBlock` con cuatro estados: cargando, vacío, error y sin permiso.
- El estado vacío explica qué hacer, no solo que no hay nada.
- Los errores ofrecen reintentar cuando tenga sentido.
- Esqueletos de carga en tablas y tarjetas de métrica.

**Notas:** una pantalla que solo contempla el caso feliz parece terminada en la demostración y se rompe el primer día de uso real.
**Puntos:** 3 · **Alta**

---

### FE-12 — Formularios con validación
- Campos obligatorios y rangos numéricos validados antes del envío.
- Errores del servidor mostrados **junto al campo correspondiente**.
- **Al fallar el envío no se pierden los datos introducidos.**
- Aviso cuando un valor es plausible pero sospechoso (tiempo introducido en minutos).

**Notas:** el aviso de valores sospechosos evita repetir el caso de los informes de ORI, con velocidades eficaces de 2.050 que contaminaron las medias de un ámbito entero.
**Puntos:** 5 · **Alta**

---

### FE-13 — Uso en tableta
- Las pantallas de registro son usables en pantalla pequeña.
- Los campos numéricos abren teclado numérico.
- **La tabla de registro en lote se usa sin desplazamiento horizontal.**

**Puntos:** 5 · **Baja**

---

## EP-F4 — Catálogos

### FE-14 — Alta de prueba ⏳
- Formulario con código, nombre, palabras, curso, letra y tipo.
- Código duplicado: mensaje claro, no un error técnico.
- Letra y tipo como desplegables cerrados: `I, A, B, C, D, E` y `F, L`.

**Backend:** BE-11
**Puntos:** 3 · **Alta**

---

### FE-15 — Edición y baja de pruebas ⏳
- Edición desde el listado.
- **El código aparece bloqueado si la prueba ya tiene resultados.**
- La baja pide confirmación y explica que el histórico se conserva.

**Backend:** BE-13
**Puntos:** 3 · **Media**

---

### FE-16 — Listado de pruebas ⏳
- Paginación y buscador por código o nombre.
- Filtros por curso, letra y tipo.
- Los filtros se reflejan en la URL para poder compartir la consulta.

**Backend:** BE-14
**Puntos:** 3 · **Media**

---

### FE-17 — Catálogo de libros ⏳
- Listado con título y nivel; alta, edición y baja.
- **Los niveles se muestran como `0`, `0-I`, `I`, `II`, `I/II`**, en su orden pedagógico.

**Backend:** BE-16
**Puntos:** 3 · **Alta**

---

## EP-F5 — Registro de datos

### FE-18 — Registrar una prueba ⏳
- Selección de prueba, fecha, tiempo, aciertos y errores.
- Validación antes de enviar: nada negativo, suma no mayor que 20.
- **Muestra PPM, comprensión y velocidad eficaz tras guardar**, para que el tutor vea el resultado al momento.

**Backend:** BE-18
**Puntos:** 5 · **Crítica**

---

### FE-19 — Corregir un resultado ⏳
- Edición desde el histórico del alumno.
- La eliminación pide confirmación.

**Backend:** BE-21
**Puntos:** 3 · **Alta**

---

### FE-20 — Registro en lote ⏳
**Como** tutor **quiero** introducir de una vez los resultados de todo el grupo **para** no repetir veinte veces el mismo formulario.

- Se elige prueba y fecha, y aparece la lista de alumnos del grupo.
- Tiempo, aciertos y errores por fila.
- **Se pueden dejar alumnos en blanco** (ausentes) sin que se registren.
- Si una fila falla, se señala **sin perder lo tecleado en el resto**.
- Navegación entre celdas con teclado.

**Notas:** es la pantalla que más uso real va a tener. La de ORI tenía exactamente esta forma. Merece más cuidado que ninguna otra.
**Backend:** BE-22
**Puntos:** 8 · **Alta**

---

### FE-21 — Asignar un libro ⏳
- Selector de libro del catálogo y fecha de inicio.
- Fecha de fin opcional.

**Backend:** BE-23
**Puntos:** 3 · **Alta**

---

### FE-22 — Cerrar una lectura ⏳
- Marcar fecha de fin desde el listado.
- Distingue visualmente lecturas en curso de finalizadas.

**Backend:** BE-24
**Puntos:** 2 · **Alta**

---

### FE-23 — Pantalla de importación ⏳
- Selector de fichero con validación de extensión y tamaño.
- **Previsualización de las primeras filas antes de confirmar.**
- Progreso y resumen final: creados, actualizados, omitidos, errores.

**Backend:** BE-09
**Puntos:** 5 · **Alta**

---

### FE-24 — Informe de errores de importación ⏳
- Los errores se muestran con línea, columna y motivo, en tabla legible.
- Informe descargable.

**Backend:** BE-08
**Puntos:** 3 · **Media**

---

## EP-F6 — Consulta

### FE-25 — Navegación por centros y secciones ⏳
- Listado de centros, sus secciones y el alumnado de cada una.
- Acceso directo a la ficha desde el listado.

**Backend:** BE-10
**Puntos:** 3 · **Alta**

---

### FE-26 — Ficha del alumno ⏳
**Como** tutor **quiero** una vista única con todo lo del alumno **para** preparar una tutoría sin navegar por cinco pantallas.

- Datos personales, secciones actuales e históricas.
- Histórico de pruebas con PPM, comprensión y velocidad eficaz.
- Lecturas con su estado.
- Gráfico de evolución integrado.

**Backend:** BE-28
**Puntos:** 5 · **Alta**

---

### FE-27 — Buscador de alumnos ⏳
- Busca al escribir, insensible a mayúsculas y acentos.
- Muestra centro y sección junto a cada coincidencia, para desambiguar homónimos.

**Backend:** BE-29
**Puntos:** 3 · **Media**

---

### FE-28 — Filtros multicriterio 🔒 ⏳
- Filtros combinables por edad, género, situación académica, sector, centro y sección.
- Se reflejan en la URL.
- Los alumnos sin dato aparecen como "sin datos", no ocultos.

**Notas — BLOQUEADA:** los cuatro campos de perfil no existen en el volcado de Alexia. Entregar la interfaz funcionando sobre centro y sección, preparada para los demás.
**Backend:** BE-27
**Puntos:** 5 · **Alta**

---

### FE-29 — Historial por sección ⏳
- Todas las pruebas de un grupo, agrupables por prueba.
- Acotable por rango de fechas.
- Tras un registro en lote, permite comprobar de un vistazo que se guardó todo.

**Backend:** BE-51
**Puntos:** 3 · **Media**

---

## EP-F7 — Visualización

### FE-30 — Gráficos
- Líneas para evolución temporal, barras para comparativas.
- **Ejes rotulados con sus unidades.**
- Descargables como imagen.
- Legibles sin depender solo del color.

**Puntos:** 5 · **Media**

---

### FE-31 — Evolución individual ⏳
- Serie de velocidad eficaz por prueba, con la media del par funcional y literario.
- **Diferencia F − L visible**: cuánto le cuesta el texto funcional frente al literario.
- Acotable por rango de fechas.
- **Con menos de 2 pruebas: mensaje explicativo, no un gráfico vacío.**

**Backend:** BE-31
**Puntos:** 5 · **Alta**

---

### FE-32 — Comparativa por grupos ⏳
- Selección de dos o más grupos en el mismo gráfico.
- **Muestra el tamaño (n) junto a cada media.**
- Advierte visualmente de los grupos poco representativos.

**Notas:** una media sin el tamaño de la muestra invita a conclusiones falsas: dos alumnos pueden dar una media espectacular que no significa nada.
**Backend:** BE-32
**Puntos:** 5 · **Media**

---

### FE-33 — Proyección ⏳
- La proyección se distingue visualmente del dato real.
- **Indica en cuántas pruebas se basa.**
- Con menos de 3 pruebas se explica por qué no se muestra.

**Notas:** presentar una estimación con el mismo aspecto que un dato medido induce a tomarla por cierta. La distinción no es decorativa.
**Backend:** BE-33
**Puntos:** 5 · **Media**

---

### FE-34 — Clasificación por nivel lector ⏳
- Distintivo de banda en cada resultado: `>85` alto, `25-85` normal, `<25` bajo.
- **Ausencia de dato con su propio distintivo**, nunca el de banda baja.
- Distribución por banda en la vista de grupo, con recuento y porcentaje.

**Notas:** los umbrales son los de los informes del cliente, no los de la batería de Bruño. Su población lee muy por debajo del estándar ESO.
**Backend:** BE-30, `reading_levels`
**Puntos:** 5 · **Alta**

---

### FE-35 — Aviso de alumnos sin progreso ⏳
- Listado destacado en la pantalla de coordinación.
- **Distingue "sin datos suficientes" de "sin progreso".**

**Backend:** BE-34
**Puntos:** 3 · **Baja**

---

## EP-F8 — Salidas

### FE-36 — Exportación a Excel ⏳
- Botón de exportación allí donde hay filtros.
- **Exporta lo que se está viendo**, con los filtros aplicados.
- Indicador de progreso y descarga.

**Backend:** BE-35
**Puntos:** 3 · **Alta**

---

### FE-37 — Informe de alumno ⏳
- Vista imprimible con datos, histórico, lecturas y gráfico.
- **Formato A4 al imprimir**, sin elementos de navegación.
- Fecha de generación visible.

**Backend:** BE-36
**Puntos:** 5 · **Media**

---

### FE-38 — Informe de grupo ⏳
- Medias, número de pruebas y participantes.
- **Distribución de resultados, no solo la media.**
- Exportable.

**Backend:** BE-37
**Puntos:** 5 · **Media**

---

## EP-F9 — Calidad

### FE-39 — Pruebas de interfaz
- `401` redirige al login; `403` **no** redirige.
- Al fallar el envío no se pierde lo tecleado.
- Validación del registro en lote.
- Formateo de velocidad eficaz y fechas.
- Valores frontera de las bandas: exactamente 25 y 85, y negativos.
- **Simulación a nivel de red (MSW), no sustituyendo los servicios.**

**Notas:** si se sustituyen los servicios, se deja sin probar el manejo del `401`, que es lo más importante de esta capa.
**Puntos:** 5 · **Alta**

---

### FE-40 — Manual de usuario
- Flujos principales con capturas.
- En castellano, sin jerga técnica.

**Puntos:** 3 · **Media**

---

## Planificación

| Sprint | Historias | Objetivo demostrable |
|---|---|---|
| **1 — Base** ✅ | FE-01, FE-02, FE-04 | El proyecto compila y se sirve tras el proxy |
| **2 — Estructura** | FE-03, FE-05, FE-11 | Se navega entre pantallas con estados completos |
| **3 — Identidad** | FE-06 a FE-10 | Se entra con cuenta corporativa y la sesión se maneja bien |
| **4 — Catálogos** | FE-12, FE-14 a FE-17 | Pruebas y libros gestionables según rol |
| **5 — Registro** | FE-18 a FE-23 | El tutor registra resultados y lecturas |
| **6 — Consulta** | FE-25, FE-26, FE-27, FE-29 | Ficha del alumno e historial de grupo |
| **7 — Análisis** | FE-30 a FE-34, FE-28 | Evolución, bandas y comparativas |
| **8 — Cierre** | FE-35 a FE-40, FE-13, FE-24 | Informes, exportación y documentación |

---

## Dependencias del backend

Se puede avanzar con MSW, pero estas historias necesitan el endpoint real **antes de darse por terminadas**:

| Frontend | Espera a |
|---|---|
| Todas | **BE-48 (OpenAPI)**: es la fuente de las formas de datos |
| FE-03, FE-07 | BE-40: sesión y `401` |
| FE-06 | BE-38, BE-39: login y restricción de dominio |
| FE-09, FE-10 | BE-42, BE-43: permisos y gestión de usuarios |
| FE-20 | BE-22: endpoint de lote |
| FE-26 | BE-28: ficha agregada |
| FE-31 a FE-34 | BE-30 a BE-34: métricas, evolución, proyección, bandas |
| FE-36 a FE-38 | BE-35 a BE-37: exportación e informes |

**Regla de trabajo:** se acuerda la forma del endpoint, se escribe el JSDoc, se simula con MSW y se desarrolla. Cuando llegue el endpoint real, quitar el simulacro debe bastar. Si hay que cambiar código de la interfaz, la forma acordada no era la implementada — y esa conversación sale más barata al principio.

---

## Riesgos abiertos

| # | Riesgo | Impacto | Acción |
|---|---|---|---|
| 1 | Logo en SVG sin entregar | Barra lateral, favicon, informes | Pedirlo o vectorizarlo |
| 2 | MSW y testing-library sin instalar | Bloquea la estrategia de pruebas | `npm i -D` |
| 3 | `vue-router` sin instalar | Bloquea FE-05 y todo lo posterior | `npm i vue-router` |
| 4 | Sin TypeScript, los desajustes de contrato no se detectan en compilación | Fallos en tiempo de ejecución | JSDoc en servicios y simulacros fieles |
| 5 | Campos de filtrado inexistentes en Alexia | FE-28 incompleta | Depende del cliente |
| 6 | Navegador y dispositivos del centro sin confirmar | Puede invalidar FE-13 | Preguntar qué usan los tutores en el aula |
| 7 | ¿Hará falta euskera? | Afecta a la arquitectura de textos | Centralizar los textos desde el principio |
| 8 | Sin dominio ni certificado TLS | Sin HTTPS la cookie `Secure` no viaja y el login no funciona | Cliente |

---

*Ver `guide/structure.md`, `guide/testing.md`, `guide/deployment.md` y `guide/workflow.md` · Servidor en `back-hares/guide/US/INDEX.md`*
