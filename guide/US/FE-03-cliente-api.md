# Historia de Usuario

## ID
[FE-03]

## Título
Cliente de API centralizado

## Descripción
**Como** desarrollador
**Quiero** un único punto de contacto con la API

**Para** manejar la sesión y los errores en un solo sitio y no repartidos por la aplicación.

## Criterios de Aceptación

### Escenario 1: Petición correcta
```gherkin
Dado una peticion a un endpoint existente
Cuando el backend responde 200
Entonces el cliente devuelve el cuerpo ya parseado
Y el componente no manipula la respuesta HTTP
```

### Escenario 2: La cookie de sesión viaja
```gherkin
Dado cualquier peticion del cliente
Cuando se inspecciona la llamada
Entonces incluye credentials include
Y la cookie HttpOnly de sesion se envia al backend
```

### Escenario 3: Sesión caducada
```gherkin
Dado una sesion que ha caducado
Cuando el backend responde 401
Entonces el cliente redirige al login
Y lanza un error de tipo no autorizado
```

### Escenario 4: Permiso insuficiente
```gherkin
Dado un usuario con sesion valida pero sin permiso
Cuando el backend responde 403
Entonces el cliente lanza un error de tipo prohibido
Y NO redirige al login
```

### Escenario 5: Respuesta sin contenido
```gherkin
Dado una operacion de borrado
Cuando el backend responde 204
Entonces el cliente devuelve null
Y no intenta parsear un cuerpo vacio como JSON
```

### Escenario 6: Error del servidor con forma estable
```gherkin
Dado un error 400 o 422 del backend
Cuando el cliente lo recibe
Entonces expone codigo, mensaje y campo afectado
Y la interfaz puede mostrarlo junto al campo sin adivinar
```

### Escenario 7: Ningún fetch fuera de services
```gherkin
Dado el codigo de la aplicacion
Cuando se busca la palabra fetch fuera de la carpeta services
Entonces no aparece ninguna ocurrencia
```

## Notas
* **`credentials: 'include'` es el fallo silencioso más habitual.** La sesión viaja en una cookie `HttpOnly` que `fetch` no envía por defecto. Sin esa opción, el login funciona y absolutamente nada más funciona, todo devuelve `401`.
* **`401` y `403` no son lo mismo.** `401` es «no sé quién eres» y lleva al login; `403` es «sé quién eres y no puedes» y muestra un mensaje. Redirigir ante un `403` mete al usuario en un bucle: entra, reintenta, vuelve a salir.
* **A eliminar:** la cabecera `X-User-Role` que hoy envía `api.js`. Funciona con el bypass de desarrollo del backend, pero es una cabecera que controla el cliente: en producción cualquiera se declararía coordinador.
* **Contrato:** base `/api/v1`, ruta relativa. Mismo origen tras el proxy, así que no hace falta CORS.
* **Testing:** escenarios 2, 3 y 4 son pruebas obligatorias.
* **Backend:** BE-40.

## Estimación
5 Puntos de Historia (Pequeño en líneas, central en consecuencias)

## Prioridad
Crítica

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE03-01 | **Función request** Base `/api/v1`, `credentials: 'include'`, cabeceras JSON. | - | Pendiente |
| T-FE03-02 | **Clases de error** `UnauthorizedError`, `ForbiddenError` y error de validación con campo. | - | Pendiente |
| T-FE03-03 | **Manejo de 401 y 403** Redirección solo en el primero. | - | Pendiente |
| T-FE03-04 | **Respuesta 204** Devolver `null` sin parsear. | - | Pendiente |
| T-FE03-05 | **Retirar X-User-Role** Cuando la sesión de servidor esté disponible. | - | Bloqueado |
| T-FE03-06 | **Pruebas del cliente** Escenarios 2 a 6 con MSW. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
