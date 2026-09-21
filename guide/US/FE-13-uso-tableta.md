# Historia de Usuario

## ID
[FE-13]

## Título
Uso en tableta dentro del aula

## Descripción
**Como** tutor
**Quiero** poder registrar resultados desde una tableta en el aula

**Para** no tener que pasarlos después a limpio en el ordenador.

## Criterios de Aceptación

### Escenario 1: Navegación adaptada
```gherkin
Dado una pantalla de menos de 1280 pixeles
Cuando se carga la aplicacion
Entonces la barra lateral se reduce a un rail de iconos
Y el contenido aprovecha el ancho disponible
```

### Escenario 2: Teclado numérico
```gherkin
Dado un campo de tiempo, aciertos o errores
Cuando el usuario lo toca en una tableta
Entonces se abre el teclado numerico
Y no el alfabetico
```

### Escenario 3: Registro en lote sin desplazamiento horizontal
```gherkin
Dado la pantalla de registro en lote en una tableta
Cuando se muestra la lista de alumnos
Entonces las tres columnas de datos caben en el ancho
Y no hace falta desplazarse lateralmente para rellenar una fila
```

### Escenario 4: Áreas táctiles suficientes
```gherkin
Dado los botones y campos de la aplicacion
Cuando se usan con el dedo
Entonces su area activa mide al menos 44 pixeles de alto
```

### Escenario 5: Móvil
```gherkin
Dado una pantalla de menos de 768 pixeles
Cuando se carga la aplicacion
Entonces el contenido se presenta en una sola columna
Y las tablas pasan a tarjetas apiladas o permiten desplazamiento
```

## Notas
* **Pendiente de confirmar con el cliente:** qué dispositivos y qué navegador usan los tutores en el aula. Si trabajan con papel y trasladan después, esta historia baja de prioridad; si registran en directo, sube.
* **El escenario 3 es el que decide si la historia sirve.** El registro en lote es la pantalla de más uso, y si obliga a desplazarse para cada fila, el tutor volverá al papel.
* **Diseño:** los puntos de ruptura ya están en `base.css`.

## Estimación
5 Puntos de Historia (Ajustes en varias pantallas y pruebas en dispositivo)

## Prioridad
Baja

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE13-01 | **Confirmar dispositivos con el cliente** | - | Bloqueado |
| T-FE13-02 | **Rail de iconos en tableta** | Yeremi Peralta | Completado |
| T-FE13-03 | **inputmode numérico** En los campos de resultado. | Yeremi Peralta | Completado |
| T-FE13-04 | **Registro en lote adaptado** Sin desplazamiento horizontal. | Yeremi Peralta | Completado |
| T-FE13-05 | **Áreas táctiles** Revisión de botones y campos. | Yeremi Peralta | Completado |
| T-FE13-06 | **Prueba en dispositivo real** | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
