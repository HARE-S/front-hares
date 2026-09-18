# Historia de Usuario

## ID
[FE-15]

## Título
Edición y baja de pruebas

## Descripción
**Como** coordinador pedagógico
**Quiero** corregir o retirar una prueba del catálogo

**Para** mantenerlo al día sin perder el histórico.

## Criterios de Aceptación

### Escenario 1: Edición desde el listado
```gherkin
Dado una prueba en el catalogo
Cuando el coordinador pulsa editar
Entonces se abre el formulario con los valores actuales
Y al guardar se reflejan los cambios en el listado
```

### Escenario 2: Código bloqueado si hay resultados
```gherkin
Dado una prueba que ya tiene resultados de alumnos
Cuando se abre su formulario de edicion
Entonces el campo codigo aparece deshabilitado
Y se explica que no puede cambiarse porque hay resultados asociados
```

### Escenario 3: Baja lógica con confirmación
```gherkin
Dado una prueba activa
Cuando el coordinador pulsa dar de baja
Entonces se pide confirmacion
Y se explica que el historico de resultados se conserva
```

### Escenario 4: Las deshabilitadas desaparecen del listado
```gherkin
Dado una prueba dada de baja
Cuando se consulta el catalogo
Entonces no aparece en el listado por defecto
Y aparece al activar la opcion de mostrar deshabilitadas
```

### Escenario 5: El histórico sigue siendo legible
```gherkin
Dado un alumno con resultados de una prueba dada de baja
Cuando se consulta su historial
Entonces esos resultados siguen mostrandose con el nombre de la prueba
Y se indica que la prueba esta deshabilitada
```

## Notas
* **El escenario 2 protege el sentido del histórico.** El código es el identificador funcional para el profesorado; cambiarlo cuando ya tiene resultados haría que el histórico quedara atribuido a un texto que ya no se llama así.
* **El escenario 3 explica la consecuencia antes de actuar.** «Dar de baja» suena a borrar, y no lo es.
* **Diseño:** `.btn--danger` para la baja, `.input:disabled` para el código bloqueado.
* **Backend:** BE-13.

## Estimación
3 Puntos de Historia (Edición con una regla y confirmación)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE15-01 | **Formulario de edición** Reutilizando el de alta. | Yeremi | Completado |
| T-FE15-02 | **Bloqueo del código** Según si la prueba tiene resultados. | Yeremi | Completado |
| T-FE15-03 | **Diálogo de baja** Con explicación de la consecuencia. | Yeremi | Completado |
| T-FE15-04 | **Opción de mostrar deshabilitadas** | Yeremi | Completado |
| T-FE15-05 | **Pruebas** Escenarios 2, 3 y 4. | Yeremi | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
