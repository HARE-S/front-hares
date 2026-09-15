# Historia de Usuario

## ID
[FE-04]

## Título
Dockerización de la interfaz y proxy de entrada

## Descripción
**Como** usuario
**Quiero** acceder a la aplicación por una única dirección

**Para** no tener que conocer puertos ni servicios internos.

## Criterios de Aceptación

### Escenario 1: Imagen ligera
```gherkin
Dado el Dockerfile multietapa
Cuando se construye la imagen
Entonces la imagen final contiene solo los ficheros compilados y nginx
Y no contiene Node ni node_modules ni el codigo fuente
```

### Escenario 2: Un único punto de entrada
```gherkin
Dado el sistema levantado
Cuando se consulta http://localhost/
Entonces responde la interfaz
Y cuando se consulta http://localhost/api/health responde el backend
Y solo el servicio proxy publica puertos al exterior
```

### Escenario 3: Recarga en rutas del cliente
```gherkin
Dado la aplicacion servida
Cuando se recarga la pagina en /students/abc-123
Entonces responde 200 con index.html
Y NO responde 404
```

### Escenario 4: Política de caché
```gherkin
Dado un despliegue nuevo
Cuando el navegador solicita index.html
Entonces la respuesta lleva Cache-Control no-store
Y los ficheros de assets llevan Cache-Control immutable
```

### Escenario 5: Aislamiento de red
```gherkin
Dado el sistema levantado
Cuando el contenedor frontend intenta alcanzar la base de datos
Entonces la conexion falla
Y el nombre database ni siquiera se resuelve
```

## Notas
* **El escenario 3 es el que evita el fallo más desconcertante.** Sin `try_files`, navegar por la aplicación funciona pero pulsar F5 devuelve un 404 de nginx: esa ruta existe para vue-router, no como fichero en disco.
* **El escenario 4 evita el fallo de despliegue más frecuente.** Los ficheros de `assets/` llevan hash y se cachean sin riesgo, pero `index.html` es el que apunta a esos nombres. Si se cachea, los usuarios seguirán viendo la versión anterior tras cada despliegue.
* **Dos nginx distintos:** el del frontend sirve ficheros (`root`, `try_files`); el del proxy reparte tráfico (`upstream`, `proxy_pass`). El proxy no lleva `Dockerfile` porque usa la imagen oficial con el fichero montado.
* **Requisito:** `back-hares/` y `front-hares/` deben estar como carpetas hermanas. El compose tiene `build: ../front-hares`.
* **Antes del primer arranque:** `docker network create public`.

## Estimación
5 Puntos de Historia (Dockerfile multietapa, dos configuraciones de nginx y orquestación)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE04-01 | **Dockerfile multietapa** Node compila con `npm ci`, nginx sirve. | - | Completado |
| T-FE04-02 | **nginx.conf del frontend** `try_files`, caché de assets, `index.html` sin caché, gzip. | - | Completado |
| T-FE04-03 | **.dockerignore** Excluir `node_modules`, `dist`, `.git` y `.env`. | - | Completado |
| T-FE04-04 | **Servicio frontend en el compose** `build: ../front-hares`, red `frontend-network`. | - | Completado |
| T-FE04-05 | **Proxy con su nginx.conf** Enrutado `/api` y estáticos, cabeceras reenviadas. | - | Completado |
| T-FE04-06 | **Verificación** Los cinco escenarios con `curl` y `docker compose exec`. | - | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
