# Estrategia de pruebas — Frontend

> Interfaz de **HARE-S** (Peñascal). Vitest + @vue/test-utils + jsdom.
> Las pruebas del servidor están en `back-hares/guide/testing.md`.

---

## 1. Qué se prueba y qué no

El frontend no contiene lógica de negocio: esa vive en el backend y allí se prueba. Aquí interesa lo que la interfaz decide por su cuenta.

**Sí se prueba:**

1. **El manejo de `401` y `403`.** Que la sesión caduque y el usuario acabe en el login sin pantalla rota, y que un permiso insuficiente no lo meta en un bucle. Es lo que más va a fallar en uso real.
2. **La validación de formularios**, sobre todo la del registro en lote, donde un fallo hace perder veinte filas tecleadas.
3. **El formateo.** Velocidad eficaz, PPM, porcentajes y fechas. Un decimal mostrado con el separador equivocado es un dato mal leído.
4. **Las reglas de presentación del dominio.** Que una velocidad eficaz de 85 caiga en la banda correcta, que una prueba sin datos no se pinte como banda baja.
5. **Los flujos completos**: entrar, registrar un resultado, verlo en la ficha.

**No se prueba:** que Vue renderice, que un botón acepte `@click`, que una librería de gráficos dibuje. Ni pruebas de instantánea de componentes enteros: se rompen con cualquier cambio de maquetación, se regeneran sin mirar y dejan de comprobar nada.

---

## 2. Herramientas

| Herramienta | Uso | Estado |
|---|---|---|
| `vitest` | Motor de pruebas. Comparte configuración con Vite | Instalado |
| `@vue/test-utils` | Montaje de componentes y consultas al DOM | Instalado |
| `jsdom` | Entorno de navegador simulado | Instalado |
| `@testing-library/vue` | Consultas por rol y etiqueta | **Pendiente** |
| `msw` | Simulación de la API a nivel de red | **Pendiente** |

```bash
npm i -D @testing-library/vue @testing-library/user-event msw
```

MSW no es opcional en esta estrategia: el apartado 4 explica por qué.

---

## 3. Organización

Las pruebas viven junto al código que prueban. Renombrar una carpeta no deja pruebas huérfanas en otro árbol.

```
src/
├── services/
│   ├── api.js
│   └── api.test.js
├── utils/
│   ├── format.js
│   └── format.test.js
├── components/domain/
│   ├── LevelBadge.vue
│   └── LevelBadge.test.js
├── views/bulk-entry/
│   ├── BulkEntryView.vue
│   └── BulkEntryView.test.js
└── tests/
    ├── setup.js          # configuración global y arranque de MSW
    ├── handlers.js       # respuestas simuladas de la API
    └── helpers.js        # montaje con router y contextos ya puestos
```

---

## 4. Simular la API en la red, no en el código

La tentación es sustituir los servicios por funciones falsas. **No lo hagáis**: entonces se deja de probar `api.js`, que es donde vive el manejo del `401` — justo lo más importante de esta capa.

Con MSW se interceptan las peticiones HTTP reales. El código de la aplicación se ejecuta entero, incluido el cliente:

```js
// src/tests/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/students/:id', ({ params }) =>
    HttpResponse.json({
      id: params.id,
      name: 'student 1',
      sections: [],
      results: [],
    })
  ),
];
```

Y para un caso concreto se sobrescribe la respuesta:

```js
it('redirige al login cuando caduca la sesión', async () => {
  server.use(
    http.get('/api/v1/students', () => new HttpResponse(null, { status: 401 }))
  );

  render(StudentsView);

  await waitFor(() => expect(router.currentRoute.value.name).toBe('login'));
});
```

**Los datos simulados deben tener la misma forma que los reales.** Si el backend devuelve `vef` y el simulacro devuelve `effectiveSpeed`, las pruebas pasan y la aplicación falla en producción.

Este riesgo es mayor en este proyecto por ir sin TypeScript: no hay compilación que cace el desajuste. La única defensa es que los manejadores de MSW se copien de la especificación OpenAPI y se actualicen en la misma Pull Request que cambie el backend.

---

## 5. Consultar el DOM como lo haría un usuario

```js
// Bien: por lo que el usuario ve
screen.getByRole('button', { name: /guardar resultados/i });
screen.getByLabelText(/tiempo en segundos/i);

// Mal: por detalles internos
wrapper.find('.btn--primary');
```

Buscar por rol y por etiqueta comprueba dos cosas a la vez: que el elemento está y que es accesible. Buscar por clase CSS se rompe al cambiar los estilos, sin que nada haya dejado de funcionar realmente — y con CSS puro y clases como `.btn--primary`, ese acoplamiento es especialmente fácil de crear.

---

## 6. Pruebas obligatorias

