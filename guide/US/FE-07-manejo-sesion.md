# Historia de Usuario

## ID
[FE-07]

## Título
Manejo de la sesión de usuario

## Descripción
**Como** usuario
**Quiero** que la aplicación sepa quién soy mientras trabajo y me avise cuando caduque

**Para** no perder lo que estoy haciendo ni quedarme ante una pantalla rota.

## Criterios de Aceptación

### Escenario 1: Carga inicial
```gherkin
Dado un usuario que abre la aplicacion
Cuando se monta la aplicacion
Entonces se consulta al backend quien es el usuario actual
Y mientras tanto se muestra un estado de carga
```

### Escenario 2: El estado vive en memoria
```gherkin
Dado un usuario autenticado
Cuando se inspecciona localStorage y sessionStorage
Entonces no contienen ningun dato de sesion ni token
Y el estado del usuario solo existe en memoria
```

### Escenario 3: Sesión caducada durante el trabajo
```gherkin
Dado un usuario rellenando un formulario
Cuando una peticion devuelve 401 porque la sesion ha caducado
Entonces se redirige al login
Y se muestra un mensaje explicando que la sesion ha expirado
Y NO se muestra una pantalla rota ni un error tecnico
```

### Escenario 4: Usuario y rol visibles
```gherkin
Dado un usuario con sesion activa
Cuando mira la cabecera
Entonces ve su nombre, su correo y su rol
Y una opcion de cerrar sesion
```

### Escenario 5: Cierre de sesión
```gherkin
Dado un usuario con sesion activa
Cuando pulsa cerrar sesion
Entonces se llama al endpoint de cierre del backend
Y se limpia el estado en memoria
Y se redirige a la pantalla de acceso
```

### Escenario 6: Recarga de página
```gherkin
Dado un usuario con sesion activa
Cuando recarga la pagina
Entonces la sesion se mantiene
Y el estado del usuario se reconstruye preguntando al backend
```

## Notas
* **No hay token que guardar.** La sesión es una cookie `HttpOnly` que JavaScript no puede leer. Si aparece código leyendo un token de `localStorage`, se ha colado un patrón de otro proyecto.
* **El escenario 2 es una prueba, no una recomendación.** Guardar datos de sesión en `localStorage` los deja accesibles a cualquier script inyectado en la página.
* **Diseño:** el estado de carga inicial usa `.skeleton`; el mensaje de sesión expirada, `.notice--info`.
* **Testing:** escenarios 2 y 3 son pruebas obligatorias.
* **Backend:** BE-40.

## Estimación
5 Puntos de Historia (Composable de sesión y manejo transversal del 401)

## Prioridad
Crítica

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE07-01 | **Composable useAuth** Usuario, carga, rol y comprobación de permisos. | - | Pendiente |
| T-FE07-02 | **Carga inicial** Consulta a `/api/v1/auth/me` al montar la aplicación. | - | Pendiente |
| T-FE07-03 | **Mensaje de sesión expirada** Al llegar al login por un `401`. | - | Pendiente |
| T-FE07-04 | **Menú de usuario en cabecera** Nombre, correo, rol y cierre de sesión. | - | Pendiente |
| T-FE07-05 | **Pruebas de sesión** Escenarios 2, 3 y 6. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
