# Historia de Usuario

## ID
[FE-32]

## Título
Comparativa de evolución por grupos

## Descripción
**Como** responsable pedagógico
**Quiero** comparar la evolución media entre secciones, centros o ámbitos

**Para** detectar dónde funciona mejor el programa y dónde hay que intervenir.

## Criterios de Aceptación

### Escenario 1: Comparación de varios grupos
```gherkin
Dado dos o mas grupos seleccionados
Cuando se genera la comparativa
Entonces se representan sus medias en el mismo grafico
Y cada grupo se distingue en la leyenda
```

### Escenario 2: El tamaño de la muestra siempre visible
```gherkin
Dado una comparativa entre grupos
Cuando se muestra la media de cada uno
Entonces aparece junto a ella cuantos alumnos la componen
Y cuantas pruebas se han considerado
```

### Escenario 3: Grupo poco representativo
```gherkin
Dado un grupo con menos alumnos que el minimo configurado
Cuando aparece en la comparativa
Entonces se marca visualmente como poco representativo
Y su media se acompaña de una advertencia
```

### Escenario 4: Grupo sin datos
```gherkin
Dado un grupo sin resultados registrados
Cuando se incluye en una comparativa
Entonces se muestra como sin datos
Y NO se representa como un cero
```

### Escenario 5: Progreso del grupo
```gherkin
Dado una comparativa entre pruebas consecutivas
Cuando se consulta el progreso de cada grupo
Entonces se indica cuantos alumnos mejoran y en que porcentaje
Y no unicamente la media de las diferencias
```

### Escenario 6: Alcance por rol
```gherkin
Dado un tutor
Cuando intenta comparar centros completos
Entonces la opcion no esta disponible
Y se le indica que su alcance son sus secciones
```

## Notas
* **Los escenarios 2, 3 y 4 son la diferencia entre un informe útil y uno engañoso.** Una media sin el tamaño de la muestra invita a conclusiones falsas: dos alumnos pueden dar una media espectacular que no significa nada. Y un grupo sin datos representado como cero parecería el peor del centro cuando simplemente no ha hecho pruebas.
* **El escenario 5 respeta el criterio del cliente.** En sus informes, el progreso de un grupo es cuántos alumnos mejoran y en qué porcentaje, no el promedio de las diferencias. Si se cambia, las cifras dejan de ser comparables con las suyas.
* **Backend:** BE-32.

## Estimación
5 Puntos de Historia (Comparativa con advertencias de representatividad)

## Prioridad
Media

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE32-01 | **Selector de grupos** Secciones, centros o ámbitos. | - | Completado |
| T-FE32-02 | **Gráfico comparativo** Con leyenda y tamaño de muestra. | - | Completado |
| T-FE32-03 | **Advertencia de poca representatividad** | - | Completado |
| T-FE32-04 | **Grupos sin datos** Distinguidos del cero. | - | Completado |
| T-FE32-05 | **Progreso por recuento** Alumnos que mejoran y porcentaje. | - | Completado |
| T-FE32-06 | **Pruebas** Escenarios 2, 3 y 4. | - | Completado |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
