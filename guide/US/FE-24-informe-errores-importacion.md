# Historia de Usuario

## ID
[FE-24]

## Título
Informe de errores de importación

## Descripción
**Como** administrador
**Quiero** ver qué filas del fichero han fallado y por qué

**Para** poder corregir el origen sin adivinar.

## Criterios de Aceptación

### Escenario 1: Tabla de errores
```gherkin
Dado una importacion terminada con errores
Cuando se consulta el informe
Entonces se muestra una tabla con numero de linea, columna y motivo
Y el motivo esta redactado en lenguaje comprensible
```

### Escenario 2: El resto se ha procesado
```gherkin
Dado un fichero de 28 filas donde una es invalida
Cuando termina la importacion
Entonces el resumen indica 27 procesadas y 1 con error
Y queda claro que no hay que repetir todo el fichero
```

### Escenario 3: Descarga del informe
```gherkin
Dado un informe de errores
Cuando el administrador pulsa descargar
Entonces se obtiene un fichero con la lista completa
```

### Escenario 4: Sin errores
```gherkin
Dado una importacion sin ninguna fila rechazada
Cuando termina el proceso
Entonces se muestra una confirmacion
Y no aparece la tabla de errores vacia
```

### Escenario 5: Muchos errores
```gherkin
Dado una importacion con mas de cincuenta filas rechazadas
Cuando se muestra el informe
Entonces la tabla se pagina
Y se indica el total de errores
```

## Notas
* **El escenario 2 comunica algo importante.** Al ver errores, la reacción natural es pensar que hay que repetirlo todo. El resumen debe dejar claro que lo válido ya está dentro y que solo hay que corregir lo señalado.
* **Diseño:** `.table` con `.notice--warn` en la cabecera del informe.
* **Backend:** BE-08.

## Estimación
3 Puntos de Historia (Tabla con paginación y descarga)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE24-01 | **Tabla de errores** Línea, columna y motivo. | - | Pendiente |
| T-FE24-02 | **Resumen comprensible** Procesadas frente a rechazadas. | - | Pendiente |
| T-FE24-03 | **Descarga del informe** | - | Pendiente |
| T-FE24-04 | **Paginación** Para volúmenes grandes. | - | Pendiente |
| T-FE24-05 | **Pruebas** Escenarios 2 y 4. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
