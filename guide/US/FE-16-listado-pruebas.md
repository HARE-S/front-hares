# Historia de Usuario

## ID
[FE-16]

## Título
Listado paginado y filtrado de pruebas

## Descripción
**Como** tutor
**Quiero** buscar una prueba por código, nombre, curso o tipo

**Para** encontrarla rápido cuando voy a registrar un resultado.

## Criterios de Aceptación

### Escenario 1: Listado paginado
```gherkin
Dado un catalogo de 34 pruebas
Cuando se abre el listado
Entonces se muestran las primeras 10
Y el paginador indica el total de elementos y de paginas
```

### Escenario 2: Búsqueda por texto
```gherkin
Dado el listado de pruebas
Cuando el usuario escribe parte de un nombre
Entonces la lista se filtra mientras escribe
Y la busqueda es insensible a mayusculas y acentos
```

### Escenario 3: Filtros combinados
```gherkin
Dado el listado de pruebas
Cuando se filtra por curso 2 y tipo Funcional
Entonces solo se muestran las pruebas que cumplen ambos criterios
```

### Escenario 4: Los filtros se comparten
```gherkin
Dado un listado con filtros aplicados
Cuando el usuario copia la direccion del navegador
Y la abre en otra pestaña
Entonces se muestran los mismos filtros y resultados
```

### Escenario 5: Sin resultados
```gherkin
Dado unos filtros que no devuelven ninguna prueba
Cuando se muestra el resultado
Entonces aparece el estado vacio
Y se ofrece limpiar los filtros
```

## Notas
* **El escenario 4 es lo que permite compartir por correo un listado filtrado.** Si el estado solo vive en memoria, el enlace no sirve de nada.
* **Insensible a acentos:** el profesorado no va a teclear tildes al buscar.
* **Diseño:** `.table`, `.input`, `.segmented` para el filtro de tipo, `.badge--functional` y `.badge--literary`.
* **Backend:** BE-14.

## Estimación
3 Puntos de Historia (Listado con filtros sincronizados con la URL)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE16-01 | **Composable usePagination** Reutilizable por otros listados. | Yeremi | Completado |
| T-FE16-02 | **Barra de filtros** Texto, curso, letra y tipo. | Yeremi | Completado |
| T-FE16-03 | **Sincronización con la URL** Filtros como parámetros de consulta. | Yeremi | Completado |
| T-FE16-04 | **Estado vacío con limpieza de filtros** | Yeremi | Completado |
| T-FE16-05 | **Pruebas** Escenarios 3, 4 y 5. | Yeremi | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
