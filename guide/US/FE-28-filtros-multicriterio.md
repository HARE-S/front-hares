# Historia de Usuario

## ID
[FE-28]

## Título
Filtros multicriterio del alumnado

## Descripción
**Como** coordinador pedagógico
**Quiero** segmentar el alumnado por varios criterios

**Para** comparar la evolución entre perfiles distintos.

## Criterios de Aceptación

### Escenario 1: Filtros combinables
```gherkin
Dado el listado de alumnado
Cuando se aplican dos o mas filtros a la vez
Entonces los criterios se combinan
Y se indica cuantos alumnos cumplen la seleccion
```

### Escenario 2: Filtros reflejados en la URL
```gherkin
Dado un listado con filtros aplicados
Cuando se copia la direccion y se abre en otra pestaña
Entonces se reproducen los mismos filtros y resultados
```

### Escenario 3: Alumnos sin el dato informado
```gherkin
Dado alumnos cuyo sector no consta
Cuando se filtra por sector
Entonces esos alumnos se pueden ver agrupados como sin datos
Y NO desaparecen silenciosamente del conjunto
```

### Escenario 4: Limpiar filtros
```gherkin
Dado un conjunto de filtros que no devuelve resultados
Cuando se muestra el estado vacio
Entonces se ofrece un boton para limpiar todos los filtros
```

### Escenario 5: Ámbito del usuario
```gherkin
Dado un tutor con secciones asignadas
Cuando aplica cualquier filtro
Entonces los resultados se limitan a su alumnado
```

### Escenario 6: Criterios aún no disponibles
```gherkin
Dado que los campos de perfil no existen todavia en el volcado
Cuando se abre el panel de filtros
Entonces los filtros de centro y seccion funcionan
Y los de edad, genero, situacion academica y sector se indican como no disponibles
```

## Notas
* **BLOQUEADA en parte.** Los cuatro campos de perfil —edad, género, situación académica y sector— no existen en el volcado de Alexia. Se entrega la interfaz funcionando sobre centro y sección, preparada para los demás.
* **El escenario 3 es una decisión de honestidad estadística.** Ocultar sin avisar a los alumnos sin dato haría que una media pareciera calculada sobre todo el grupo cuando no lo está.
* **Diseño:** panel de filtros en `.card`, con `.segmented` y `.select`.
* **Backend:** BE-27.

## Estimación
5 Puntos de Historia (Panel de filtros con sincronización de URL)

## Prioridad
Alta — parcialmente bloqueada

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE28-01 | **Panel de filtros** Estructura preparada para los seis criterios. | - | Pendiente |
| T-FE28-02 | **Filtros de centro y sección** Parte entregable ya. | - | Pendiente |
| T-FE28-03 | **Sincronización con la URL** | - | Pendiente |
| T-FE28-04 | **Agrupación sin datos** | - | Pendiente |
| T-FE28-05 | **Filtros de perfil** Pendientes de que el cliente amplíe el volcado. | - | Bloqueado |
| T-FE28-06 | **Pruebas** Escenarios 1, 2 y 5. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