| Prueba | Qué protege |
|---|---|
| Un `401` redirige al login | Caducidad de sesión sin pantalla rota |
| Un `403` muestra permiso insuficiente y **no** redirige | El bucle de login |
| Las peticiones incluyen `credentials: 'include'` | El fallo silencioso más habitual |
| Al fallar el envío no se pierde lo tecleado | Perder veinte filas por un error de red |
| Un usuario `pending` ve la pantalla de espera, no datos | Que no se muestre alumnado a quien no debe |
| El registro en lote permite dejar alumnos en blanco | Alumnos ausentes: un blanco no es un cero |
| El registro en lote rechaza valores negativos | Datos imposibles |
| La velocidad eficaz se muestra con el formato correcto | Lectura errónea de un dato |
| Vef de 85 y de 25 caen en la banda correcta | Los valores frontera exactos |
| Una prueba sin datos usa `badge--nodata`, nunca `badge--low` | Que el coordinador no intervenga sobre quien no lo necesita |
| Con menos de dos pruebas se muestra mensaje, no gráfico vacío | Gráficos que sugieren tendencias inexistentes |
| Una proyección se distingue visualmente de un dato medido | Tomar una estimación por un hecho |

Las tres últimas son específicas de este dominio y no las va a sugerir ninguna herramienta: salen de decisiones pedagógicas.

---

## 7. Pruebas con valores frontera

Las bandas de nivel se definen por umbrales exactos, y ahí es donde aparecen los errores de comparación:

```js
import { describe, it, expect } from 'vitest';
import { getReadingLevel } from '@/utils/format';

describe('bandas de nivel lector', () => {
  it.each([
    [0,    'low'],
    [24.9, 'low'],
    [25,   'normal'],   // frontera inferior inclusiva
    [85,   'normal'],   // frontera superior inclusiva
    [85.1, 'high'],
    [-5,   'low'],      // la velocidad eficaz puede ser negativa
    [null, 'nodata'],
  ])('vef %p corresponde a la banda %s', (vef, expected) => {
    expect(getReadingLevel(vef)).toBe(expected);
  });
});
```

El caso negativo no es hipotético: los informes reales del cliente contienen valores como `-13,08`, porque la comprensión ponderada puede salir negativa cuando los errores superan al doble de los aciertos.

---

## 8. Ejecución

```bash
npm run test           # una pasada
npm run test -- --watch
npm run test -- --coverage
```

Dentro de Docker, si hiciera falta:

```bash
docker compose run --rm frontend npm run test
```

---

## 9. Cobertura

| Capa | Mínimo |
|---|---|
| `services/` | 85% |
| `utils/` | 90% |
| `components/domain/` | 80% |
| `views/` | 50% |
| `components/ui/` | sin objetivo |

`services/`, `utils/` y `components/domain/` alto porque contienen decisiones. Las vistas, bajo: probarlas al detalle produce pruebas que se rompen al mover un elemento de sitio.

**El porcentaje global no es la meta.** Si las doce pruebas del apartado 6 existen y pasan, la interfaz está mejor protegida que con un 90% repartido sin criterio.

---

## 10. Antipatrones

| Antipatrón | Por qué falla |
|---|---|
| Sustituir los servicios en lugar de la red | Deja sin probar el manejo del `401` |
| Pruebas de instantánea de componentes enteros | Se regeneran sin mirar; dejan de comprobar |
| Buscar por clase CSS | Se rompen al cambiar estilos sin que nada falle |
| Datos simulados con otra forma que los reales | Verde en pruebas, roto en producción |
| `setTimeout` para esperar | Frágil. Usar `waitFor` |
| Solo pruebas de extremo a extremo | Lentas; al fallar no dicen dónde está el error |
| Datos reales de alumnado | Son datos de menores. Se generan, no se copian |

---

## 11. Extremo a extremo

Pocas y sobre los recorridos que de verdad importan. Con Playwright, cuando llegue el momento:

1. Entrar con cuenta corporativa
2. Registrar un resultado en lote y verlo en la ficha del alumno
3. Importar un fichero y revisar el informe de errores

**Nunca contra producción.** Se ejecutan contra el entorno de pruebas con los datos anónimos del backend. Son datos de menores: no se copian de producción a ningún sitio.

---

## 12. Antes de entregar

- [ ] Sesión caducada: se llega al login sin pantalla rota
- [ ] Usuario sin permiso: mensaje claro, sin bucle
- [ ] Recarga con F5 en una ruta profunda
- [ ] Registro en lote de un grupo completo, con ausentes
- [ ] Exportación a Excel: se descarga y abre bien
- [ ] Probado en el navegador que use el centro
- [ ] Registro en lote usable en tableta
- [ ] El informe de alumno se imprime sin navegación

---

*Última actualización: 15/09/2026 · Ver también `structure.md`, `deployment.md` y `workflow.md`*
