# Historia de Usuario

## ID
[FE-38]

## Título
Informe agregado de grupo

## Descripción
**Como** responsable pedagógico
**Quiero** un informe agregado de una sección o un centro

**Para** valorar el programa en las reuniones de seguimiento.

## Criterios de Aceptación

### Escenario 1: Datos agregados
```gherkin
Dado una seccion con alumnado y resultados
Cuando se genera su informe
Entonces muestra la media de velocidad eficaz
Y el numero de participantes y de pruebas realizadas
```

### Escenario 2: Distribución, no solo media
```gherkin
Dado un informe de grupo
Cuando se consulta
Entonces incluye cuantos alumnos hay en cada banda de nivel
Y NO unicamente el valor medio
```

### Escenario 3: Progreso del grupo
```gherkin
Dado un informe entre pruebas consecutivas
Cuando se consulta el progreso
Entonces indica cuantos alumnos mejoran y su porcentaje
```

### Escenario 4: Grupo sin datos
```gherkin
Dado una seccion sin resultados registrados
Cuando se genera su informe
Entonces se indica la ausencia de datos
Y no se muestran medias calculadas sobre cero
```

### Escenario 5: Exportable e imprimible
```gherkin
Dado un informe de grupo
Cuando el usuario lo solicita
Entonces puede descargarlo en Excel
Y puede imprimirlo con el mismo formato que el informe individual
```

### Escenario 6: Alcance por rol
```gherkin
Dado un tutor
Cuando intenta generar el informe de un centro completo
Entonces la opcion no esta disponible
```

## Notas
* **El escenario 2 es la razón de ser del informe.** Dos grupos con la misma media pueden ser muy distintos: uno homogéneo y otro con la mitad del alumnado estancado y la otra mitad muy por encima. La media sola oculta exactamente el problema que el programa quiere detectar.
* **El escenario 3 usa el criterio del cliente:** recuento y porcentaje de alumnos que mejoran, no promedio de diferencias.
* **Diseño:** `.metric` para los agregados, `.progress` para la distribución por banda.
* **Backend:** BE-37.

## Estimación
5 Puntos de Historia (Agregados, distribución y dos formatos de salida)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE38-01 | **Servicio del informe de grupo** | - | Pendiente |
| T-FE38-02 | **Tarjetas de agregados** Media, participantes y pruebas. | - | Pendiente |
| T-FE38-03 | **Distribución por banda** Con barras y porcentajes. | - | Pendiente |
| T-FE38-04 | **Progreso por recuento** | - | Pendiente |
| T-FE38-05 | **Exportación e impresión** | - | Pendiente |
| T-FE38-06 | **Pruebas** Escenarios 2, 4 y 6. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
