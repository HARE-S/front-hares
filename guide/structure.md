# Estructura del proyecto — Frontend

> Interfaz de **HARE-S**, Programa de Gestión de Mejora de Comprensión Lectora (Peñascal).
> **Stack: Vue 3 + Vite + JavaScript + CSS puro + Vitest.**
> Define dónde vive cada cosa. Si hay que crear una carpeta que no aparece aquí, primero se añade aquí y luego se crea.
> La estructura del servidor está en `back-hares/guide/structure.md`.

---

## 1. Decisiones de stack

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | **Vue 3**, Composición | Decisión del equipo |
| Compilación | **Vite** | Produce estáticos listos para nginx, sin Node en producción |
| Lenguaje | **JavaScript** | Decisión del equipo. Ver la nota de abajo |
| Estilos | **CSS puro con variables nativas** | Sin dependencias, sin compilación extra, y el sistema de diseño se cambia sin recompilar |
| Pruebas | **Vitest + @vue/test-utils + jsdom** | Comparte configuración con Vite |
| Rutas | **vue-router** | Pendiente de instalar |
| Simulación de API | **MSW** | Pendiente de instalar. Ver `testing.md` |

### La consecuencia de ir sin TypeScript

Con JavaScript, un cambio en un esquema del backend **no produce ningún error hasta que alguien abre la pantalla**. No hay red de seguridad en compilación.

Eso no lo convierte en mala elección, pero sí obliga a compensarlo en dos sitios:

- **Los servicios validan la forma de lo que reciben** antes de devolverlo a los componentes, para que el fallo salte donde se puede diagnosticar y no tres capas más arriba.
- **Los simulacros de MSW replican la forma exacta de la API.** Si el backend devuelve `vef` y el simulacro devuelve `effectiveSpeed`, las pruebas pasan en verde y la pantalla se rompe al conectar.

Si en algún momento el equipo quiere la red de seguridad, se puede añadir JSDoc con tipos y activar `checkJs` en el editor sin migrar a TypeScript.

---

## 2. Árbol de directorios

```
front-hares/
├── Dockerfile                  # multietapa: Node compila, nginx sirve
├── nginx.conf                  # sirve estáticos. NO es el proxy
├── .dockerignore
├── package.json
├── vite.config.js
├── index.html
│
├── guide/                      # esta documentación
│   ├── BACKLOG.md
│   ├── deployment.md
│   ├── structure.md
│   ├── testing.md
│   └── workflow.md
│
├── public/                     # servido tal cual: favicon, manifest
│
└── src/
    ├── main.js                 # punto de entrada: monta la app y el router
    ├── App.vue                 # raíz: solo el layout y el <router-view>
    │
    ├── router/
    │   └── index.js            # definición de rutas y guardas de navegación
    │
    ├── assets/
    │   ├── logo.svg            # logo del conejo, variante oscura
    │   ├── logo-light.svg      # variante clara, para la barra lateral
    │   └── styles/
    │       ├── tokens.css      # variables de diseño. Única fuente de color
    │       ├── base.css        # reset, tipografía, layout, impresión
    │       └── components.css  # clases reutilizables
    │
    ├── layout/
    │   ├── AppShell.vue        # rejilla barra lateral + contenido
    │   ├── AppSidebar.vue      # navegación persistente
    │   └── AppHeader.vue       # cabecera con grupo activo y usuario
    │
    ├── views/                  # una carpeta por pantalla
    │   ├── login/
    │   ├── pending/            # usuario sin rol asignado
    │   ├── dashboard/
    │   ├── centers/            # navegación FE-25 (centros → secciones → alumnado)
    │   │   ├── CentersListView.vue
    │   │   ├── CenterDetailView.vue
    │   │   └── SectionStudentsView.vue
    │   ├── section-detail/
    │   ├── student-detail/
    │   ├── bulk-entry/         # registro de resultados en lote
    │   ├── tests-catalog/
    │   ├── books-catalog/
    │   ├── import/
    │   ├── reports/
    │   └── users-admin/
    │
    ├── components/
    │   ├── ui/                 # sin conocimiento del dominio
    │   │   ├── BaseButton.vue
    │   │   ├── BaseInput.vue
    │   │   ├── BaseTable.vue
    │   │   ├── BaseModal.vue
    │   │   └── StateBlock.vue  # cargando / vacío / error / sin permiso
    │   ├── domain/             # conocen el dominio lector
    │   │   ├── LevelBadge.vue  # bandas de velocidad eficaz
    │   │   ├── MetricCard.vue
    │   │   ├── DeltaPill.vue   # progreso entre pruebas
    │   │   └── TestTypeBadge.vue  # funcional / literario
    │   └── charts/
    │
    ├── services/               # ÚNICO punto de contacto con la API
    │   ├── api.js              # cliente base: sesión, 401, 403, errores
    │   ├── authService.js
    │   ├── directoryService.js # centros, secciones y alumnado (FE-25, BE-10)
    │   ├── studentService.js
    │   ├── resultsService.js
    │   ├── testsService.js
    │   ├── booksService.js
    │   ├── importService.js
    │   └── reportsService.js
    │
    ├── composables/
    │   ├── useAuth.js          # usuario actual y rol
    │   ├── useFetch.js         # cargando / error / datos
    │   └── usePagination.js
    │
    ├── utils/
    │   ├── format.js           # fechas, decimales, PPM, velocidad eficaz
    │   └── validation.js
    │
    └── tests/
        ├── mswSetup.js           # registra los handlers MSW (dev)
        ├── handlers/             # respuestas simuladas por módulo
        │   ├── authHandlers.js
        │   ├── dashboardHandlers.js
        │   ├── testsHandlers.js
        │   ├── booksHandlers.js
        │   ├── importHandlers.js
        │   └── sectionsHandlers.js   # centros/secciones/alumnado (FE-25)
        └── *.spec.js             # pruebas por módulo (centers, directoryService, ...)
```

