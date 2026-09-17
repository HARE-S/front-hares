# workflow.md — Frontend

> Interfaz de **HARE-S** (Peñascal).
> El apartado 4 (Git) es **común a todo el equipo** y está duplicado en `back-hares/guide/workflow.md`. Si cambia, se cambia en los dos ficheros **en el mismo commit**.

---

## 1. Principios

- **Agilidad y autonomía.** Scrum con sprints de dos semanas: daily, planning, review y retrospectiva.

- **Calidad garantizada.** Ninguna pantalla se da por terminada sin pruebas. Objetivos por capa en `testing.md`: `utils/` 90%, `services/` 85%, `components/domain/` 80%.

- **Seguridad por diseño.** Ocultar un botón no protege nada. La interfaz oculta para no confundir; quien protege es el backend. Toda pantalla contempla desde el diseño qué ve cada rol y qué pasa con un `401` y con un `403`.

- **La interfaz no espera al backend.** Se acuerda el contrato, se simula con MSW y se desarrolla. Apartado 2.1.

- **Estados incompletos desde el principio.** Cargando, vacío, error y sin permiso forman parte de la pantalla, no son un añadido posterior. Una pantalla que solo contempla el caso feliz parece terminada en la demostración y se rompe el primer día de uso real.

- **Colaboración humano-IA.** El agente propone; el humano decide. Reparto en el apartado 5.

---

## 2. Proceso para una historia de usuario

### 2.1 Análisis

Leer la historia y sus criterios de aceptación. Cada criterio suele traducirse en algo visible o accionable; si uno no se traduce en nada, hay que aclararlo antes de programar.

Identificar qué datos necesita la pantalla y de qué endpoints salen. **La fuente de verdad es la especificación OpenAPI del backend**, no lo que uno recuerde de una reunión.

Si el endpoint aún no existe:

1. Se acuerda su forma con quien lleve la historia de backend.
2. Se escribe el JSDoc del recurso en su servicio.
3. Se añade un manejador de MSW con esa forma exacta.
4. Se desarrolla contra el simulacro. Cuando llegue el endpoint real, quitar el manejador debe bastar.

Si al conectar hay que cambiar código de la interfaz, la forma acordada no era la implementada. Esa conversación sale más barata al principio que al final.

| Quién | Qué hace |
|---|---|
| **Agente** | Propone la lista de estados de pantalla y los casos de error a cubrir |
| **Humano** | Valida contra los criterios de aceptación y acuerda el contrato con backend |

### 2.2 Descomposición

Tareas técnicas independientes con identificador `FE-<historia>-T<n>`:

```
FE-26 — Ficha del alumno
├── FE-26-T1  Servicio y JSDoc de StudentDetail
├── FE-26-T2  Vista y estados (carga, vacío, error, sin permiso)
├── FE-26-T3  Tabla de histórico con PPM, comprensión y velocidad eficaz
├── FE-26-T4  Gráfico de evolución
└── FE-26-T5  Pruebas
```

Una tarea debe caber en una jornada. Si no cabe, se parte.

### 2.3 Ciclo por tarea

**a. Análisis técnico** — qué componentes existen ya y cuáles hay que crear. Un componente sube a `components/` solo cuando lo usa una **segunda** pantalla; promocionarlo antes produce componentes con siete propiedades para cubrir casos que nunca llegaron.

**b. Contrato de datos** — qué recibe la pantalla y con qué forma exacta, escrito como JSDoc en el servicio.

**c. Validación del diseño** — **el humano valida el contrato antes de escribir código.** Implica dos partes: backend confirma que devolverá eso, e interfaz confirma que con eso basta.

**d. Implementación**

1. **Servicio primero**, en `services/`, siempre a través de `api.js`. **Ni un `fetch` suelto en un componente.**
2. **Vista** en `views/`, con sus cuatro estados.
3. **Estilos** con las variables de `tokens.css`. Ningún color en crudo.
4. **Pruebas** de lo que aplique del apartado 6 de `testing.md`.

