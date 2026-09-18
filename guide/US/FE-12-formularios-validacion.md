# Historia de Usuario

## ID
[FE-12]

## Título
Formularios con validación en cliente

## Descripción
**Como** tutor
**Quiero** que el formulario me avise del error antes de enviarlo

**Para** no perder lo que he tecleado.

## Criterios de Aceptación

### Escenario 1: Validación antes del envío
```gherkin
Dado un formulario con un campo obligatorio vacio
Cuando el usuario intenta enviarlo
Entonces se muestra el error junto a ese campo
Y no se realiza ninguna peticion al servidor
```

### Escenario 2: Errores del servidor junto al campo
```gherkin
Dado un envio que el backend rechaza con 400 indicando el campo
Cuando llega la respuesta
Entonces el error se muestra junto al campo correspondiente
Y no como un mensaje generico en la parte superior
```

### Escenario 3: No se pierde lo tecleado
```gherkin
Dado un formulario relleno que falla al enviarse
Cuando se muestra el error
Entonces todos los valores introducidos siguen en sus campos
Y el usuario solo corrige lo que falla
```

### Escenario 4: Rangos numéricos
```gherkin
Dado el registro de un resultado de prueba
Cuando se introduce un tiempo, aciertos o errores negativos
Entonces se rechaza antes de enviar
Y cuando la suma de aciertos y errores supera 20 tambien se rechaza
```

### Escenario 5: Aviso de valor sospechoso
```gherkin
Dado un tiempo de lectura de 5 segundos para un texto de 872 palabras
Cuando el usuario sale del campo
Entonces se muestra un aviso de que el valor parece fuera de rango
Y se pide confirmacion, pero no se bloquea el envio
```

## Notas
* **El escenario 5 evita repetir un problema real del sistema anterior.** Los informes de ORI contienen velocidades eficaces de 2.050 y medias de grupo de −1.090, casi con seguridad porque alguien introdujo el tiempo en minutos en lugar de segundos. Nada avisó, y esos valores contaminaron las medias de un ámbito entero.
* **Es un aviso, no un bloqueo.** Un dato raro puede ser correcto; lo que no puede es pasar desapercibido.
* **Diseño:** `.field`, `.input--error`, `.field__error`, `.field__hint` y `.notice--warn`.
* **Testing:** escenarios 3 y 4 son pruebas obligatorias.

## Estimación
5 Puntos de Historia (Validación reutilizable y avisos de rango)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE12-01 | **Utilidades de validación** Obligatorio, rango numérico, coherencia de fechas. | Bloque A | Completado |
| T-FE12-02 | **Componente BaseInput** Con estado de error y mensaje asociado. | Bloque A | Completado |
| T-FE12-03 | **Mapeo de errores del servidor** Del campo devuelto al campo del formulario. | Bloque A | Completado |
| T-FE12-04 | **Aviso de valor sospechoso** Umbrales configurables. | Bloque A | Completado |
| T-FE12-05 | **Pruebas** Escenarios 3, 4 y 5. | Bloque A | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
