# Historia de Usuario

## ID
[FE-25]

## Título
Navegación por centros, secciones y alumnado

## Descripción
**Como** tutor
**Quiero** navegar por los centros y sus secciones

**Para** llegar al grupo con el que trabajo.

## Criterios de Aceptación

### Escenario 1: Listado de centros
```gherkin
Dado un usuario con sesion y rol asignado
Cuando accede a la seccion de alumnado
Entonces ve la lista de centros activos
Y cuantas secciones tiene cada uno
```

### Escenario 2: Secciones de un centro
```gherkin
Dado un centro seleccionado
Cuando se abre su detalle
Entonces se muestran sus secciones
Y el numero de alumnos de cada una
```

### Escenario 3: Panel de Rendimiento Lector
```gherkin
Dado una seccion seleccionada
Cuando se abre su detalle
Entonces se muestra primero el Panel de Rendimiento Lector (FE-31)
Y luego el alumnado matriculado con sus fichas individuales
```

### Escenario 4: Ámbito del tutor
```gherkin
Dado un tutor con dos secciones asignadas
Cuando navega por el alumnado
Entonces solo ve esas dos secciones
Y no aparecen centros ni secciones ajenos
```

### Escenario 5: Solo lectura
```gherkin
Dado cualquier usuario
Cuando consulta centros o secciones
Entonces no ve acciones de crear ni editar
Y se indica que estos datos proceden de Alexia
```

### Escenario 6: Sección vacía
```gherkin
Dado una seccion sin alumnado matriculado
Cuando se abre su detalle
Entonces se muestra el estado vacio
Y se explica que puede deberse a que falta importar el volcado
```

## Notas
* **El escenario 5 evita una confusión recurrente.** Centros, secciones y alumnado vienen de Alexia y se mantienen allí. Si la interfaz ofreciera editarlos, habría dos fuentes de verdad y la siguiente importación machacaría los cambios.
* **El escenario 6 orienta en lugar de dejar en blanco.** A principio de curso, una sección vacía es lo normal.
* **Diseño:** `.table` y migas de pan en `.header`.
* **Backend:** BE-10.

## Estimación
3 Puntos de Historia (Tres listados anidados en solo lectura)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE25-01 | **Servicio de centros y secciones** Con JSDoc. | - | Pendiente |
| T-FE25-02 | **Listado de centros** Con recuento de secciones. | - | Pendiente |
| T-FE25-03 | **Detalle de centro y de sección** Con migas de pan. | - | Pendiente |
| T-FE25-04 | **Filtrado por ámbito del tutor** | - | Pendiente |
| T-FE25-05 | **Pruebas** Escenarios 4 y 6. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