---

## 3. La regla que no se rompe: nada de `fetch` suelto

**Todas las llamadas a la API pasan por `services/`.** Ni una petición dentro de un componente.

El motivo es concreto. Cuando la sesión caduque, el backend devolverá `401` a cualquier petición. Con un cliente central, ese caso se maneja en un sitio y toda la aplicación reacciona igual. Con `fetch` repartido por veinte componentes, hay veinte sitios donde acordarse — y en alguno no se acordará nadie, así que el usuario verá una pantalla rota en lugar de la de login.

```js
// src/services/api.js
const BASE_URL = '/api/v1';

export async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',          // imprescindible: la sesión va en cookie
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (response.status === 401) {
    redirectToLogin();
    throw new UnauthorizedError();
  }
  if (response.status === 403) {
    throw new ForbiddenError();      // hay sesión, falta permiso: NO redirigir
  }
  if (!response.ok) {
    throw await parseApiError(response);
  }
  if (response.status === 204) return null;

  return response.json();
}
```

Dos detalles que se olvidan constantemente:

**`credentials: 'include'`.** La sesión viaja en una cookie `HttpOnly` que `fetch` **no envía por defecto**. Sin esta opción, todas las peticiones llegan sin sesión y el backend responde `401`. El síntoma desconcierta: el login funciona, y nada más funciona.

**`401` y `403` no son lo mismo.** `401` significa «no sé quién eres» → al login. `403` significa «sé quién eres y no puedes» → mensaje de permiso insuficiente. Redirigir al login ante un `403` mete al usuario en un bucle: entra, vuelve a intentarlo, vuelve a salir.

---

## 4. La sesión no se toca desde JavaScript

El backend usa cookies `HttpOnly`. Eso significa que **el frontend nunca ve ni maneja un token**.

En consecuencia:

- **Nunca** guardar nada de sesión en `localStorage` ni `sessionStorage`. No hay nada que guardar, y si lo hubiera sería accesible a cualquier script inyectado en la página.
- Para saber si hay sesión se pregunta al backend: `GET /api/v1/auth/me`. Si responde `200`, hay sesión; si `401`, no.
- El estado del usuario vive en `useAuth`, en memoria. Al recargar la página se vuelve a preguntar.

Si aparece código que lee un token de `localStorage`, se ha colado un patrón de otro proyecto. Esta arquitectura no lo usa.

> **Pendiente de limpiar:** `api.js` envía hoy una cabecera `X-User-Role`. Funciona con el bypass de desarrollo del backend, pero es una cabecera que el cliente controla: en producción cualquiera se declararía coordinador. Debe desaparecer en cuanto la sesión de servidor esté disponible.

---

## 5. Estilos: CSS puro con variables

Tres ficheros en `assets/styles/`, en cascada:

- **`tokens.css`** — todas las variables: colores, tipografía, espaciado, radios, sombras. **Única fuente de verdad del color.**
- **`base.css`** — reset, tipografía, rejilla, responsive, impresión.
- **`components.css`** — clases reutilizables: `.btn`, `.card`, `.metric`, `.badge`, `.table`, `.input`.

Se cargan una vez en `main.js`:

```js
import './assets/styles/components.css'   // importa base.css, que importa tokens.css
```

### Las dos reglas

**Ningún componente escribe un color en crudo.** Siempre `var(--brand-forest)`, nunca `#0f3e2e`. Es lo que permite cambiar la paleta entera tocando un fichero.

**Lo específico de una pantalla va en su `<style scoped>`.** Si un estilo lo usan dos pantallas, sube a `components.css`. Antes no: promocionarlo demasiado pronto produce clases con siete variantes para cubrir casos que nunca llegaron.

```vue
<style scoped>
.student-header {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--surface-card);
  border-radius: var(--radius);
}
</style>
```

### Lo que el sistema de diseño ya resuelve

