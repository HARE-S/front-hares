# Sistema de Diseño — HARE-S (Stitch: Forest Academic Analytics)

> **Documento de sincronización de diseño para todo el equipo.**  
> Fuente de verdad extraída directamente del proyecto de Stitch: `projects/7299988133753183962` (*HARE-S - Batería de Lectura Eficaz*).  
> **Tema:** `Forest Academic Analytics` · **Modo:** Claro · **Estilo:** Moderno Corporativo / Editorial Académico.

---

## 1. Principios Visuales

- **Rigor y claridad pedagógica:** Diseñado específicamente para docentes, coordinadores y evaluadores del programa HARE-S de Fundación Peñascal.
- **Jerarquía tonal:** Fondo claro neutro (`#f7f9fb`) para evitar fatiga visual, paneles blancos puros (`#ffffff`) con sutil borde (`#e2e8f0`), barra lateral persistente en pizarra oscura (`#192134`) y toques de verde bosque institucional (`#0f3e2e`) y esmeralda (`#006c49` / `#10b981`).
- **Cifras tabulares obligatorias:** Todas las tablas de resultados, palabras por minuto (PPM), percentiles y métricas activan `font-variant-numeric: tabular-nums;` para que los números queden perfectamente alineados verticalmente.
- **Sin colores en crudo:** Todo color procede de variables CSS definidas en `src/assets/styles/tokens.css`.

---

## 2. Paleta de Colores

| Token CSS | Hex | Uso principal |
| :--- | :--- | :--- |
| `--primary-container` | `#0f3e2e` | **Verde Bosque Institucional.** Botones primarios, acentos estructurales, cabecera de marca. |
| `--primary` | `#00271b` | **Verde Bosque Oscuro.** Hover de botones primarios y contraste alto. |
| `--secondary` | `#006c49` | **Acento Esmeralda.** Enlaces, chips de aula, foco de inputs y deltas de progreso positivo. |
| `--secondary-fixed` | `#6ffbbe` | **Esmeralda Luminoso.** Indicadores activos y texto de botones sobre fondo oscuro. |
| `--tertiary` | `#192134` | **Pizarra Oscura (Dark Slate).** Barra lateral persistente de navegación. |
| `--tertiary-container` | `#2e364b` | **Pizarra Media.** Hover de elementos de la barra lateral. |
| `--on-tertiary-container` | `#979fb8` | **Gris Pizarra.** Texto de navegación inactiva y subtítulos de la barra lateral. |
| `--background` / `--surface` | `#f7f9fb` | **Lienzo Neutro.** Fondo general de la aplicación. |
| `--surface-container-lowest` | `#ffffff` | **Superficie de Tarjetas.** Fondo de paneles, tablas y modales. |
| `--surface-container-low` | `#f2f4f6` | **Contenedores Secundarios.** Cabeceras de tablas y chips contextuales. |
| `--outline-variant` | `#e2e8f0` | **Borde Suave.** Delimitador de tarjetas, tablas y separadores. |
| `--on-surface` | `#191c1e` | **Texto Principal.** Títulos y texto de alta densidad. |
| `--on-surface-variant` | `#414944` | **Texto Secundario.** Etiquetas, pistas de formularios y metadatos. |

### Bandas de Nivel Lector (FE-02)

| Nivel | Rango Vef | Token de Fondo | Token de Borde | Token de Texto |
| :--- | :---: | :--- | :--- | :--- |
| **Destacado** | `> 85` | `--level-high-bg` (`#ecfdf5`) | `--level-high-border` (`#a7f3d0`) | `--level-high-text` (`#065f46`) |
| **En Nivel** | `25 - 85` | `--level-normal-bg` (`#f0fdf4`) | `--level-normal-border` (`#bbf7d0`) | `--level-normal-text` (`#166534`) |
| **Requiere Apoyo** | `< 25` | `--level-low-bg` (`#fef2f2`) | `--level-low-border` (`#fecaca`) | `--level-low-text` (`#991b1b`) |
| **Ausencia de Dato** | *Sin prueba* | `--level-nodata-bg` (`#f1f5f9`) | `--level-nodata-border` (`#cbd5e1`) | `--level-nodata-text` (`#64748b`) |
| **En Evaluación** | *En curso* | `--level-progress-bg` (`#eff6ff`) | `--level-progress-border` (`#bfdbfe`) | `--level-progress-text` (`#1e40af`) |

---

## 3. Tipografía

- **Titulares y Métricas (KPI):** `'Plus Jakarta Sans'`, sans-serif. Pesos: 600 (Semibold), 700 (Bold), 800 (Extrabold).
- **Cuerpo, Tablas y Etiquetas:** `'Inter'`, sans-serif. Pesos: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold).

---

## 4. Componentes y Clases Reutilizables (`components.css`)

### Botones (`.btn`)
- `.btn.btn-primary`: Acción principal en verde bosque (`#0f3e2e`).
- `.btn.btn-secondary`: Acción secundaria con borde neutro sobre fondo blanco.
- `.btn.btn-accent`: Acción en esmeralda (`#006c49`) para lanzamientos o evaluaciones directas.
- `.btn.btn-danger`: Botón de acción destructiva o confirmación de baja lógica.
- `.btn-sm`: Versión compacta para cabeceras o tablas.

### Tarjetas y Paneles (`.flat-card`)
- Fondo `#ffffff`, borde `1px solid var(--outline-variant)`, bordes redondeados `var(--radius-lg)` (12px) y sombra suave `var(--shadow-sm)`.

### Tablas (`.flat-table`)
- Cabecera con fondo `#f1f5f9`, texto en mayúsculas `label-sm` y `font-weight: 700`.
- Filas con hover a `#f8fafc`.
- Columnas numéricas con cifras tabulares.

### Formularios (`.form-input`, `.form-select`)
- Borde `#cbd5e1`, radio `8px`, relleno blanco, foco con anillo `var(--secondary)` con opacidad `15%`.

---

## 5. Estructura de Ficheros CSS

```
src/assets/styles/
├── tokens.css      # Variables de diseño (colores, fuentes, radios, sombras)
├── base.css        # Reset, tipografía, cifras tabulares, impresión
└── components.css  # Clases CSS reutilizables para botones, tarjetas, tablas y alertas
```
Cargados en cascada mediante `src/assets/main.css`.
