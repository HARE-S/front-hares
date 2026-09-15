# Instrucciones de despliegue — Frontend

> Interfaz de **HARE-S** (Peñascal).
> Cubre la compilación, el contenedor que sirve los estáticos y el proxy de entrada.
> La base de datos y la API están en `back-hares/guide/deployment.md`.

---

## 1. Objetivo

Compilar la interfaz y servirla como ficheros estáticos desde nginx, con el proxy como único punto de entrada del sistema.

**No hay Node en producción.** Node se usa solo para compilar; lo que se despliega es HTML, CSS y JavaScript servidos por nginx.

---

## 2. Dónde vive cada pieza

El sistema se orquesta desde **`back-hares/docker-compose.yml`**, que construye ambos repositorios. Los tres servicios implicados en la interfaz:

| Servicio | Imagen | Función | Puertos |
|---|---|---|---|
| `frontend` | Propia, base `nginx:1.27-alpine` | Sirve los estáticos compilados | Ninguno |
| `proxy` | `nginx:1.27-alpine` | Único punto de entrada | `80:80` |
| `backend` | Propia | La API | Ninguno en producción |

```
back-hares/
├── docker-compose.yml          # orquesta todo el sistema
└── nginx/nginx.conf            # configuración del PROXY

front-hares/
├── Dockerfile                  # multietapa
└── nginx.conf                  # configuración del servidor de ESTÁTICOS
```

> **Requisito:** `back-hares/` y `front-hares/` deben estar como carpetas hermanas en el disco. El compose tiene `build: ../front-hares`. Si alguien clona solo el backend, no arranca.

### Dos nginx que no hacen lo mismo

Los dos ficheros se llaman `nginx.conf` y ahí está buena parte de la confusión. Se distinguen por su contenido:

- El del **frontend** tiene `root` y `try_files`: **sirve ficheros** del disco.
- El del **proxy** tiene `upstream` y `proxy_pass`: **reparte tráfico** entre servicios.

`frontend` no está expuesto y solo recibe peticiones del `proxy`.

---

## 3. Dockerfile multietapa

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Por qué multietapa.** La imagen final contiene solo el resultado de `npm run build`. Sin `node_modules`, sin código fuente, sin Node. Se pasa de cientos de megabytes a unos pocos, y desaparece de producción todo el árbol de dependencias de desarrollo, que es superficie de ataque que no aporta nada una vez compilado.

**`npm ci` y no `npm install`.** `ci` instala exactamente lo que dice `package-lock.json`. `install` puede resolver versiones distintas y producir una compilación diferente a la que probaste.

**Copiar los manifiestos antes que el resto** aprovecha la caché: mientras no cambien las dependencias, `npm ci` no se vuelve a ejecutar.

> **Sobre las imágenes DHI.** El diagrama del cliente especificaba `dhi.io/nginx:1.31.5-alpine3.24-fips`. Son **Docker Hardened Images, un producto de suscripción**, y esa etiqueta no existe en el registro público. Mientras no se confirme que el centro tiene acceso, se usan las oficiales.

---

## 4. Configuración de nginx del frontend

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-store, must-revalidate";
        expires 0;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    server_tokens off;
}
```

Dos reglas causan fallos difíciles de diagnosticar si faltan:

**`try_files ... /index.html`.** Sin esta línea, recargar la página en `/students/abc-123` devuelve un `404` de nginx. Esa ruta existe para vue-router, no para el servidor de ficheros. El síntoma típico: navegar funciona, pulsar F5 rompe la aplicación.

**La política de caché de `index.html`.** Vite pone un hash en el nombre de cada fichero de `assets/`, así que cachearlos es seguro: si cambian, cambia el nombre. Pero `index.html` es el que apunta a esos nombres. Si se cachea, el navegador seguirá pidiendo la versión anterior después de desplegar y los usuarios verán la aplicación vieja sin entender por qué. Es el fallo de despliegue más frecuente en frontends compilados.

---

## 5. Configuración del proxy

Vive en `back-hares/nginx/nginx.conf`. Se monta como fichero completo, de ahí los bloques `events` y `http`:

```nginx
events {}

