# Filtro de Curso Global

## Descripción
El selector de curso en la barra lateral ahora es un filtro **central** que afecta toda la información mostrada en la aplicación.

## Cómo Usar en Tus Componentes

### 1. Importar el composable
```javascript
import { useCourse } from '@/composables/useCourse';
```

### 2. Usar en tu componente
```javascript
const { selectedCourse } = useCourse();

// Ahora selectedCourse es reactivo y cambia cuando el usuario selecciona un curso
```

### 3. Filtrar datos según el curso
```javascript
// Ejemplo: filtrar pruebas por curso
const filteredTests = computed(() => {
  return allTests.filter(test => test.courseId === selectedCourse.value);
});
```

## Ejemplo Completo en DashboardView

```vue
<script setup>
import { useCourse } from '@/composables/useCourse';
import { computed } from 'vue';

const { selectedCourse } = useCourse();

// Filtrar datos del dashboard según curso
const dashboardData = computed(() => {
  return fetchDashboardData(selectedCourse.value);
});
</script>

<template>
  <div>
    <h2>Curso Actual: {{ selectedCourse }}</h2>
    <!-- Los datos ahora se muestran según el curso seleccionado -->
  </div>
</template>
```

## Componentes que necesitan actualizar:

1. **DashboardView** - KpiOverview, FluencyChart, LevelsDistribution, RecentAssessmentsTable
2. **TestsCatalogView** - Lista de pruebas
3. **BooksCatalogView** - Catálogo de libros
4. **BulkEntryView** - Registro en aula
5. **SectionDetailView** - Detalles de sección
6. **ReportsView** - Informes

## Datos que cambian con el curso:

- ✅ Estudiantes del curso
- ✅ Evaluaciones registradas
- ✅ Pruebas disponibles
- ✅ Libros asignados
- ✅ Gráficos y estadísticas
- ✅ Reportes
