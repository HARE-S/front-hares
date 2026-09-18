# Historia de Usuario

## ID
[FE-29]

## Título
Historial de pruebas por sección

## Descripción
**Como** coordinador pedagógico
**Quiero** ver todas las pruebas realizadas en una sección

**Para** valorar el estado del grupo sin abrir la ficha de cada alumno.

## Criterios de Aceptación

### Escenario 1: Histórico del grupo
```gherkin
Dado una seccion con resultados registrados
Cuando se consulta su historial
Entonces se muestran los resultados de todos sus alumnos
Y cada fila indica alumno, prueba, fecha y velocidad eficaz
```

### Escenario 2: Agrupación por prueba
```gherkin
Dado una prueba aplicada a todo el grupo
Cuando se agrupa el historial por prueba
Entonces se ven juntos los resultados de esa aplicacion
Y se pueden comparar los alumnos entre si
```

### Escenario 3: Comprobación tras un registro en lote
```gherkin
Dado un registro en lote recien guardado
Cuando se consulta el historial de la seccion
Entonces aparecen todos los resultados introducidos
Y se comprueba de un vistazo que no falta ninguno
```

### Escenario 4: Alumnos que cambiaron de grupo
```gherkin
Dado un alumno que hizo una prueba estando en la seccion A
Y que despues paso a la seccion B
Cuando se consulta el historial de la seccion A
Entonces ese resultado sigue apareciendo alli
Y no se traslada a la B
```

### Escenario 5: Acotación por fechas
```gherkin
Dado una seccion con resultados de todo el curso
Cuando se acota a un rango de fechas
Entonces solo se muestran los de ese periodo
```

## Notas
* **El escenario 4 es la razón de que el backend guarde la sección en cada resultado.** Sin eso, un cambio de grupo reescribiría retroactivamente el historial de las dos secciones y cualquier comparativa quedaría falseada.
* **El escenario 3 es el uso real más frecuente:** confirmar que el lote se guardó entero.
* **Diseño:** `.table` con `.segmented` para alternar la agrupación.
* **Backend:** BE-51.

## Estimación
3 Puntos de Historia (Listado con agrupación y acotación)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE29-01 | **Servicio de historial por sección** | Yeremi | Completado |
| T-FE29-02 | **Tabla del grupo** Alumno, prueba, fecha y métricas. | Yeremi | Completado |
| T-FE29-03 | **Alternador de agrupación** Por prueba o cronológico. | Yeremi | Completado |
| T-FE29-04 | **Acotación por fechas** | Yeremi | Completado |
| T-FE29-05 | **Pruebas** Escenarios 2 y 5. | Yeremi | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
