# Historia de Usuario

## ID
[FE-14]

## Título
Alta de prueba en el catálogo

## Descripción
**Como** coordinador pedagógico
**Quiero** dar de alta un texto de control desde la aplicación

**Para** poder aplicarlo a los alumnos del programa sin pedírselo a nadie.

## Criterios de Aceptación

### Escenario 1: Alta correcta
```gherkin
Dado un coordinador en el catalogo de pruebas
Cuando rellena codigo, nombre, palabras, curso, letra y tipo
Y pulsa guardar
Entonces la prueba aparece en el listado
Y se muestra una confirmacion
```

### Escenario 2: Vocabulario cerrado
```gherkin
Dado el formulario de alta
Cuando el usuario despliega el campo letra
Entonces solo puede elegir entre I, A, B, C, D y E
Y en el campo tipo solo entre Funcional y Literario
```

### Escenario 3: Código duplicado
```gherkin
Dado una prueba ya existente con codigo 1AF
Cuando se intenta crear otra con el mismo codigo
Entonces el backend responde 409
Y se muestra un mensaje indicando que ese codigo ya existe
Y NO un error tecnico
```

### Escenario 4: Número de palabras inválido
```gherkin
Dado el formulario de alta
Cuando se introduce un numero de palabras cero o negativo
Entonces se rechaza antes de enviar
Y se explica que debe ser un entero positivo
```

### Escenario 5: Sin permiso
```gherkin
Dado un usuario con rol tutor
Cuando accede al catalogo de pruebas
Entonces no ve el boton de crear
```

## Notas
* **El número de palabras es crítico.** Es el numerador del cálculo de velocidad. Un valor mal introducido falsea todas las métricas de esa prueba sin que nada falle visiblemente.
* **El escenario 2 responde a una exigencia del cliente:** los códigos son *"referencias funcionales y asentadas"* que no se pueden modificar. Desplegable cerrado, no texto libre.
* **Diseño:** `.field`, `.select`, `.btn--primary`. El tipo se muestra con `.badge--functional` o `.badge--literary`.
* **Backend:** BE-11.

## Estimación
3 Puntos de Historia (Formulario con validación y desplegables cerrados)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE14-01 | **Servicio de pruebas** Alta con JSDoc del recurso. | - | Pendiente |
| T-FE14-02 | **Formulario de alta** Con desplegables cerrados de letra y tipo. | - | Pendiente |
| T-FE14-03 | **Manejo del 409** Mensaje de código duplicado. | - | Pendiente |
| T-FE14-04 | **Ocultación según rol** | - | Pendiente |
| T-FE14-05 | **Pruebas** Escenarios 2, 3 y 4. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
