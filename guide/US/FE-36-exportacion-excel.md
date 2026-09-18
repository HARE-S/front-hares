# Historia de Usuario

## ID
[FE-36]

## Título
Exportación a Excel

## Descripción
**Como** coordinador pedagógico
**Quiero** descargar los datos que estoy viendo en una hoja de cálculo

**Para** poder trabajarlos y compartirlos fuera de la aplicación.

## Criterios de Aceptación

### Escenario 1: Exporta lo que se ve
```gherkin
Dado un listado con filtros aplicados
Cuando el usuario pulsa exportar
Entonces el fichero contiene exactamente ese conjunto filtrado
Y NO el conjunto completo sin filtrar
```

### Escenario 2: Botón donde hay filtros
```gherkin
Dado cualquier pantalla con listado filtrable
Cuando se muestra la barra de acciones
Entonces incluye un boton de exportar
Y se indica cuantos registros se van a exportar
```

### Escenario 3: Progreso y descarga
```gherkin
Dado una exportacion en curso
Cuando el proceso tarda varios segundos
Entonces se muestra un indicador de progreso
Y al terminar el fichero se descarga automaticamente
```

### Escenario 4: Conjunto vacío
```gherkin
Dado unos filtros que no devuelven resultados
Cuando se intenta exportar
Entonces el boton aparece deshabilitado
Y se explica que no hay datos que exportar
```

### Escenario 5: Fallo de la exportación
```gherkin
Dado un error del servidor durante la exportacion
Cuando falla el proceso
Entonces se muestra un mensaje comprensible
Y se ofrece reintentar
```

## Notas
* **El escenario 1 es la expectativa del usuario y conviene no romperla.** Quien filtra un grupo y pulsa exportar espera ese grupo, no la base entera. Si se exporta todo, el fichero es inútil y además saca más datos de menores de los necesarios.
* **El escenario 2 con el recuento** evita la sorpresa de descargar un fichero de dos mil filas cuando se esperaban veinte.
* **Diseño:** `.btn--secondary` con icono de descarga.
* **Backend:** BE-35.

## Estimación
3 Puntos de Historia (Acción con progreso y estados)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE36-01 | **Servicio de exportación** Envío de los filtros activos. | Yeremi | Completado |
| T-FE36-02 | **Botón con recuento** En las barras de acciones. | Yeremi | Completado |
| T-FE36-03 | **Progreso y descarga** | Yeremi | Completado |
| T-FE36-04 | **Estados vacío y error** | Yeremi | Completado |
| T-FE36-05 | **Pruebas** Escenarios 1, 4 y 5. | Yeremi | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
