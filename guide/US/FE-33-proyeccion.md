# Historia de Usuario

## ID
[FE-33]

## Título
Proyección de evolución

## Descripción
**Como** coordinador pedagógico
**Quiero** ver una estimación de hacia dónde va la progresión de un alumno

**Para** anticipar si alcanzará el nivel objetivo del curso.

## Criterios de Aceptación

### Escenario 1: Proyección sobre el gráfico
```gherkin
Dado un alumno con al menos tres pruebas
Cuando se activa la proyeccion
Entonces se dibuja la tendencia estimada sobre el grafico de evolucion
```

### Escenario 2: Distinción visual clara
```gherkin
Dado una proyeccion representada
Cuando se observa el grafico
Entonces el tramo proyectado usa trazo discontinuo y color atenuado
Y se distingue sin ambiguedad de los datos medidos
```

### Escenario 3: Base declarada
```gherkin
Dado una proyeccion mostrada
Cuando se consulta su informacion
Entonces se indica en cuantas pruebas se basa
Y se identifica expresamente como estimacion
```

### Escenario 4: Datos insuficientes
```gherkin
Dado un alumno con dos pruebas
Cuando se intenta ver su proyeccion
Entonces no se dibuja ninguna
Y se explica que hacen falta al menos tres pruebas
```

### Escenario 5: Tendencia plana
```gherkin
Dado un alumno cuyos resultados no varian
Cuando se calcula su proyeccion
Entonces se representa una tendencia plana
Y no se fuerza una pendiente inexistente
```

## Notas
* **El escenario 2 no es cosmético.** Presentar una estimación con el mismo aspecto que un dato medido induce a tomarla por cierta, y aquí eso significa tomar decisiones pedagógicas sobre un menor a partir de una recta.
* **El escenario 3 la acompaña:** una proyección basada en tres pruebas y otra basada en diez no merecen la misma confianza, y el usuario debe poder distinguirlas.
* **Este es el requisito más vago del encargo.** Conviene enseñar la primera versión al departamento de pedagogía antes de invertir en nada más sofisticado.
* **Backend:** BE-33.

## Estimación
5 Puntos de Historia (Representación con distinción visual y estados)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE33-01 | **Servicio de proyección** | - | Pendiente |
| T-FE33-02 | **Tramo proyectado** Trazo discontinuo y color atenuado. | - | Pendiente |
| T-FE33-03 | **Indicador de base** Número de pruebas y etiqueta de estimación. | - | Pendiente |
| T-FE33-04 | **Estado de datos insuficientes** | - | Pendiente |
| T-FE33-05 | **Validación con pedagogía** Enseñar la primera versión. | - | Pendiente |
| T-FE33-06 | **Pruebas** Escenarios 2, 3 y 4. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
