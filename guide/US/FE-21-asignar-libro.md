# Historia de Usuario

## ID
[FE-21]

## Título
Asignar un libro a un alumno

## Descripción
**Como** tutor
**Quiero** registrar que un alumno ha empezado un libro

**Para** llevar el control de sus lecturas.

## Criterios de Aceptación

### Escenario 1: Asignación correcta
```gherkin
Dado un tutor en la ficha de un alumno de su seccion
Cuando selecciona un libro del catalogo y una fecha de inicio
Entonces la lectura queda registrada
Y aparece en el listado de lecturas del alumno como en curso
```

### Escenario 2: Fecha de fin opcional
```gherkin
Dado el formulario de asignacion
Cuando se deja la fecha de fin vacia
Entonces la lectura se registra igualmente
Y queda marcada como en curso
```

### Escenario 3: Buscador de libros
```gherkin
Dado un catalogo de mas de cien titulos
Cuando el tutor escribe parte de un titulo en el selector
Entonces la lista se filtra mientras escribe
Y se muestra el nivel junto a cada titulo
```

### Escenario 4: Libro no disponible
```gherkin
Dado un libro dado de baja del catalogo
Cuando se busca en el selector
Entonces no aparece entre las opciones
```

### Escenario 5: Relectura
```gherkin
Dado un alumno que ya leyo ese libro el curso anterior
Cuando se le asigna de nuevo con otra fecha de inicio
Entonces se registra como una lectura nueva
Y ambas aparecen en su historial
```

## Notas
* **El escenario 3 no es un lujo.** Con más de cien títulos, un desplegable sin búsqueda hace la pantalla inutilizable.
* **El escenario 5 depende de una corrección del esquema original**, que impedía releer un libro. Un alumno puede volver a leer el mismo texto en otro curso y eso es información, no un error.
* **Diseño:** `.field` con selector con búsqueda, `.badge` para el nivel del libro.
* **Backend:** BE-23, BE-25.

## Estimación
3 Puntos de Historia (Formulario con selector filtrable)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE21-01 | **Servicio de lecturas** Alta con JSDoc. | - | Pendiente |
| T-FE21-02 | **Selector de libro con búsqueda** Mostrando el nivel. | - | Pendiente |
| T-FE21-03 | **Formulario de asignación** Fecha de fin opcional. | - | Pendiente |
| T-FE21-04 | **Pruebas** Escenarios 2, 4 y 5. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