- **Bandas de nivel lector** — `.badge--high`, `--normal`, `--low` sobre velocidad eficaz.
- **`.badge--nodata`** — ausencia de dato. **Nunca usar `--low` para esto:** un alumno que no ha hecho la prueba no es un alumno que va mal, y confundirlos hace que el coordinador intervenga sobre quien no lo necesita.
- **`.badge--anomalous`** — resultado fuera de rango plausible, probable error de tecleo.
- **Cifras tabulares** — activadas en tablas y métricas. Sin ellas, las columnas de PPM y porcentajes bailan y comparar dos filas cuesta el doble.
- **Estilos de impresión** — el informe individual se imprime para la familia; sin ellos saldría la navegación.

---

## 6. Vistas y componentes

**`views/`** — una carpeta por pantalla, con el nombre de la funcionalidad y no del componente:

```
views/student-detail/
├── StudentDetailView.vue     # composición y carga de datos
├── ResultsTable.vue          # piezas propias de esta pantalla
├── EvolutionChart.vue
└── index.js
```

Un componente sube a `components/` solo cuando lo usa **una segunda pantalla**.

**`components/ui/`** — sin conocimiento del dominio. Un `BaseTable` no sabe qué es un alumno: recibe columnas y filas.

**`components/domain/`** — sí lo conocen. `LevelBadge` recibe una velocidad eficaz y decide la banda; `DeltaPill` recibe una variación y decide el signo y el color.

Esa separación importa: los de `ui/` se prueban con datos inventados, los de `domain/` encapsulan reglas que deben coincidir con el backend.

---

## 7. Composables en vez de gestor de estado

Con el tamaño actual, un gestor de estado global es más ceremonia que ayuda. Se usan composables:

```js
// src/composables/useAuth.js
import { ref, computed } from 'vue';
import { getCurrentUser } from '@/services/authService';

const user = ref(null);
const loading = ref(true);

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null);
  const isPending = computed(() => user.value?.role === 'pending');
  const hasRole = (...roles) => roles.includes(user.value?.role);

  async function load() { /* ... */ }
  return { user, loading, isAuthenticated, isPending, hasRole, load };
}
```

El `ref` fuera de la función hace que el estado se comparta entre todos los componentes que lo usen.

**Cuándo pasar a Pinia:** si aparecen tres o más composables con estado compartido que se necesitan entre sí. Antes no.

---

## 8. Tipos alineados con el backend

Sin TypeScript no hay tipos que compilar, pero sí hace falta un sitio donde esté escrito qué forma tiene cada recurso. Va en los servicios, en JSDoc:

```js
/**
 * @typedef {Object} Result
 * @property {string} id
 * @property {string} student_id
 * @property {string} test_date    ISO 8601
 * @property {number} time         segundos
 * @property {number} successes
 * @property {number} mistakes
 * @property {number} ppm          velocidad espontánea
 * @property {number} comprehension porcentaje ponderado
 * @property {number} vef          velocidad eficaz
 */
```

**La fuente de verdad es la especificación OpenAPI del backend**, no lo que uno recuerde de una reunión. Si cambia un esquema allí, el JSDoc y el simulacro de MSW se actualizan **en la misma Pull Request**.

---

## 9. Variables de entorno: cuidado

Vite incorpora las variables `VITE_*` **al código compilado**. Cualquiera puede leerlas abriendo el navegador.

```bash
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=HARE-S
```

**Nunca poner aquí credenciales ni claves.** No es mala práctica: es que quedan publicadas literalmente. El `client_secret` de Google vive solo en el backend.

Sobre `VITE_API_BASE_URL=/api/v1`: al ir frontend y backend detrás del mismo proxy, la ruta relativa evita CORS por completo. Una URL absoluta obligaría a configurar CORS y a distinguir entornos sin necesidad.

---

## 10. Convenciones

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | `PascalCase.vue` | `StudentDetailView.vue` |
| Composables | `useAlgo.js` | `useAuth.js` |
| Servicios | `recursoService.js` | `resultsService.js` |
| Carpetas | `kebab-case` | `bulk-entry/` |
| Funciones y variables | `camelCase` | `calculateDelta()` |
| Clases CSS | `kebab-case`, BEM ligero | `.metric__value`, `.badge--high` |

**Idioma:** código, nombres y comentarios **en inglés**. Textos visibles para el usuario **en castellano** y centralizados, no repartidos por los componentes, por si algún día hace falta euskera.

---

## 11. Qué no va al repositorio

```gitignore
node_modules/
dist/
.env
*.env
!.env.example
.vite/
coverage/
```

`dist/` se genera en el `Dockerfile`. Subirlo provoca conflictos constantes en ficheros compilados que nadie sabe resolver.

---

*Última actualización: 19/09/2026 · Ver también `deployment.md`, `testing.md` y `workflow.md` · Servidor en `back-hares/guide/structure.md`*