Código, nombres y comentarios **en inglés**. Textos visibles **en castellano** y centralizados.

**e. Ejecución y depuración**

```bash
npm run test
npm run build
```

`npm run build` no es opcional: detecta importaciones rotas y errores que el modo desarrollo tolera. Una rama que no compila bloquea a todo el equipo.

**f. Validación final de la tarea** — el humano revisa código, capturas y resultados.

### 2.4 Validación final de la historia

- **Integración real:** probado contra el backend levantado en Docker, no solo contra MSW. Los simulacros ocultan desajustes de formato — un `vef` frente a un `effectiveSpeed` pasa todas las pruebas y rompe la pantalla al conectar.
- **Recorrido completo:** entrar, usar la pantalla, recargar con F5 en su ruta.
- **Sesión caducada:** se llega al login sin pantalla rota.
- **Documentación:** si cambió algo de `guide/`, se actualiza en el mismo commit.
- **Sprint review:** se demuestra sobre el entorno desplegado en `http://localhost`, **nunca desde `npm run dev`**. El modo desarrollo oculta justo los fallos de compilación, caché y enrutado que aparecen al desplegar.

---

## 3. Definición de terminado

- [ ] Todos los criterios de aceptación se cumplen
- [ ] Estados de carga, vacío, error y sin permiso contemplados
- [ ] `401` lleva al login; `403` muestra permiso insuficiente sin bucle
- [ ] Pruebas de `testing.md` que apliquen
- [ ] `npm run build` sin errores
- [ ] Probado contra el backend real en Docker
- [ ] Recarga con F5 funciona en la ruta de la pantalla
- [ ] Sin colores en crudo: todo sale de `tokens.css`
- [ ] Sin secretos en variables `VITE_*`
- [ ] Textos de interfaz en castellano, código en inglés

Que se vea bien en `npm run dev` no es que esté terminado.

---

## 4. Git *(común a todo el equipo)*

### Ramas

| Rama | Uso |
|---|---|
| `main` | Solo código desplegado o desplegable. Protegida |
| `dev` | Integración del sprint |
| `feature/FE-XX-descripcion` | Una rama por historia |
| `fix/descripcion` | Corrección sobre `dev` |
| `hotfix/descripcion` | Urgente: sale de `main` y vuelve a `main` y `dev` |

```bash
git checkout dev && git pull origin dev
git checkout -b feature/FE-26-student-detail
```

Siempre desde `dev` actualizado. Ramificar desde una rama vieja garantiza un conflicto que nadie ha causado.

### Commits

Conventional Commits, **en inglés**:

```
feat(students): add student detail view with evolution chart
fix(api): send credentials on every request
style(tokens): add nodata level badge variant
test(forms): cover bulk entry validation
docs(guide): document nginx cache policy
refactor(services): extract error parsing from api client
chore(deps): add msw and testing-library
```

Tipos: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `style`. Un commit, un cambio con sentido propio; nada de `wip`.

### Antes de la Pull Request

```bash
git fetch origin && git rebase origin/dev
npm run test
npm run build
git push -u origin feature/FE-26-student-detail
```

**Nunca hacer `rebase` de una rama que otra persona ya haya descargado.**

### Plantilla de PR

```markdown
## Historia
FE-26 — Ficha del alumno

## Tareas incluidas
FE-26-T1, FE-26-T2, FE-26-T3

## Endpoints consumidos
GET /api/v1/students/{id}

## Criterios de aceptación cubiertos
- [x] Datos personales y secciones
- [x] Histórico con PPM, comprensión y velocidad eficaz
- [x] Gráfico de evolución
- [ ] Filtro por rango de fechas (sale en FE-31)

## Cómo probarlo
cd ../infra-hares && docker compose up -d && navegar a /students/<id>

## Capturas
[antes / después]
```

