# Historia de Usuario

## ID
[FE-30]

## Título
Componentes de gráfico

## Descripción
**Como** coordinador pedagógico
**Quiero** ver los datos en gráficos y no solo en tablas

**Para** captar la tendencia de un vistazo.

## Criterios de Aceptación

### Escenario 1: Gráfico de líneas
```gherkin
Dado una serie temporal de velocidad eficaz
Cuando se representa
Entonces se muestra una linea con un punto por prueba
Y el eje horizontal indica la prueba y el vertical la velocidad
```

### Escenario 2: Ejes rotulados
```gherkin
Dado cualquier grafico de la aplicacion
Cuando se muestra
Entonces sus ejes indican la magnitud y la unidad
Y no aparecen numeros sin contexto
```

### Escenario 3: Legible sin color
```gherkin
Dado un grafico con varias series
Cuando se ve en escala de grises o por una persona con daltonismo
Entonces las series se distinguen por forma de punto o trazo
Y no unicamente por el color
```

### Escenario 4: Descarga como imagen
```gherkin
Dado un grafico mostrado
Cuando el usuario pulsa descargar
Entonces se obtiene una imagen del grafico
Y sirve para pegarla en un acta o un correo
```

### Escenario 5: Sin datos
```gherkin
Dado una serie sin puntos suficientes
Cuando se intenta representar
Entonces se muestra un mensaje en lugar de un grafico vacio
```

### Escenario 6: Línea de referencia
```gherkin
Dado un grafico de evolucion
Cuando existe un umbral de referencia
Entonces se dibuja como linea discontinua con su rotulo
Y se distingue de los datos reales
```

## Notas
* **El escenario 3 no es un extra.** Un informe de nivel lector en el que dos series solo se distinguen por color deja fuera a quien lo imprima en blanco y negro, que es lo habitual en un acta.
* **El escenario 5 evita sugerir tendencias inexistentes.** Un gráfico con un punto parece una línea plana, y eso se lee como estancamiento.
* **Diseño:** colores de `tokens.css`, `--brand-emerald` para la serie principal y `--border-strong` discontinuo para referencias.
* **Decisión pendiente:** qué librería de gráficos. Conviene una ligera y que permita exportar a imagen.

## Estimación
5 Puntos de Historia (Componentes reutilizables con accesibilidad y exportación)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE30-01 | **Elegir librería de gráficos** Ligera y con exportación. | - | Pendiente |
| T-FE30-02 | **Componente de líneas** Con ejes rotulados. | - | Pendiente |
| T-FE30-03 | **Componente de barras** Para comparativas. | - | Pendiente |
| T-FE30-04 | **Distinción sin color** Formas y trazos. | - | Pendiente |
| T-FE30-05 | **Exportación a imagen** | - | Pendiente |
| T-FE30-06 | **Pruebas** Escenarios 2 y 5. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
