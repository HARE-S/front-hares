# Historia de Usuario

## ID
[FE-08]

## Título
Pantalla de usuario pendiente de permisos

## Descripción
**Como** persona que entra por primera vez
**Quiero** entender por qué no veo datos

**Para** saber que debo esperar a que un administrador me asigne permisos y no pensar que la aplicación falla.

## Criterios de Aceptación

### Escenario 1: Primer acceso
```gherkin
Dado un usuario del dominio que entra por primera vez
Cuando completa la autenticacion
Entonces ve una pantalla explicando que espera asignacion de permisos
Y se le indica a quien dirigirse
```

### Escenario 2: Sin acceso a datos
```gherkin
Dado un usuario con rol pendiente
Cuando intenta acceder a cualquier ruta de alumnado, resultados o informes
Entonces es redirigido a la pantalla de espera
Y NO ve ningun dato de alumnado
```

### Escenario 3: Navegación reducida
```gherkin
Dado un usuario con rol pendiente
Cuando mira la barra lateral
Entonces no ve las secciones a las que no tiene acceso
Y solo puede cerrar sesion
```

### Escenario 4: Aviso para administradores
```gherkin
Dado uno o mas usuarios con rol pendiente
Cuando un administrador accede a la aplicacion
Entonces ve un aviso de que hay usuarios esperando asignacion
Y un enlace directo a la gestion de usuarios
```

### Escenario 5: Rol asignado
```gherkin
Dado un usuario pendiente al que un administrador acaba de asignar rol
Cuando recarga la aplicacion
Entonces accede con normalidad
Y ya no ve la pantalla de espera
```

## Notas
* **Decisiones:** el rol pendiente evita los dos extremos malos. Dar de alta a mano a cada persona es un cuello de botella; dar acceso completo por tener correo del dominio significa que el personal de administración o mantenimiento vería expedientes de menores.
* **La interfaz oculta, el backend protege.** El escenario 2 se cumple también si alguien escribe la URL a mano, porque el backend devuelve `403`. Ocultar la navegación es para no confundir, no para asegurar.
* **Diseño:** usa `.state` con icono, título y texto explicativo.
* **Backend:** BE-41.

## Estimación
3 Puntos de Historia (Pantalla simple más guarda de navegación)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE08-01 | **Vista de espera** Mensaje explicativo y a quién dirigirse. | - | Pendiente |
| T-FE08-02 | **Guarda por rol pendiente** Redirección desde cualquier ruta de datos. | - | Pendiente |
| T-FE08-03 | **Navegación reducida** Ocultar secciones sin acceso. | - | Pendiente |
| T-FE08-04 | **Aviso para administradores** Contador de pendientes con enlace. | - | Pendiente |
| T-FE08-05 | **Pruebas** Escenarios 2 y 3. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
