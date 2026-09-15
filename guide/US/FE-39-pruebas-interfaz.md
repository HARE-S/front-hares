# Historia de Usuario

## ID
[FE-39]

## Título
Batería de pruebas de interfaz

## Descripción
**Como** desarrollador
**Quiero** una batería de pruebas de lo que la interfaz decide por su cuenta

**Para** poder cambiar pantallas sin romper el manejo de sesión ni el de errores.

## Criterios de Aceptación

### Escenario 1: Simulación a nivel de red
```gherkin
Dado la suite de pruebas
Cuando una prueba necesita datos de la API
Entonces se interceptan las peticiones HTTP con MSW
Y NO se sustituyen los servicios por funciones falsas
```

### Escenario 2: Pruebas obligatorias presentes
```gherkin
Dado la suite completa
Cuando se revisa su contenido
Entonces incluye el manejo del 401 y del 403
Y la presencia de credentials include
Y la conservacion de lo tecleado al fallar un envio
Y los valores frontera de las bandas de nivel
```

### Escenario 3: Consultas accesibles
```gherkin
Dado las pruebas de componentes
Cuando buscan elementos en el DOM
Entonces lo hacen por rol o por etiqueta
Y no por clase CSS
```

### Escenario 4: Simulacros fieles
```gherkin
Dado un manejador de MSW
Cuando devuelve un recurso
Entonces su forma coincide exactamente con la de la especificacion OpenAPI
Y los nombres de campo son identicos a los del backend
```

### Escenario 5: La compilación forma parte de la verificación
```gherkin
Dado una rama lista para fusionar
Cuando se ejecuta la verificacion
Entonces pasan las pruebas
Y npm run build termina sin errores
```

### Escenario 6: Sin pruebas desactivadas
```gherkin
Dado la suite antes de fusionar
Cuando se revisa
Entonces ninguna prueba esta marcada para omitirse
```

## Notas
* **El escenario 1 es la decisión clave.** Si se sustituyen los servicios, se deja de probar el cliente de API, que es donde vive el manejo del `401` —lo más importante de esta capa—.
* **El escenario 4 es especialmente importante aquí por ir sin TypeScript.** Un simulacro que devuelva `effectiveSpeed` donde el backend devuelve `vef` hace pasar todas las pruebas y rompe la pantalla al conectar, y nada lo detecta antes.
* **El escenario 6:** una prueba desactivada es un fallo conocido que se ha decidido ignorar, y nadie vuelve a mirarlo.
* **Dependencias:** requiere instalar `msw` y `@testing-library/vue`.

## Estimación
5 Puntos de Historia (Infraestructura de pruebas más las obligatorias)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE39-01 | **Instalar y configurar MSW** Con arranque en `tests/setup.js`. | - | Pendiente |
| T-FE39-02 | **Manejadores base** Copiados de la especificación OpenAPI. | - | Pendiente |
| T-FE39-03 | **Ayudantes de montaje** Con router y contextos ya puestos. | - | Pendiente |
| T-FE39-04 | **Pruebas del cliente de API** `401`, `403`, `204` y credenciales. | - | Pendiente |
| T-FE39-05 | **Pruebas de formateo y bandas** Valores frontera incluidos. | - | Pendiente |
| T-FE39-06 | **Umbrales de cobertura** Por capa, según `guide/testing.md`. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
