# Historia de Usuario

## ID
[FE-10]

## Título
Pantalla de gestión de usuarios y roles

## Descripción
**Como** administrador
**Quiero** asignar roles y secciones a cada usuario

**Para** dar acceso al personal nuevo sin depender del equipo de desarrollo.

## Criterios de Aceptación

### Escenario 1: Listado de usuarios
```gherkin
Dado un administrador con sesion activa
Cuando accede a la gestion de usuarios
Entonces ve la lista con nombre, correo, rol y ultimo acceso
Y los usuarios pendientes aparecen destacados
```

### Escenario 2: Cambio de rol
```gherkin
Dado un usuario con rol pendiente
Cuando el administrador le asigna el rol tutor
Entonces se pide confirmacion explicita antes de aplicar
Y tras confirmar el listado refleja el nuevo rol
```

### Escenario 3: Asignación de secciones
```gherkin
Dado un usuario con rol tutor
Cuando el administrador le asigna secciones
Entonces puede seleccionar varias
Y el listado muestra cuantas tiene asignadas
```

### Escenario 4: Último administrador protegido
```gherkin
Dado un sistema con un unico administrador
Cuando ese administrador intenta quitarse su propio rol
Entonces el backend lo impide con 409
Y la interfaz muestra el motivo con claridad
```

### Escenario 5: Solo administradores
```gherkin
Dado un usuario con rol coordinador
Cuando intenta acceder a la gestion de usuarios
Entonces la guarda de ruta lo impide
Y ve la pantalla de acceso denegado
```

## Notas
* **El escenario 2 pide confirmación a propósito.** Cambiar un rol concede acceso a expedientes de menores; no debe ocurrir por un clic accidental en un desplegable.
* **El escenario 4 evita un bloqueo irrecuperable.** Sin esa comprobación, el último administrador puede dejarse sin permisos y haría falta entrar a la base de datos a mano para arreglarlo.
* **Diseño:** `.table` con `.badge` para el rol y `.btn--secondary` para las acciones.
* **Backend:** BE-43.

## Estimación
5 Puntos de Historia (Listado, edición y confirmaciones)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE10-01 | **Servicio de usuarios** Listado, cambio de rol y asignación de secciones. | - | Pendiente |
| T-FE10-02 | **Vista de listado** Con destacado de pendientes y último acceso. | - | Pendiente |
| T-FE10-03 | **Diálogo de cambio de rol** Con confirmación explícita. | - | Pendiente |
| T-FE10-04 | **Selector múltiple de secciones** | - | Pendiente |
| T-FE10-05 | **Manejo del 409** Mensaje claro del último administrador. | - | Pendiente |
| T-FE10-06 | **Pruebas** Escenarios 2, 4 y 5. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
