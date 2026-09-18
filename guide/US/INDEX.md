# Índice de Historias de Usuario — Frontend

**HARE-S** · Programa de Gestión de Mejora de Comprensión Lectora (Peñascal)
Equipo: Marlen Álvarez, Santiago Patiño, Yeremi Peralta · Coordinación: Andrés Ocina
**Stack:** Vue 3 + Vite + JavaScript + CSS puro + Vitest
40 historias · 168 puntos · Actualizado: 18/09/2026
**Reparto entre el equipo:** ver [REPARTO.md](REPARTO.md)

---

## Convenciones

- **IDs:** `FE-01` a `FE-40`, numeración consecutiva propia del frontend.
- **Tareas:** `T-FE<historia>-<n>`, por ejemplo `T-FE20-03`.
- **Estados:** Pendiente · En curso · En revisión · Completado · Bloqueado
- Una historia nueva se crea a partir de `_PLANTILLA.md` y se añade a este índice.
- La columna **Backend** indica de qué historia del servidor depende.

---

## Listado completo

| ID | Título | Backend | Pts | Prioridad | Estado |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Base del proyecto** | | | | | |
| [FE-01](FE-01-andamiaje-proyecto.md) | Andamiaje del proyecto | — | 5 | Crítica | **Completado** |
| [FE-02](FE-02-sistema-diseno.md) | Sistema de diseño en CSS puro | — | 5 | Crítica | **Completado** |
| [FE-03](FE-03-cliente-api.md) | Cliente de API centralizado | BE-40 | 5 | Crítica | Pendiente |
| [FE-04](FE-04-dockerizacion-proxy.md) | Dockerización y proxy | — | 5 | Alta | **Completado** |
| [FE-05](FE-05-enrutado-layout.md) | Enrutado y estructura de navegación | BE-10 | 8 | Crítica | Pendiente |
| **Autenticación e identidad** | | | | | |
| [FE-06](FE-06-pantalla-acceso.md) | Pantalla de acceso con Google | BE-38, BE-39 | 3 | Crítica | Pendiente |
| [FE-07](FE-07-manejo-sesion.md) | Manejo de la sesión | BE-40 | 5 | Crítica | Pendiente |
| [FE-08](FE-08-usuario-pendiente.md) | Pantalla de usuario pendiente | BE-41 | 3 | Alta | Pendiente |
| [FE-09](FE-09-interfaz-segun-rol.md) | Interfaz adaptada al rol | BE-42 | 5 | Alta | Pendiente |
| [FE-10](FE-10-gestion-usuarios.md) | Gestión de usuarios y roles | BE-43 | 5 | Alta | Pendiente |
| **Transversales** | | | | | |
| [FE-11](FE-11-estados-pantalla.md) | Estados de pantalla | — | 3 | Alta | **Completado** |
| [FE-12](FE-12-formularios-validacion.md) | Formularios con validación | — | 5 | Alta | **En revisión** |
| [FE-13](FE-13-uso-tableta.md) | Uso en tableta | — | 5 | Baja | Pendiente |
| **Catálogos** | | | | | |
| [FE-14](FE-14-alta-prueba.md) | Alta de prueba | BE-11 | 3 | Alta | Pendiente |
| [FE-15](FE-15-edicion-baja-pruebas.md) | Edición y baja de pruebas | BE-13 | 3 | Media | Pendiente |
| [FE-16](FE-16-listado-pruebas.md) | Listado paginado de pruebas | BE-14 | 3 | Media | Pendiente |
| [FE-17](FE-17-catalogo-libros.md) | Catálogo de libros | BE-16, BE-17 | 3 | Alta | Pendiente |
| **Registro de datos** | | | | | |
| [FE-18](FE-18-registrar-prueba.md) | Registrar el resultado de una prueba | BE-18 | 5 | **Crítica** | Pendiente |
| [FE-19](FE-19-corregir-resultado.md) | Corregir o anular un resultado | BE-21 | 3 | Alta | **Completado** |
| [FE-20](FE-20-registro-lote.md) | Registro de resultados en lote | BE-22 | 8 | Alta | **Completado** |
| [FE-21](FE-21-asignar-libro.md) | Asignar un libro | BE-23, BE-25 | 3 | Alta | **Completado** |
| [FE-22](FE-22-cerrar-lectura.md) | Cerrar una lectura | BE-24 | 2 | Alta | **Completado** |
| [FE-23](FE-23-pantalla-importacion.md) | Pantalla de importación | BE-09 | 5 | Alta | **En revisión** |
| [FE-24](FE-24-informe-errores-importacion.md) | Informe de errores de importación | BE-08 | 3 | Media | **En revisión** |
| **Consulta** | | | | | |
| [FE-25](FE-25-navegacion-centros-secciones.md) | Navegación por centros y secciones | BE-10 | 3 | Alta | Pendiente |
| [FE-26](FE-26-ficha-alumno.md) | Ficha del alumno | BE-28 | 5 | Alta | Pendiente |
| [FE-27](FE-27-buscador-alumnos.md) | Buscador de alumnos | BE-29 | 3 | Media | Pendiente |
| [FE-28](FE-28-filtros-multicriterio.md) | Filtros multicriterio | BE-27 | 5 | Alta | **Bloqueada** |
| [FE-29](FE-29-historial-por-seccion.md) | Historial por sección | BE-51 | 3 | Media | **Completado** |
| **Visualización** | | | | | |
| [FE-30](FE-30-graficos.md) | Componentes de gráfico | — | 5 | Media | Pendiente |
| [FE-31](FE-31-evolucion-individual.md) | Evolución individual | BE-31 | 5 | Alta | Pendiente |
| [FE-32](FE-32-comparativa-grupos.md) | Comparativa por grupos | BE-32 | 5 | Media | Pendiente |
| [FE-33](FE-33-proyeccion.md) | Proyección de evolución | BE-33 | 5 | Media | Pendiente |
| [FE-34](FE-34-clasificacion-nivel.md) | Clasificación por nivel lector | BE-30 | 5 | Alta | Pendiente |
| [FE-35](FE-35-alumnos-sin-progreso.md) | Aviso de alumnos sin progreso | BE-34 | 3 | Baja | Pendiente |
| **Salidas** | | | | | |
| [FE-36](FE-36-exportacion-excel.md) | Exportación a Excel | BE-35 | 3 | Alta | **Completado** |
| [FE-37](FE-37-informe-alumno.md) | Informe individual imprimible | BE-36 | 5 | Media | **Completado** |
| [FE-38](FE-38-informe-grupo.md) | Informe agregado de grupo | BE-37 | 5 | Media | **Completado** |
| **Calidad** | | | | | |
| [FE-39](FE-39-pruebas-interfaz.md) | Batería de pruebas de interfaz | — | 5 | Alta | Pendiente |
| [FE-40](FE-40-manual-usuario.md) | Manual de usuario | — | 3 | Media | Pendiente |
| | **Total** | | **168** | | **5 de 40** |

