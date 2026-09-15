# Historia de Usuario

## ID
[FE-11]

## Título
Estados de pantalla: cargando, vacío, error y sin permiso

## Descripción
**Como** usuario
**Quiero** entender qué ocurre cuando no hay datos o algo falla

**Para** no quedarme ante una pantalla en blanco sin saber si la aplicación está rota.

## Criterios de Aceptación

### Escenario 1: Estado de carga
```gherkin
Dado una pantalla que consulta datos
Cuando la peticion aun no ha respondido
Entonces se muestra un esqueleto con la forma del contenido esperado
Y no un texto generico de cargando
```

### Escenario 2: Estado vacío
```gherkin
Dado una consulta que devuelve una lista vacia
Cuando se muestra el resultado
Entonces aparece un mensaje explicando que no hay datos
Y se indica que accion puede tomar el usuario
```

### Escenario 3: Estado de error
```gherkin
Dado un fallo de red o un error del servidor
Cuando la peticion falla
Entonces se muestra un mensaje de error comprensible
Y un boton de reintentar cuando la operacion sea repetible
```

### Escenario 4: Estado sin permiso
```gherkin
Dado un usuario sin permiso sobre el recurso
Cuando el backend responde 403
Entonces se muestra un mensaje de acceso denegado
Y NO se redirige al login
```

### Escenario 5: Lista vacía frente a recurso inexistente
```gherkin
Dado un alumno sin resultados registrados
Cuando se consulta su historial
Entonces se muestra el estado vacio
Y cuando el alumno no existe se muestra el estado de no encontrado
Y ambos casos son distinguibles
```

### Escenario 6: Cobertura en todas las vistas
```gherkin
Dado el conjunto de vistas de la aplicacion
Cuando se revisan una a una
Entonces todas contemplan los cuatro estados
Y ninguna asume que los datos siempre llegan
```

## Notas
* **Una pantalla que solo contempla el caso feliz parece terminada en la demostración y se rompe el primer día de uso real.** Por eso esto es una historia propia y no un detalle de cada pantalla.
* **El escenario 5 importa en el dominio.** Un alumno sin pruebas y un alumno que no existe son cosas distintas: la primera es normal a principio de curso, la segunda es un error.
* **El escenario 6 es una revisión, no código.** Merece un repaso explícito antes de cerrar la historia.
* **Diseño:** `.state`, `.state__icon`, `.state__title`, `.state__text` y `.skeleton` de `components.css`.

## Estimación
3 Puntos de Historia (Componente reutilizable más su aplicación)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE11-01 | **Componente StateBlock** Con variantes vacío, error, sin permiso y no encontrado. | - | Pendiente |
| T-FE11-02 | **Esqueletos de carga** Para tabla, tarjeta de métrica y ficha. | - | Pendiente |
| T-FE11-03 | **Composable useFetch** Devuelve datos, cargando y error de forma uniforme. | - | Pendiente |
| T-FE11-04 | **Revisión de cobertura** Vista por vista. | - | Pendiente |
| T-FE11-05 | **Pruebas** Escenarios 2, 3, 4 y 5. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