Condiciones para fusionar: `build` y `test` en verde, capturas si hay cambios visuales, sin secretos, y **aprobada por otra persona**.

**Nadie fusiona su propia PR sin revisión.** No está para desconfiar de quien escribe: está para que al menos dos personas conozcan cada parte del sistema.

### Etiquetas

```bash
git tag -a v1.2.0 -m "Sprint 5: ficha del alumno y registro en lote"
git push origin v1.2.0
```

> **Pendiente:** con repositorios separados, una versión del producto son dos versiones. Hay que decidir quién fija la combinación desplegada.

---

## 5. Colaboración humano-IA

El agente recibe como contexto los ficheros de `guide/`.

### Reparto de responsabilidad

| Decisión | Quién |
|---|---|
| Contrato de datos con el backend | **Humano**, acordado con backend |
| Qué ve cada rol en cada pantalla | **Humano** |
| Estructura de navegación y rutas | **Humano** |
| Descomposición y prioridad de tareas | **Humano** |
| Maquetación y componentes a partir del contrato | Agente |
| Casos de prueba y estados de error | Agente propone; humano valida |
| Refactorización interna sin cambio de contrato | Agente |

### Patrones que el agente va a sugerir y que aquí **no** aplican

Son los cinco errores más probables, porque abundan en los ejemplos de internet y contradicen decisiones ya tomadas:

- **Instalar Tailwind.** Se usa CSS puro con variables nativas. Si algo falta, se añade a `tokens.css`.
- **Escribir colores en crudo** (`#0f3e2e`). Todo sale de `var(--brand-forest)`.
- **Guardar un token en `localStorage`.** La sesión es una cookie `HttpOnly`; el frontend nunca ve un token. No hay nada que guardar.
- **`fetch` directo dentro de un componente.** Todo pasa por `services/`, o el manejo del `401` acaba repartido en veinte sitios y olvidado en alguno.
- **Olvidar `credentials: 'include'`.** Sin eso, la cookie no viaja y todo devuelve `401` tras un login aparentemente correcto.
- **Configurar CORS.** No hace falta: frontend y backend comparten origen detrás del proxy.

### Reglas

- **Estas guías mandan sobre lo que proponga el agente.**
- **Revisar antes de aceptar.** El código generado es un borrador.
- **Nunca pegar datos reales de alumnado en un prompt.** Son datos de menores; para ejemplos están los datos anónimos del backend.
- **Nunca pegar el `.env`** ni credenciales.
- **Lo que no entiendes, no se fusiona.** Si nadie sabe explicar por qué funciona un fragmento, nadie podrá arreglarlo cuando falle.

Cuando una decisión se toma con el agente y resulta acertada, se escribe en la guía. Si no, se pierde al cerrar la sesión.

---

## 6. Ceremonias

| Cuándo | Qué |
|---|---|
| Diario, 15 min | Qué hice, qué haré, qué me bloquea |
| Inicio de sprint | Selección de historias y estimación conjunta |
| Fin de sprint | Review sobre el entorno Docker, no en local |
| Fin de sprint | Retrospectiva |

---

## 7. Bloqueos

| Bloqueo | Impacto | Quién lo resuelve |
|---|---|---|
| Logo en SVG sin entregar | Barra lateral y favicon | Equipo / cliente |
| Endpoints aún no implementados | Pantallas concretas | Se avanza con MSW (apartado 2.1) |
| Acceso a Google Cloud | Pantalla de login real | Cliente |
| Dominio y certificado TLS | Despliegue en producción | Cliente |
| MSW y testing-library sin instalar | Estrategia de pruebas | Equipo |

Un bloqueo que depende del cliente se escala a Andrés Ocina. No se resuelve inventando una solución provisional que luego nadie recuerda que era provisional.

---

*Última actualización: 15/09/2026 · Ver también `structure.md`, `deployment.md` y `testing.md`*
