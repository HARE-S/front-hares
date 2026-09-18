# Historia de Usuario

## ID
[FE-20]

## Título
Registro de resultados en lote

## Descripción
**Como** tutor
**Quiero** introducir de una vez los resultados de todo el grupo tras una sesión

**Para** no repetir veinte veces el mismo formulario.

## Criterios de Aceptación

### Escenario 1: Rejilla del grupo
```gherkin
Dado un tutor que ha aplicado una prueba a su grupo
Cuando selecciona el grupo, la prueba y la fecha
Entonces aparece la lista de alumnos con tres campos por fila: tiempo, aciertos y errores
Y el foco se situa en el primer campo
```

### Escenario 2: Alumnos ausentes
```gherkin
Dado un grupo donde tres alumnos no hicieron la prueba
Cuando el tutor deja sus filas en blanco y guarda
Entonces esos tres alumnos no generan ningun resultado
Y NO se registran con valores a cero
```

### Escenario 3: Guardado en bloque
```gherkin
Dado la rejilla rellena
Cuando el tutor pulsa guardar
Entonces se envia una sola peticion con todas las filas
Y se muestra un resumen de cuantos resultados se han registrado
```

### Escenario 4: Una fila inválida
```gherkin
Dado una rejilla con veinte filas donde una tiene un tiempo negativo
Cuando se intenta guardar
Entonces se señala esa fila concreta con su motivo
Y NO se pierde lo tecleado en las demas filas
```

### Escenario 5: Navegación con teclado
```gherkin
Dado la rejilla de registro
Cuando el tutor pulsa el tabulador al terminar un campo
Entonces el foco pasa al siguiente campo en orden de lectura
Y se puede rellenar el grupo entero sin tocar el raton
```

### Escenario 6: Duplicado dentro del lote
```gherkin
Dado un alumno que ya tiene esa prueba en esa fecha
Cuando se envia el lote
Entonces esa fila se señala como conflicto
Y se indica al tutor que ya existe ese registro
```

## Notas
* **Es la pantalla que más uso real va a tener.** La del sistema anterior tenía exactamente esta forma: seleccionar grupo, elegir prueba en un desplegable y rellenar tres campos por alumno. Merece más cuidado que ninguna otra.
* **El escenario 2 es una regla de dominio, no una comodidad.** Registrar ceros por un alumno ausente falsea todas las medias del grupo y lo arrastra a la lista de alumnos sin progreso sin motivo.
* **El escenario 4 es el que decide si el tutor vuelve a usar la pantalla.** Perder veinte filas por un error en una sola es la forma más rápida de que alguien vuelva al papel.
* **Diseño:** `.table` con `.input--numeric` en las celdas; las filas con error, con `.input--error`.
* **Backend:** BE-22.

## Estimación
8 Puntos de Historia (Rejilla editable, guardado en bloque y manejo de errores por fila)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE20-01 | **Selección de grupo, prueba y fecha** | Yeremi | Completado |
| T-FE20-02 | **Rejilla editable** Tres campos por alumno, filas opcionales. | Yeremi | Completado |
| T-FE20-03 | **Navegación con teclado** Orden de tabulación por filas. | Yeremi | Completado |
| T-FE20-04 | **Guardado en bloque** Una sola petición con resumen. | Yeremi | Completado |
| T-FE20-05 | **Errores por fila** Señalados sin perder el resto. | Yeremi | Completado |
| T-FE20-06 | **Pruebas** Escenarios 2, 4 y 6. | Yeremi | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
