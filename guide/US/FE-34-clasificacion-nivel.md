# Historia de Usuario

## ID
[FE-34]

## Título
Clasificación por nivel lector

## Descripción
**Como** coordinador pedagógico
**Quiero** ver a qué banda de nivel pertenece cada resultado y cada grupo

**Para** identificar de un vistazo quién necesita intervención.

## Criterios de Aceptación

### Escenario 1: Banda en cada resultado
```gherkin
Dado un resultado con velocidad eficaz calculada
Cuando se muestra en cualquier listado
Entonces lleva un distintivo con su banda
Y el distintivo indica alto, normal o bajo
```

### Escenario 2: Umbrales del centro
```gherkin
Dado una velocidad eficaz de 90
Cuando se clasifica
Entonces corresponde a la banda alta
Y una de 50 corresponde a la normal
Y una de 20 corresponde a la baja
```

### Escenario 3: Valores frontera
```gherkin
Dado una velocidad eficaz de exactamente 25
Cuando se clasifica
Entonces corresponde a la banda normal
Y una de exactamente 85 tambien corresponde a la normal
```

### Escenario 4: Ausencia de dato
```gherkin
Dado un alumno sin resultados registrados
Cuando se muestra su nivel
Entonces se usa el distintivo de sin datos en gris neutro
Y NUNCA el distintivo de banda baja
```

### Escenario 5: Distribución del grupo
```gherkin
Dado una seccion con resultados
Cuando se consulta su distribucion de niveles
Entonces se muestra cuantos alumnos hay en cada banda
Y el porcentaje que representan
```

### Escenario 6: Valores negativos
```gherkin
Dado un resultado con velocidad eficaz negativa
Cuando se clasifica
Entonces cae en la banda baja
Y no provoca ningun error de representacion
```

## Notas
* **Los umbrales son los del centro, no los de la batería original.** La escala editorial usa valores de 100 a 250 para ESO; la población de Peñascal lee muy por debajo y con esa escala casi todo el alumnado quedaría clasificado como deficiente, dejando el informe sin utilidad.
* **Deben ser configurables**, no escritos en el código: el criterio pedagógico puede cambiar.
* **El escenario 4 es la regla más importante de esta historia.** Confundir ausencia de dato con nivel bajo hace que el coordinador intervenga sobre quien simplemente no ha hecho pruebas todavía.
* **El escenario 6 no es hipotético:** la comprensión ponderada puede salir negativa cuando los errores superan al doble de los aciertos, y los informes del centro contienen esos valores.
* **Backend:** BE-30 y la clasificación por bandas.

## Estimación
5 Puntos de Historia (Componente transversal más distribución de grupo)

## Prioridad
Alta

## Tareas

| Código | Nombre | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| T-FE34-01 | **Función de clasificación** En `utils/`, con umbrales configurables. | - | Pendiente |
| T-FE34-02 | **Componente LevelBadge** Con las cuatro variantes. | - | Pendiente |
| T-FE34-03 | **Aplicación en listados** Resultados, ficha e historial de sección. | - | Pendiente |
| T-FE34-04 | **Distribución por grupo** Recuento y porcentaje con barras. | - | Pendiente |
| T-FE34-05 | **Pruebas de frontera** Escenarios 3, 4 y 6. | - | Pendiente |

---

**Estados posibles:** Pendiente · En curso · En revisión · Completado · Bloqueado
