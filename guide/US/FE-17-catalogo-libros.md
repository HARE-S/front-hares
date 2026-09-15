# Historia de Usuario

## ID
[FE-17]

## Título
Catálogo de libros

## Descripción
**Como** coordinador pedagógico
**Quiero** gestionar el catálogo de lecturas

**Para** que los tutores puedan asignar libros que realmente existen en el centro.

## Criterios de Aceptación

### Escenario 1: Listado del catálogo
```gherkin
Dado el catalogo de libros
Cuando se abre la pantalla
Entonces se muestran titulo y nivel de cada libro
Y se puede filtrar por nivel
```

### Escenario 2: Niveles con su notación real
```gherkin
Dado los libros del centro
Cuando se muestra el nivel de cada uno
Entonces se ven como 0, 0-I, I, II y I/II
Y NO como numeros inventados
```

### Escenario 3: Orden pedagógico
```gherkin
Dado un catalogo con libros de varios niveles
Cuando se ordena por nivel
Entonces el orden es 0, 0-I, I, I/II, II
Y no el orden alfabetico
```

### Escenario 4: Alta y edición
```gherkin
Dado un coordinador en el catalogo
Cuando crea un libro con titulo y nivel
Entonces aparece en el listado
Y un titulo duplicado se rechaza con mensaje claro
```

### Escenario 5: Información de ejemplares
```gherkin
Dado un libro con anotaciones de ejemplares y sesiones
Cuando se consulta su ficha
Entonces se muestran tal como estan registradas, como texto
Y valores como 11 fotocopias o PDF se muestran sin intentar interpretarlos
```

## Notas
* **El escenario 2 corrige un error del esquema original del cliente**, que declaraba el nivel como entero. Los niveles reales del centro no son numéricos y forzar una equivalencia rompería la correspondencia con el material que el profesorado ya usa.
* **El escenario 5 refleja la realidad del listado del centro:** la columna de ejemplares contiene valores como `11 Fotocopias`, `PDF` o `12 + 6 fotocopias`. Se guardan y muestran como texto libre.
* **Diseño:** `.table` y `.badge` para el nivel.
* **Backend:** BE-16, BE-17.

## Estimación
3 Puntos de Historia (CRUD con orden propio de niveles)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE17-01 | **Servicio de libros** Con los niveles como vocabulario cerrado. | - | Pendiente |
| T-FE17-02 | **Listado con filtro por nivel** | - | Pendiente |
| T-FE17-03 | **Orden pedagógico** No alfabético. | - | Pendiente |
| T-FE17-04 | **Formulario de alta y edición** | - | Pendiente |
| T-FE17-05 | **Pruebas** Escenarios 2, 3 y 4. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