---

## Planificación por sprints

| Sprint | Historias | Puntos | Objetivo demostrable |
| :--- | :--- | :---: | :--- |
| **1 — Base** ✅ | FE-01, FE-02, FE-04 | 15 | El proyecto compila y se sirve tras el proxy |
| **2 — Estructura** | FE-03, FE-05, FE-11 | 16 | Se navega entre pantallas con estados completos |
| **3 — Identidad** | FE-06 a FE-10 | 21 | Se entra con cuenta corporativa y la sesión se maneja bien |
| **4 — Catálogos** | FE-12, FE-14 a FE-17 | 17 | Pruebas y libros gestionables según rol |
| **5 — Registro** | FE-18 a FE-22 | 21 | El tutor registra resultados y lecturas |
| **6 — Consulta** | FE-25, FE-26, FE-27, FE-29 | 14 | Ficha del alumno e historial de grupo |
| **7 — Análisis** | FE-28, FE-30 a FE-34 | 30 | Evolución, bandas y comparativas |
| **8 — Cierre** | FE-13, FE-23, FE-24, FE-35 a FE-40 | 34 | Importación, informes y documentación |

---

## Historias que encapsulan reglas del dominio

Cinco historias contienen decisiones que no son de interfaz sino del programa lector, y que no se deben cambiar sin hablar con pedagogía:

| Historia | Regla |
| :--- | :--- |
| **FE-34** | Ausencia de dato **nunca** se pinta como banda baja. Un alumno sin prueba no es un alumno que va mal |
| **FE-20** | Dejar una fila en blanco significa **ausente**, no cero. Registrar ceros falsea las medias del grupo |
| **FE-31** | Un par incompleto no se promedia con un cero. La hoja del centro sí lo hace y por eso sus medias salen a la mitad |
| **FE-32** | El progreso de un grupo es **cuántos alumnos mejoran**, no la media de las diferencias |
| **FE-33** | Una proyección se distingue visualmente de un dato medido. Si no, se toma por cierta |

---

## Dependencias bloqueantes

| Bloqueo | Afecta a | Quién lo resuelve |
| :--- | :--- | :--- |
| `vue-router` sin instalar | FE-05 y todo lo posterior | Equipo |
| `msw` y `@testing-library/vue` sin instalar | FE-39 y las pruebas de toda historia | Equipo |
| Logo en SVG sin entregar | FE-02, FE-05, FE-37 | Equipo / cliente |
| **BE-48 (OpenAPI)** | Todas: es la fuente de las formas de datos | Backend |
| Acceso a Google Cloud | FE-06 en su flujo real | Cliente |
| Campos de perfil ausentes en Alexia | FE-28 | Cliente |
| Sin dominio ni certificado TLS | La cookie `Secure` no viaja sin HTTPS | Cliente |
| Librería de gráficos sin elegir | FE-30 a FE-33 | Equipo |
| Dispositivos del aula sin confirmar | FE-13 | Cliente |

---

*Ver `guide/structure.md`, `guide/testing.md`, `guide/deployment.md` y `guide/workflow.md` · Servidor en `back-hares/guide/US/INDEX.md`*
