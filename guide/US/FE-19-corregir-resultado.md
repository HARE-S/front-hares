# Historia de Usuario

## ID
[FE-19]

## Título
Corregir o anular un resultado

## Descripción
**Como** tutor
**Quiero** rectificar un resultado mal introducido

**Para** que los análisis no arrastren un error de tecleo.

## Criterios de Aceptación

### Escenario 1: Corrección desde el histórico
```gherkin
Dado un resultado en el historial de un alumno
Cuando el tutor pulsa editar
Entonces se abre el formulario con los valores actuales
Y al guardar las metricas se recalculan
```

### Escenario 2: Métricas actualizadas
```gherkin
Dado un resultado corregido en su tiempo
Cuando se guarda
Entonces la velocidad eficaz mostrada cambia en consecuencia
Y tambien su distintivo de banda si corresponde
```

### Escenario 3: Anulación con confirmación
```gherkin
Dado un resultado registrado por error
Cuando el tutor pulsa eliminar
Entonces se pide confirmacion
Y se advierte de que la eliminacion es definitiva
```

### Escenario 4: Datos inválidos
```gherkin
Dado la edicion de un resultado
Cuando se introducen valores fuera de rango
Entonces el backend responde 422
Y el error se muestra junto al campo afectado
```

### Escenario 5: Sin permiso
```gherkin
Dado un tutor sin la seccion del alumno
Cuando intenta editar o eliminar un resultado
Entonces se muestra acceso denegado
```

## Notas
* **La eliminación aquí sí es definitiva**, a diferencia de pruebas y libros. Un resultado anulado es un dato que nunca debió existir, no un registro histórico que retirar del uso. Por eso el escenario 3 lo advierte expresamente.
* **Lo que sí queda es la traza:** el backend registra en auditoría quién cambió qué y desde qué valor. Por eso las correcciones se hacen aquí y nunca con un `UPDATE` directo en la base de datos.
* **Backend:** BE-21.

## Estimación
3 Puntos de Historia (Edición y borrado con confirmación)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE19-01 | **Acciones en el histórico** Editar y eliminar por fila. | - | Pendiente |
| T-FE19-02 | **Formulario de edición** Reutilizando el de registro. | - | Pendiente |
| T-FE19-03 | **Diálogo de confirmación** Con advertencia de definitivo. | - | Pendiente |
| T-FE19-04 | **Recálculo visible** Métricas y banda actualizadas. | - | Pendiente |
| T-FE19-05 | **Pruebas** Escenarios 2, 3 y 4. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
