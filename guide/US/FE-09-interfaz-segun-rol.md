# Historia de Usuario

## ID
[FE-09]

## Título
Interfaz adaptada al rol del usuario

## Descripción
**Como** usuario
**Quiero** ver solo las acciones que me corresponden

**Para** no perderme entre opciones que no puedo usar.

## Criterios de Aceptación

### Escenario 1: Acciones según rol
```gherkin
Dado un usuario con rol tutor
Cuando accede al catalogo de pruebas
Entonces puede consultarlo
Y no ve los botones de crear, editar ni dar de baja
```

### Escenario 2: Ámbito del tutor
```gherkin
Dado un tutor con dos secciones asignadas
Cuando navega por el alumnado
Entonces solo ve alumnos de sus secciones
Y no aparecen las demas en los selectores
```

### Escenario 3: Permiso insuficiente desde el servidor
```gherkin
Dado un usuario que intenta una operacion no permitida
Cuando el backend responde 403
Entonces se muestra un mensaje de permiso insuficiente
Y NO se redirige al login
Y el usuario permanece donde estaba
```

### Escenario 4: Acceso directo por URL
```gherkin
Dado un tutor que escribe a mano la ruta de administracion de usuarios
Cuando se carga la ruta
Entonces la guarda de navegacion lo impide
Y se muestra la pantalla de acceso denegado
```

### Escenario 5: Distinción entre 401 y 403
```gherkin
Dado una peticion sin sesion, la aplicacion lleva al login
Y dado una peticion con sesion pero sin permiso, la aplicacion muestra acceso denegado
Entonces ambos casos son distinguibles para el usuario
```

## Notas
* **Ocultar un botón no es seguridad.** La interfaz oculta para no confundir; quien protege es el backend, que rechaza con `403` aunque la petición llegue directamente. Ambas cosas, siempre.
* **El escenario 5 es la causa del bucle de login más común.** Si un `403` se trata como un `401`, el usuario entra, reintenta, vuelve a salir, y no entiende nada.
* **Diseño:** la pantalla de acceso denegado usa `.state` con `.notice--error`.
* **Backend:** BE-42.

## Estimación
5 Puntos de Historia (Atraviesa toda la interfaz)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE09-01 | **Función hasRole en useAuth** Comprobación reutilizable. | - | Pendiente |
| T-FE09-02 | **Ocultación de acciones** Aplicada en cada vista según rol. | - | Pendiente |
| T-FE09-03 | **Guardas de ruta por rol** En las rutas de administración. | - | Pendiente |
| T-FE09-04 | **Pantalla de acceso denegado** Sin redirección al login. | - | Pendiente |
| T-FE09-05 | **Pruebas de permisos** Escenarios 1, 3 y 4. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
