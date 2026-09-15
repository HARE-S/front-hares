# Historia de Usuario

## ID
[FE-35]

## Título
Aviso de alumnos sin progreso

## Descripción
**Como** coordinador pedagógico
**Quiero** que la aplicación me señale a quién no está mejorando

**Para** priorizar la atención sin revisar todas las fichas.

## Criterios de Aceptación

### Escenario 1: Listado destacado
```gherkin
Dado un grupo con alumnos cuya tendencia es plana o negativa
Cuando se abre la pantalla de coordinacion
Entonces esos alumnos aparecen en un bloque destacado
Y se indica cuantos son
```

### Escenario 2: Distinción de datos insuficientes
```gherkin
Dado un alumno con una sola prueba
Cuando se genera el listado
Entonces aparece en la categoria sin datos suficientes
Y NO en la de sin progreso
```

### Escenario 3: Acceso directo a la ficha
```gherkin
Dado un alumno señalado en el listado
Cuando el coordinador pulsa sobre el
Entonces se abre su ficha
Y puede revisar su historico completo
```

### Escenario 4: Ámbito del usuario
```gherkin
Dado un tutor con secciones asignadas
Cuando consulta el listado
Entonces solo aparecen alumnos de sus secciones
```

### Escenario 5: Sin alumnos señalados
```gherkin
Dado un grupo donde todos progresan
Cuando se consulta el listado
Entonces se muestra un mensaje positivo
Y no un bloque vacio sin explicacion
```

## Notas
* **El escenario 2 es el que hace útil la historia.** Confundir «no tengo datos de este alumno» con «este alumno no progresa» lleva a intervenir sobre quien no lo necesita y a no intervenir sobre quien sí. Son dos listas distintas y deben verse separadas.
* **Es un listado de trabajo, no una etiqueta.** No se almacena ninguna clasificación en la ficha del alumno ni se muestra como una marca permanente.
* **Diseño:** `.card--alert` para el bloque, `.badge--low` y `.badge--nodata` para las dos categorías.
* **Backend:** BE-34.

## Estimación
3 Puntos de Historia (Listado con dos categorías y enlaces)

## Prioridad
Baja

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE35-01 | **Servicio de alumnos sin progreso** | - | Pendiente |
| T-FE35-02 | **Bloque destacado** Con las dos categorías separadas. | - | Pendiente |
| T-FE35-03 | **Enlace a la ficha** | - | Pendiente |
| T-FE35-04 | **Estado sin alumnos señalados** | - | Pendiente |
| T-FE35-05 | **Pruebas** Escenarios 2 y 5. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
