# Historia de Usuario

## ID
[FE-27]

## Título
Buscador de alumnos

## Descripción
**Como** tutor
**Quiero** buscar un alumno escribiendo parte de su nombre

**Para** llegar a su ficha sin recorrer listados.

## Criterios de Aceptación

### Escenario 1: Búsqueda mientras se escribe
```gherkin
Dado el buscador en la cabecera
Cuando el usuario escribe dos caracteres
Entonces se muestran resultados
Y no se exige un minimo de tres caracteres
```

### Escenario 2: Insensible a mayúsculas y acentos
```gherkin
Dado un alumno cuyo nombre lleva acentos
Cuando se busca sin tildes y en minusculas
Entonces el alumno aparece en los resultados
```

### Escenario 3: Desambiguación de homónimos
```gherkin
Dado dos alumnos con el mismo nombre en centros distintos
Cuando se buscan
Entonces cada resultado muestra su centro y su seccion
Y se pueden distinguir sin abrir la ficha
```

### Escenario 4: Ámbito del tutor
```gherkin
Dado un tutor con dos secciones asignadas
Cuando busca un alumno de otra seccion
Entonces ese alumno no aparece en sus resultados
```

### Escenario 5: Sin coincidencias
```gherkin
Dado una busqueda que no devuelve resultados
Cuando termina la consulta
Entonces se muestra un mensaje de sin coincidencias
Y no una lista vacia sin explicacion
```

### Escenario 6: Peticiones controladas
```gherkin
Dado un usuario escribiendo rapido
Cuando teclea varios caracteres seguidos
Entonces no se envia una peticion por cada tecla
Y se espera a que deje de escribir
```

## Notas
* **Los homónimos son reales:** en los datos del centro ya hay nombres repetidos. Sin centro y sección en el resultado, el tutor tendría que abrir fichas hasta acertar.
* **El escenario 6 no es optimización prematura.** Sin control de frecuencia, un nombre de diez letras genera diez peticiones y los resultados llegan desordenados.
* **Diseño:** `.input` en `.header`, resultados en panel flotante con `--shadow-hover`.
* **Backend:** BE-29.

## Estimación
3 Puntos de Historia (Búsqueda con control de frecuencia y panel de resultados)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE27-01 | **Campo de búsqueda en la cabecera** | - | Completado |
| T-FE27-02 | **Control de frecuencia** Espera hasta que deja de escribir. | - | Completado |
| T-FE27-03 | **Panel de resultados** Con centro y sección por fila. | - | Completado |
| T-FE27-04 | **Navegación con teclado** Flechas y Enter. | - | Completado |
| T-FE27-05 | **Pruebas** Escenarios 2, 3 y 5. | - | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
