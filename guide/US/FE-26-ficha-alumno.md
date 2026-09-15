# Historia de Usuario

## ID
[FE-26]

## Título
Ficha del alumno

## Descripción
**Como** tutor
**Quiero** una vista única con todo lo relativo a un alumno

**Para** preparar una tutoría sin navegar por cinco pantallas.

## Criterios de Aceptación

### Escenario 1: Vista completa
```gherkin
Dado un alumno con historico registrado
Cuando se abre su ficha
Entonces se muestran sus datos personales y sus secciones
Y su historico de pruebas
Y sus lecturas
Y su grafico de evolucion
```

### Escenario 2: Una sola petición
```gherkin
Dado la carga de una ficha
Cuando se observan las llamadas de red
Entonces basta una peticion para pintar la pantalla
Y no se encadena una llamada por cada resultado
```

### Escenario 3: Histórico con las tres métricas
```gherkin
Dado el historico de pruebas
Cuando se muestra cada resultado
Entonces incluye velocidad espontanea, comprension y velocidad eficaz
Y la velocidad eficaz lleva su distintivo de banda
```

### Escenario 4: Secciones actuales e históricas
```gherkin
Dado un alumno que cambio de seccion entre cursos
Cuando se consulta su ficha
Entonces se distinguen sus secciones actuales de las anteriores
```

### Escenario 5: Alumno sin datos
```gherkin
Dado un alumno recien importado sin resultados ni lecturas
Cuando se abre su ficha
Entonces se muestran sus datos con los apartados vacios explicados
Y no una pantalla de error
```

### Escenario 6: Sin permiso
```gherkin
Dado un tutor que no tiene la seccion de ese alumno
Cuando intenta abrir su ficha
Entonces se muestra acceso denegado
Y no se filtra ningun dato del alumno
```

## Notas
* **El escenario 2 justifica que el backend tenga un endpoint agregado.** Encadenar peticiones produciría una carga escalonada con estados intermedios feos, y con quince pruebas serían dieciséis llamadas.
* **El escenario 6 no es solo una pantalla de error:** no debe filtrarse ni el nombre del alumno en un mensaje.
* **Diseño:** `.card` por bloque, `.table` para histórico y lecturas, `.metric` para el resumen, `.badge` para las bandas.
* **Backend:** BE-28.

## Estimación
5 Puntos de Historia (Composición de varios bloques con estados)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE26-01 | **Servicio de ficha** Con JSDoc del recurso agregado. | - | Pendiente |
| T-FE26-02 | **Cabecera del alumno** Datos y secciones actuales e históricas. | - | Pendiente |
| T-FE26-03 | **Tabla de histórico** Con las tres métricas y su banda. | - | Pendiente |
| T-FE26-04 | **Bloque de lecturas** Con estado de cada una. | - | Pendiente |
| T-FE26-05 | **Estados incompletos** Apartados vacíos explicados. | - | Pendiente |
| T-FE26-06 | **Pruebas** Escenarios 3, 5 y 6. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
