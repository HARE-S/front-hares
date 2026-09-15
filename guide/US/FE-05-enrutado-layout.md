# Historia de Usuario

## ID
[FE-05]

## Título
Enrutado y estructura de navegación

## Descripción
**Como** usuario
**Quiero** una navegación clara entre las secciones de la aplicación

**Para** encontrar lo que busco sin tener que aprenderme la herramienta.

## Criterios de Aceptación

### Escenario 1: Navegación permanente
```gherkin
Dado un usuario con sesion y rol asignado
Cuando accede a la aplicacion
Entonces ve una barra lateral con Alumnado, Pruebas, Libros, Informes y Administracion
Y la seccion actual aparece resaltada
```

### Escenario 2: La URL refleja la pantalla
```gherkin
Dado un usuario navegando por la ficha de un alumno
Cuando copia la direccion del navegador y la abre en otra pestaña
Entonces llega a la misma pantalla
Y el estado de la vista se reconstruye desde la URL
```

### Escenario 3: Migas de pan
```gherkin
Dado un usuario en la ficha de un alumno
Cuando mira la cabecera
Entonces ve la ruta centro, seccion y alumno
Y cada nivel es navegable
```

### Escenario 4: Ruta protegida sin sesión
```gherkin
Dado un usuario sin sesion activa
Cuando intenta acceder a una ruta protegida
Entonces la guarda de navegacion lo redirige al login
Y se recuerda la ruta que pedia para volver despues de entrar
```

### Escenario 5: Ruta inexistente
```gherkin
Dado una direccion que no corresponde a ninguna pantalla
Cuando se accede a ella
Entonces se muestra una pantalla de no encontrado
Y con un enlace para volver al inicio
```

### Escenario 6: Barra lateral en tableta
```gherkin
Dado una pantalla de menos de 1280 pixeles
Cuando se muestra la navegacion
Entonces la barra lateral se reduce a un rail de iconos
Y en menos de 768 pixeles desaparece de la rejilla
```

## Notas
* **Diseño:** usa `.sidebar`, `.sidebar__link`, `.header` y `.app-shell` de `components.css`.
* **Decisiones:** el escenario 2 es lo que permite que un coordinador comparta por correo el enlace a una pantalla filtrada. Si el estado solo vive en memoria, el enlace no sirve.
* **Dependencia:** requiere instalar `vue-router`. Bloquea todas las historias de pantalla posteriores.
* **Backend:** BE-10 para poblar la navegación de centros y secciones; se puede montar antes con MSW.

## Estimación
8 Puntos de Historia (Enrutado, layout, guardas y responsive)

## Prioridad
Crítica

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE05-01 | **Instalar y configurar vue-router** Definición de rutas en `router/index.js`. | - | Pendiente |
| T-FE05-02 | **AppShell.vue** Rejilla barra lateral más contenido. | - | Pendiente |
| T-FE05-03 | **AppSidebar.vue** Navegación con estado activo y logo. | - | Pendiente |
| T-FE05-04 | **AppHeader.vue** Migas de pan, grupo activo y usuario conectado. | - | Pendiente |
| T-FE05-05 | **Guarda de navegación** Redirección al login sin sesión, recordando el destino. | - | Pendiente |
| T-FE05-06 | **Pantalla de no encontrado** Con enlace de vuelta. | - | Pendiente |
| T-FE05-07 | **Pruebas de enrutado** Escenarios 2, 4 y 5. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
