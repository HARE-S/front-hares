# Historia de Usuario

## ID
[FE-31]

## Título
Evolución individual del alumno

## Descripción
**Como** tutor
**Quiero** ver la progresión de un alumno a lo largo del curso

**Para** saber si el programa está funcionando con él.

## Criterios de Aceptación

### Escenario 1: Serie por prueba
```gherkin
Dado un alumno con resultados en varias pruebas
Cuando se abre su evolucion
Entonces se muestra una serie con la media del par funcional y literario por prueba
Y las pruebas se ordenan I, A, B, C, D, E
```

### Escenario 2: Diferencia entre tipos de texto
```gherkin
Dado un alumno con resultados funcionales y literarios
Cuando se consulta una prueba concreta
Entonces se muestra la diferencia entre el texto literario y el funcional
Y se indica cual le resulta mas dificil
```

### Escenario 3: Progreso entre pruebas
```gherkin
Dado un alumno con al menos dos pruebas
Cuando se consulta su evolucion
Entonces se muestra la variacion entre pruebas consecutivas
Y una variacion positiva se distingue visualmente de una negativa
```

### Escenario 4: Par incompleto
```gherkin
Dado un alumno que solo hizo el texto literario de una prueba
Cuando se muestra la media de ese par
Entonces se indica que el par esta incompleto
Y la media NO se calcula tratando la prueba ausente como un cero
```

### Escenario 5: Datos insuficientes
```gherkin
Dado un alumno con una sola prueba registrada
Cuando se abre su evolucion
Entonces se muestra un mensaje explicando que hacen falta al menos dos
Y no se dibuja un grafico
```

### Escenario 6: Acotación por fechas
```gherkin
Dado un alumno con resultados de dos cursos
Cuando se acota la evolucion a un rango
Entonces solo se representan los resultados de ese periodo
```

## Notas
* **El escenario 4 corrige un comportamiento del sistema anterior.** En la hoja de cálculo del centro, una prueba no realizada devuelve cero y la media del par sale a la mitad. Aquí una prueba ausente es ausencia de dato, no un cero, y debe verse como tal.
* **El escenario 2 tiene valor pedagógico directo:** los alumnos suelen tener más dificultad con los textos funcionales, y cuánta es esa diferencia orienta la intervención.
* **Diseño:** `.delta--up`, `--down`, `--flat` y `--nodata` para las variaciones.
* **Backend:** BE-31, más las métricas de par.

## Estimación
5 Puntos de Historia (Serie, diferencias y estados de datos escasos)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE31-01 | **Servicio de evolución** Serie de pares y progreso. | - | Pendiente |
| T-FE31-02 | **Gráfico de evolución** Ordenado por letra de prueba. | - | Pendiente |
| T-FE31-03 | **Diferencia funcional frente a literario** | - | Pendiente |
| T-FE31-04 | **Píldoras de variación** Entre pruebas consecutivas. | - | Pendiente |
| T-FE31-05 | **Estados de par incompleto y datos insuficientes** | - | Pendiente |
| T-FE31-06 | **Pruebas** Escenarios 4 y 5. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
