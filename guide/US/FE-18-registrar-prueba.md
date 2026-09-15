# Historia de Usuario

## ID
[FE-18]

## Título
Registrar el resultado de una prueba

## Descripción
**Como** tutor
**Quiero** consignar el resultado de una prueba de un alumno

**Para** dejar registrada su progresión y ver al momento cómo ha ido.

## Criterios de Aceptación

### Escenario 1: Registro correcto
```gherkin
Dado un tutor en la ficha de un alumno de su seccion
Cuando selecciona prueba y fecha e introduce tiempo, aciertos y errores
Y pulsa guardar
Entonces el resultado se registra
Y se muestran la velocidad espontanea, la comprension y la velocidad eficaz calculadas
```

### Escenario 2: Las tres métricas visibles
```gherkin
Dado un resultado recien guardado
Cuando se muestra la confirmacion
Entonces aparecen PPM, porcentaje de comprension y velocidad eficaz
Y la velocidad eficaz lleva su distintivo de banda
```

### Escenario 3: Valores inválidos
```gherkin
Dado el formulario de registro
Cuando se introduce un valor negativo en tiempo, aciertos o errores
Entonces se rechaza antes de enviar
Y cuando aciertos mas errores supera 20 tambien se rechaza
```

### Escenario 4: Duplicado
```gherkin
Dado un alumno que ya tiene esa prueba registrada en esa fecha
Cuando se intenta guardar otra vez
Entonces el backend responde 409
Y se muestra un mensaje indicando que ya existe ese registro
```

### Escenario 5: Sin permiso sobre la sección
```gherkin
Dado un tutor que no tiene asignada la seccion del alumno
Cuando intenta registrar un resultado
Entonces el backend responde 403
Y se muestra acceso denegado sin redirigir al login
```

### Escenario 6: Tiempo sospechoso
```gherkin
Dado un texto de 872 palabras
Cuando el tutor introduce un tiempo de 14 segundos
Entonces se avisa de que el valor parece fuera de rango
Y se pide confirmacion antes de guardar
```

## Notas
* **El escenario 2 es lo que hace útil la pantalla.** El tutor necesita ver el resultado al momento para decidir si repite la prueba o interviene, no esperar a un informe.
* **El escenario 6 es la defensa contra el error de unidades.** Un tiempo en minutos en lugar de segundos multiplica la velocidad por sesenta y contamina las medias del grupo entero, que es lo que ocurrió en los informes del sistema anterior.
* **Diseño:** `.field`, `.input--numeric`, `.metric` para el resultado, `.badge--high/normal/low` para la banda.
* **Backend:** BE-18.

## Estimación
5 Puntos de Historia (Formulario, validación, avisos y presentación de métricas)

## Prioridad
Crítica

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE18-01 | **Servicio de resultados** Alta con JSDoc del recurso. | - | Pendiente |
| T-FE18-02 | **Formulario de registro** Con selector de prueba y fecha. | - | Pendiente |
| T-FE18-03 | **Validación de rangos** Negativos y suma mayor que 20. | - | Pendiente |
| T-FE18-04 | **Aviso de tiempo sospechoso** Con confirmación. | - | Pendiente |
| T-FE18-05 | **Panel de resultado** Las tres métricas con su banda. | - | Pendiente |
| T-FE18-06 | **Pruebas** Escenarios 3, 4, 5 y 6. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
