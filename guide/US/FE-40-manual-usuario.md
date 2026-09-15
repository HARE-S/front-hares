# Historia de Usuario

## ID
[FE-40]

## Título
Manual de usuario de la interfaz

## Descripción
**Como** tutor
**Quiero** una guía de uso de la aplicación

**Para** poder usarla sin depender del equipo de desarrollo.

## Criterios de Aceptación

### Escenario 1: Flujos principales documentados
```gherkin
Dado el manual
Cuando un tutor lo consulta
Entonces encuentra como registrar un resultado
Y como registrar el grupo completo en lote
Y como asignar y cerrar una lectura
Y como consultar la ficha de un alumno
```

### Escenario 2: Con capturas
```gherkin
Dado cada flujo documentado
Cuando se consulta
Entonces incluye capturas de las pantallas reales
Y las capturas usan datos anonimos
```

### Escenario 3: Lenguaje comprensible
```gherkin
Dado el manual completo
Cuando lo lee alguien sin perfil tecnico
Entonces lo entiende sin conocer la arquitectura
Y esta escrito en castellano
```

### Escenario 4: Interpretación de las métricas
```gherkin
Dado el manual
Cuando un tutor consulta que significan las metricas
Entonces encuentra explicadas la velocidad espontanea, la comprension y la velocidad eficaz
Y que indican las bandas de nivel
```

### Escenario 5: Actualizado con la aplicación
```gherkin
Dado un cambio en un flujo documentado
Cuando se fusiona ese cambio
Entonces el manual se actualiza en el mismo commit
```

## Notas
* **El escenario 2 tiene una restricción que no es negociable:** las capturas usan datos anónimos. Un manual con nombres reales de alumnado circulando por correo es una fuga de datos de menores.
* **El escenario 4 es lo que más van a consultar.** La velocidad eficaz no es intuitiva: que un alumno rápido pero con poca comprensión obtenga un valor bajo necesita explicación, o se interpretará como un error de la aplicación.
* **El escenario 5 es lo que evita que el manual muera.** Un documento que se actualiza «cuando haya tiempo» queda obsoleto en un mes y deja de consultarse.

## Estimación
3 Puntos de Historia (Redacción sobre funcionalidad ya construida)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE40-01 | **Guía de registro de resultados** Individual y en lote. | - | Pendiente |
| T-FE40-02 | **Guía de lecturas y ficha del alumno** | - | Pendiente |
| T-FE40-03 | **Explicación de las métricas y las bandas** | - | Pendiente |
| T-FE40-04 | **Capturas con datos anónimos** | - | Pendiente |
| T-FE40-05 | **Revisión de comprensión** Que lo lea alguien ajeno al equipo. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
