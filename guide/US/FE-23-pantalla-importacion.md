# Historia de Usuario

## ID
[FE-23]

## Título
Pantalla de importación del volcado de Alexia

## Descripción
**Como** administrador
**Quiero** subir el fichero de Alexia desde el navegador

**Para** no depender de acceso al servidor ni de comandos.

## Criterios de Aceptación

### Escenario 1: Selección y previsualización
```gherkin
Dado un administrador en la pantalla de importacion
Cuando selecciona un fichero CSV valido
Entonces se muestran las primeras filas interpretadas
Y todavia no se ha escrito nada en la base de datos
```

### Escenario 2: Confirmación explícita
```gherkin
Dado una previsualizacion correcta
Cuando el administrador pulsa confirmar importacion
Entonces se ejecuta el proceso
Y se muestra un resumen con creados, actualizados, omitidos y errores
```

### Escenario 3: Progreso visible
```gherkin
Dado una importacion en curso
Cuando el proceso tarda varios segundos
Entonces se muestra un indicador de progreso
Y el boton de confirmar queda deshabilitado
```

### Escenario 4: Extensión no permitida
```gherkin
Dado un fichero con extension no admitida
Cuando se intenta seleccionar
Entonces se rechaza antes de subir
Y se indican las extensiones validas
```

### Escenario 5: Fichero demasiado grande
```gherkin
Dado un fichero que supera el tamaño maximo
Cuando se intenta subir
Entonces se muestra un mensaje explicando el limite
Y no se produce un error tecnico 413 sin explicar
```

### Escenario 6: Sin permiso
```gherkin
Dado un usuario con rol tutor
Cuando intenta acceder a la pantalla de importacion
Entonces la guarda de ruta lo impide
```

## Notas
* **El escenario 1 es lo que hace la pantalla utilizable.** Importar a ciegas un fichero de cientos de alumnos y descubrir después que las columnas no eran las esperadas obliga a deshacerlo todo a mano.
* **El escenario 5 depende también del proxy:** nginx corta las subidas en 1 MB por defecto, y está configurado a 10 MB. Si el fichero los supera, el mensaje debe ser comprensible y no un 413 crudo.
* **Diseño:** `.card` para la previsualización, `.table` para las filas, `.notice--info` para el resumen.
* **Backend:** BE-09.

## Estimación
5 Puntos de Historia (Subida, previsualización, confirmación y progreso)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE23-01 | **Selector de fichero** Con validación de extensión y tamaño. | Marlen | Completado |
| T-FE23-02 | **Previsualización** Tabla con las primeras filas interpretadas. | Marlen | Completado |
| T-FE23-03 | **Confirmación y progreso** Botón deshabilitado durante el proceso. | Marlen | Completado |
| T-FE23-04 | **Resumen de resultados** Contadores y enlace al informe de errores. | Marlen | Completado |
| T-FE23-05 | **Guarda de ruta** Solo administrador. | Santiago | Pendiente |
| T-FE23-06 | **Pruebas** Escenarios 4, 5 y 6. | Marlen | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
