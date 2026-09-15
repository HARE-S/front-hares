# Historia de Usuario

## ID
[FE-01]

## Título
Andamiaje del proyecto de interfaz

## Descripción
**Como** desarrollador
**Quiero** el proyecto de interfaz configurado y compilable

**Para** poder empezar a construir pantallas sobre una base estable.

## Criterios de Aceptación

### Escenario 1: Arranque en desarrollo
```gherkin
Dado un equipo con Node instalado
Cuando se ejecuta "npm install" y "npm run dev"
Entonces el servidor de desarrollo arranca en el puerto 5173
Y la aplicacion se muestra en el navegador
```

### Escenario 2: Compilación a estáticos
```gherkin
Dado el proyecto configurado
Cuando se ejecuta "npm run build"
Entonces se genera el directorio dist con HTML, CSS y JavaScript
Y los ficheros de assets llevan hash en el nombre
```

### Escenario 3: Motor de pruebas operativo
```gherkin
Dado el proyecto configurado
Cuando se ejecuta "npm run test"
Entonces Vitest se ejecuta con entorno jsdom
Y las pruebas existentes pasan
```

### Escenario 4: Estructura de carpetas
```gherkin
Dado el proyecto recien creado
Cuando se inspecciona src/
Entonces existen las carpetas definidas en guide/structure.md
Y el alias @ resuelve a src/
```

## Notas
* **Stack:** Vue 3 con Composición, Vite, JavaScript, CSS puro y Vitest.
* **Decisiones:** sin TypeScript por decisión del equipo. Se compensa con JSDoc en los servicios y simulacros de MSW fieles a la forma real de la API. Ver `guide/structure.md`, apartado 1.
* **Pendiente:** `vue-router`, `msw` y `@testing-library/vue` no están instalados y bloquean historias posteriores.

## Estimación
5 Puntos de Historia (Configuración inicial y estructura)

## Prioridad
Crítica

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE01-01 | **Proyecto Vue 3 con Vite** `package.json`, `vite.config.js` y alias `@` hacia `src/`. | - | Completado |
| T-FE01-02 | **Estructura de carpetas** Según `guide/structure.md`. | - | Completado |
| T-FE01-03 | **Vitest con jsdom** Configuración en `vite.config.js` y guion `npm run test`. | - | Completado |
| T-FE01-04 | **Dependencias pendientes** Instalar `vue-router`, `msw` y `@testing-library/vue`. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
