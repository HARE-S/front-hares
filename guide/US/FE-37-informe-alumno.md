# Historia de Usuario

## ID
[FE-37]

## Título
Informe individual imprimible

## Descripción
**Como** tutor
**Quiero** generar un informe imprimible de un alumno

**Para** entregárselo a la familia o adjuntarlo al expediente.

## Criterios de Aceptación

### Escenario 1: Contenido del informe
```gherkin
Dado un alumno con historico
Cuando se genera su informe
Entonces incluye sus datos identificativos
Y su historico de pruebas con las tres metricas
Y sus lecturas
Y su grafico de evolucion
```

### Escenario 2: Formato al imprimir
```gherkin
Dado el informe en pantalla
Cuando se envia a imprimir
Entonces no aparecen la barra lateral ni la cabecera de navegacion
Y el contenido se ajusta a A4
Y las tarjetas no se parten entre paginas
```

### Escenario 3: Fecha de generación
```gherkin
Dado un informe generado
Cuando se consulta
Entonces muestra la fecha y hora de generacion
Y el nombre del centro
```

### Escenario 4: Datos insuficientes
```gherkin
Dado un alumno con una sola prueba
Cuando se genera su informe
Entonces se incluyen sus datos y el resultado disponible
Y se indica que no hay evolucion suficiente
Y no aparece ninguna proyeccion
```

### Escenario 5: Sin permiso
```gherkin
Dado un tutor sin la seccion de ese alumno
Cuando intenta generar su informe
Entonces se muestra acceso denegado
```

## Notas
* **El escenario 2 es la razón de que existan estilos de impresión en el sistema de diseño.** Un informe impreso con la navegación y los fondos gasta tinta y no parece un documento del centro.
* **Es el documento más sensible de la aplicación:** reúne en una página todo lo relativo a un menor. Permiso estricto, y el backend lo registra en auditoría.
* **Decisión:** la maquetación imprimible se resuelve con CSS de impresión, no generando un PDF en el servidor. El navegador ya sabe hacerlo y evita una dependencia pesada.
* **Backend:** BE-36.

## Estimación
5 Puntos de Historia (Maquetación específica para impresión)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE37-01 | **Servicio del informe** Datos agregados en una llamada. | Yeremi | Completado |
| T-FE37-02 | **Vista del informe** Con todos los bloques. | Yeremi | Completado |
| T-FE37-03 | **Estilos de impresión** A4, sin navegación, sin cortes. | Yeremi | Completado |
| T-FE37-04 | **Cabecera del documento** Centro y fecha de generación. | Yeremi | Completado |
| T-FE37-05 | **Pruebas** Escenarios 4 y 5, más prueba manual de impresión. | Yeremi | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
