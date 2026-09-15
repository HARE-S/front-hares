# Historia de Usuario

## ID
[FE-02]

## Título
Sistema de diseño en CSS puro

## Descripción
**Como** desarrollador
**Quiero** un sistema de diseño en variables CSS nativas

**Para** que toda la interfaz sea coherente sin depender de un framework de estilos.

## Criterios de Aceptación

### Escenario 1: Variables disponibles en toda la aplicación
```gherkin
Dado el proyecto con los estilos cargados desde main.js
Cuando un componente usa var(--brand-forest)
Entonces el color se aplica correctamente
Y no hace falta importar nada mas en ese componente
```

### Escenario 2: Ningún color escrito en crudo
```gherkin
Dado el codigo de la aplicacion
Cuando se buscan valores hexadecimales fuera de tokens.css
Entonces no aparece ninguno
Y todo color procede de una variable
```

### Escenario 3: Bandas de nivel lector
```gherkin
Dado los distintivos de nivel
Cuando se aplica badge--high, badge--normal o badge--low
Entonces cada uno muestra su color de fondo, borde, texto y punto indicador
Y corresponden a velocidad eficaz mayor de 85, entre 25 y 85, y menor de 25
```

### Escenario 4: Ausencia de dato con distintivo propio
```gherkin
Dado un alumno sin resultados registrados
Cuando se muestra su nivel
Entonces se usa badge--nodata en gris neutro
Y NUNCA badge--low
```

### Escenario 5: Cifras tabulares en datos numéricos
```gherkin
Dado una tabla con columnas de velocidad eficaz
Cuando se muestran valores con distinto numero de digitos
Entonces los decimales quedan alineados en columna
Y las cifras usan font-variant-numeric tabular-nums
```

### Escenario 6: Estilos de impresión
```gherkin
Dado la ficha de un alumno
Cuando se imprime
Entonces no aparecen la barra lateral ni la cabecera
Y las tarjetas no se parten entre paginas
```

## Notas
* **Decisiones:** CSS puro con variables nativas en vez de Tailwind. Sin dependencias, sin compilación extra, y la paleta se cambia tocando un fichero sin recompilar.
* **El escenario 4 no estaba en el diseño original y es imprescindible.** Si un alumno sin prueba se pinta con el mismo rojo que uno con velocidad eficaz baja, el coordinador intervendrá sobre quien no lo necesita. Son dos situaciones distintas y deben verse distintas.
* **Ficheros:** `tokens.css` (variables), `base.css` (reset, rejilla, responsive, impresión) y `components.css` (clases reutilizables).
* **Pendiente:** el logo en SVG, en variante oscura para fondo claro y clara para la barra lateral.

## Estimación
5 Puntos de Historia (Sistema completo de tokens, base y componentes)

## Prioridad
Crítica

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE02-01 | **tokens.css** Colores, tipografía, espaciado, radios, sombras y capas. | - | Completado |
| T-FE02-02 | **base.css** Reset, tipografía, rejilla, responsive, accesibilidad e impresión. | - | Completado |
| T-FE02-03 | **components.css** Botones, tarjetas, métricas, distintivos, tablas, formularios, barra lateral y estados. | - | Completado |
| T-FE02-04 | **Carga en main.js** Una sola importación en cascada. | - | Pendiente |
| T-FE02-05 | **Logo en SVG** Variante oscura y clara, con los colores de la paleta. | - | Bloqueado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
