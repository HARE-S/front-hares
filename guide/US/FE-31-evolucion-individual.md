# Historia de Usuario

## ID
[FE-31]

## Título
Panel de Rendimiento Lector y Evolución individual del alumno

## Descripción
**Como** tutor
**Quiero** ver un panel de rendimiento de mi sección y la evolución individual de cada alumno

**Para** diagnosticar qué estrategias están funcionando y dónde intervenir.

## Criterios de Aceptación

### Escenario 1: Panel de rendimiento por sección
```gherkin
Dado un tutor en una sección con alumnos evaluados
Cuando accede al dashboard
Entonces ve el "Panel de Rendimiento Lector" de esa sección
Y muestra el aula actual y período de evaluación seleccionable
```

### Escenario 2: Tarjetas de métrica
```gherkin
Dado una sección con resultados registrados
Cuando se muestra el dashboard
Entonces se visualizan cuatro métricas principales en tarjetas:
  - Velocidad media del aula con % de objetivo
  - Alumnos evaluados vs. total
  - Libros leídos en trimestre
  - Alerta pedagógica (alumnos que requieren apoyo)
```

### Escenario 3: Gráfico de progreso
```gherkin
Dado una sección con histórico de pruebas
Cuando se muestra el gráfico de progreso
Entonces se representa la evolución de PPM a lo largo del período
Y se compara contra el baremo estándar del centro
```

### Escenario 4: Distribución de niveles
```gherkin
Dado una sección evaluada
Cuando se consulta la distribución
Entonces se muestra cuántos alumnos hay en cada banda (alto/normal/bajo)
Y qué porcentaje representan del total
```

### Escenario 5: Ficha de alumno individual
```gherkin
Dado un alumno con resultados en varias pruebas
Cuando se abre su ficha desde el listado de sección
Entonces se muestra su evolución personal (FE-26)
Y se incluye gráfico de serie con diferencias funcional/literario
Y variación entre pruebas consecutivas
```

### Escenario 6: Acotación por fechas
```gherkin
Dado un alumno con resultados de dos cursos
Cuando se acota la evolucion a un rango
Entonces solo se representan los resultados de ese periodo
```

## Notas
* **Dashboard de sección:** Vista agregada con cuatro métricas: velocidad media, alumnos evaluados, libros leídos y alerta pedagógica. Es el primer punto de entrada tras seleccionar una sección.
* **Escenario 1 (Panel):** Cabecera seleccionable con aula y período. Botones de acciones rápidas (asignar libro, nueva evaluación).
* **Escenario 5 (Ficha individual):** Composición de bloques: datos del alumno, histórico, gráfico de evolución, diferencias funcional/literario y variaciones.
* **Regla de dominio:** Una prueba ausente es ausencia de dato, no un cero. La ficha del alumno no promedia pares incompletos.
* **Diseño:** Tarjetas simples sin sombras, badges para variaciones (delta) y alertas. Gráficos en FE-30.
* **Backend:** BE-31 (evolución individual), BE-30 (bandas), BE-10 (navegación con dashboard).

## Estimación
8 Puntos de Historia (Panel de Rendimiento, métricas, gráfico de progreso, distribución de niveles, serie individual)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE31-01 | **Estructura del dashboard** Panel de Rendimiento Lector (cabecera, selectores, layout). | Santiago | **Completado** |
| T-FE31-02 | **Componente MetricCard** Reutilizable para las cuatro métricas principales. | Santiago | **Completado** |
| T-FE31-03 | **Servicio de sección** Obtener métricas agregadas de sección (velocidad media, alumnos, libros). | Santiago | **Completado** |
| T-FE31-04 | **Gráfico de progreso** Línea de evolución PPM con baremo de referencia (FE-30). | - | Bloqueado |
| T-FE31-05 | **Distribución de niveles** Gráfico y recuento por banda (FE-34). | - | Bloqueado |
| T-FE31-06 | **Ficha individual del alumno** Evolución, diferencias funcional/literario, variaciones. | Santiago | **Completado** |
| T-FE31-07 | **Acción pedagógica sugerida** Alerta y recomendaciones para intervención. | Santiago | **Completado** |
| T-FE31-08 | **Pruebas** Dashboard, tablas de evolución, estados de datos incompletos. | Santiago | **En curso** |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
