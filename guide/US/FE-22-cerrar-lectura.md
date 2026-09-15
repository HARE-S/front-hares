# Historia de Usuario

## ID
[FE-22]

## Título
Cerrar una lectura

## Descripción
**Como** tutor
**Quiero** marcar la fecha en que un alumno termina un libro

**Para** saber cuánto ha tardado y cuántos lleva completados.

## Criterios de Aceptación

### Escenario 1: Cierre desde el listado
```gherkin
Dado una lectura en curso en la ficha del alumno
Cuando el tutor pulsa marcar como terminada e indica la fecha
Entonces la lectura pasa a finalizada
Y se muestra cuantos dias ha durado
```

### Escenario 2: Distinción visual de estados
```gherkin
Dado un alumno con lecturas en curso y finalizadas
Cuando se consulta su listado
Entonces cada una indica su estado de un vistazo
Y las finalizadas muestran su fecha de fin
```

### Escenario 3: Fecha incoherente
```gherkin
Dado una lectura iniciada el 12 de septiembre
Cuando se intenta cerrar con fecha 1 de septiembre
Entonces el backend responde 422
Y se explica que la fecha de fin no puede ser anterior al inicio
```

### Escenario 4: Reapertura
```gherkin
Dado una lectura cerrada por error
Cuando el tutor retira la fecha de fin
Entonces vuelve a considerarse en curso
Y conserva su fecha de inicio original
```

### Escenario 5: Filtro por estado
```gherkin
Dado un alumno con varias lecturas
Cuando se filtra por en curso
Entonces solo se muestran las que no tienen fecha de fin
```

## Notas
* **El escenario 4 evita un borrado innecesario.** Reabrir es menos destructivo que eliminar y volver a crear, y conserva la fecha de inicio real.
* **Diseño:** `.badge` con variante según estado, `.segmented` para el filtro.
* **Backend:** BE-24.

## Estimación
2 Puntos de Historia (Acción simple con una validación)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE22-01 | **Acción de cierre** Desde el listado de lecturas. | - | Pendiente |
| T-FE22-02 | **Estado visual** En curso o finalizada, con duración. | - | Pendiente |
| T-FE22-03 | **Manejo del 422** Mensaje de fecha incoherente. | - | Pendiente |
| T-FE22-04 | **Filtro por estado** | - | Pendiente |
| T-FE22-05 | **Pruebas** Escenarios 2, 3 y 4. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
