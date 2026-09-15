# Historia de Usuario

## ID
[FE-06]

## Título
Pantalla de acceso con cuenta corporativa

## Descripción
**Como** tutor
**Quiero** entrar en la aplicación con mi cuenta corporativa de Google

**Para** acceder de forma segura sin gestionar otra contraseña más.

## Criterios de Aceptación

### Escenario 1: Pantalla de acceso
```gherkin
Dado un usuario sin sesion
Cuando accede a la aplicacion
Entonces ve una pantalla con un unico boton de entrada con Google
Y no ve ningun campo de usuario ni contraseña
```

### Escenario 2: Inicio del flujo
```gherkin
Dado la pantalla de acceso
Cuando el usuario pulsa el boton de entrada
Entonces se muestra un estado de carga
Y el navegador es redirigido al flujo de Google
```

### Escenario 3: Cuenta ajena al dominio
```gherkin
Dado un usuario que completa el flujo con una cuenta personal
Cuando el backend rechaza el acceso
Entonces se muestra un mensaje indicando que esa cuenta no esta autorizada
Y NO se muestra un error generico del sistema
```

### Escenario 4: Fallo del servicio de identidad
```gherkin
Dado un fallo en el flujo de autenticacion
Cuando el usuario vuelve a la aplicacion
Entonces se muestra un mensaje de error con opcion de reintentar
Y el boton vuelve a estar disponible
```

### Escenario 5: Usuario ya autenticado
```gherkin
Dado un usuario con sesion activa
Cuando accede a la pantalla de login
Entonces es redirigido a la pantalla principal
Y no ve el boton de entrada
```

## Notas
* **No hay registro ni contraseñas.** La identidad la da Google y el centro gestiona altas y bajas en su directorio. No existe pantalla de registro ni de recuperación de contraseña.
* **El escenario 3 importa más de lo que parece.** Quien use una cuenta personal para asuntos del centro se quedará fuera: es el comportamiento correcto, pero el mensaje debe explicarlo, no parecer una avería.
* **Diseño:** pantalla centrada sobre `--surface-canvas`, con el logo en variante oscura y `.btn--primary`.
* **Backend:** BE-38 y BE-39. Se puede montar con MSW; el flujo real está bloqueado por el acceso a Google Cloud.

## Estimación
3 Puntos de Historia (Pantalla simple; la complejidad está en el backend)

## Prioridad
Crítica

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE06-01 | **Vista de login** Centrada, con logo y botón único. | - | Pendiente |
| T-FE06-02 | **Inicio del flujo** Redirección al endpoint de autorización del backend. | - | Pendiente |
| T-FE06-03 | **Mensajes de rechazo** Distinguir cuenta no autorizada de error del sistema. | - | Pendiente |
| T-FE06-04 | **Redirección si ya hay sesión** Comprobación al montar la vista. | - | Pendiente |
| T-FE06-05 | **Pruebas** Escenarios 3, 4 y 5 con MSW. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