http {
    upstream backend  { server backend:5000; }
    upstream frontend { server frontend:80; }

    server {
        listen 80;
        server_name _;
        client_max_body_size 10m;

        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

**`X-Forwarded-Proto`** permite al backend saber que la petición original era HTTPS. Sin esta cabecera, el flujo de Google OAuth construye la URL de retorno con `http://` y Google la rechaza por no coincidir con la registrada.

**`client_max_body_size 10m`.** Por defecto nginx corta en 1 MB, y la subida del CSV de importación fallaría con un `413`.

**El proxy no lleva `Dockerfile`.** Usa la imagen oficial y se le monta el `nginx.conf` con `volumes` en modo solo lectura. Así se cambia el enrutado y se reinicia sin reconstruir nada.

---

## 6. Despliegue

### Primera vez

```bash
docker network create public          # red externa, Docker no la crea sola
cd back-hares
docker compose build
docker compose up -d
```

La aplicación queda en `http://localhost`.

### Solo cambios de interfaz

```bash
cd back-hares
docker compose build frontend
docker compose up -d frontend
```

No hace falta tocar backend ni base de datos.

### Producción

```bash
docker compose -f docker-compose.yml up -d
```

**Sin el override.** El `docker-compose.override.yml` expone puertos directos de `backend` y `database` para desarrollo, y en producción solo debe publicar el proxy. Docker une base y override automáticamente salvo que se indique el fichero de forma explícita.

---

## 7. Verificación

```bash
# La interfaz carga
curl -I http://localhost/
# 200, content-type: text/html

# Las rutas del cliente funcionan al recargar
curl -I http://localhost/students/cualquier-cosa
# 200, NO 404. Si da 404, falta el try_files

# La API está enrutada
curl -i http://localhost/api/health
# 200 con {"status":"ok"}

# Los endpoints protegidos siguen protegidos
curl -i http://localhost/api/v1/students
# 401. Que el frontend esté delante no cambia nada

# El frontend NO alcanza la base de datos
docker compose exec frontend sh -c "nc -zv database 5432"
# debe FALLAR: "bad address" es la respuesta correcta

# La configuración del proxy es válida
docker compose exec proxy nginx -t

# No hay secretos en el paquete compilado
docker compose exec frontend grep -ri "secret\|password" /usr/share/nginx/html/assets/ || echo "limpio"
```

Cualquier coincidencia en la última es una credencial publicada. Hay que **rotarla**, no solo borrarla.

---

## 8. Variables de entorno

Se resuelven **en tiempo de compilación**, no de ejecución. Cambiar una obliga a reconstruir la imagen.

```bash
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=HARE-S
```

**Todo lo que se ponga aquí queda visible en el navegador.** Ninguna clave, ningún secreto.

---

## 9. Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `404` al recargar una ruta | Falta `try_files` | Apartado 4 |
| Los usuarios ven la versión anterior tras desplegar | `index.html` cacheado | Apartado 4 |
| Login correcto pero todo devuelve `401` | Falta `credentials: 'include'` en `fetch` | `structure.md`, apartado 3 |
| La cookie no se guarda | Sin HTTPS y la cookie es `Secure` | Configurar TLS |
| Google rechaza la redirección | Falta `X-Forwarded-Proto` o URI no registrada | Apartado 5 |
| `413` al subir el CSV | `client_max_body_size` | Apartado 5 |
| Errores de CORS | Se usa una URL absoluta de API | Usar `/api/v1` relativa |
| `manifest unknown` al construir | Etiqueta de imagen inexistente | Apartado 3 |
| `network public ... could not be found` | Falta crear la red | Apartado 6 |
| `port is already allocated` | Otro contenedor ocupa el puerto | `docker ps` y parar el culpable |

---

## 10. Pendiente: TLS

En producción **TLS es obligatorio**, no una recomendación: las cookies de sesión llevan el atributo `Secure`, así que sin HTTPS el navegador no las envía y el login sencillamente no funciona.

Cuando haya dominio y certificado, el proxy necesita un `server` en el 443 con `ssl_certificate`, y una redirección desde el 80. Bloqueado hasta que el cliente facilite dominio y certificado.

---

## 11. Antes de entregar

- [ ] Recarga con F5 en una ruta profunda
- [ ] Login completo con cuenta `@grupopenascal.com`
- [ ] Caducidad de sesión: se llega al login sin pantalla rota y sin perder lo tecleado
- [ ] Un usuario sin permiso ve mensaje de acceso denegado, no un bucle de login
- [ ] Sin secretos en el paquete compilado
- [ ] Probado en el navegador que use el centro
- [ ] Registro en lote usable en tableta
- [ ] El informe de alumno se imprime sin la navegación

---

*Última actualización: 15/09/2026 · Ver también `structure.md`, `testing.md` y `workflow.md` · Servidor en `back-hares/guide/deployment.md`*
