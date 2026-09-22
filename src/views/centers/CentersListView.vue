<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCenters, getCenterSections, getSectionStudents } from '@/services/directoryService';
import { ChevronDown } from 'lucide-vue-next';

const router = useRouter();
const centers = ref([]);
const sectionsMap = ref({});
const allStudents = ref([]);
const loadingCenters = ref(false);
const loadingSections = ref(false);
const loadingStudents = ref(false);
const error = ref(null);

const selectedCenter = ref(null);
const selectedSection = ref(null);
const selectedYear = ref(null);

async function loadCenters() {
  loadingCenters.value = true;
  error.value = null;
  try {
    centers.value = await getCenters();
    // Cargar todos los estudiantes de todos los centros y secciones
    for (const center of centers.value) {
      try {
        const sections = await getCenterSections(center.id);
        sectionsMap.value[center.id] = sections;

        for (const section of sections) {
          const students = await getSectionStudents(section.id);
          if (students && students.length > 0) {
            const studentsWithInfo = students.map(s => ({
              ...s,
              center_id: center.id,
              center_name: center.name,
              section_id: section.id,
              section_name: section.name,
              academic_year: section.academic_year
            }));
            allStudents.value = [...allStudents.value, ...studentsWithInfo];
          }
        }
      } catch (err) {
        console.error('Error loading sections/students for center:', center.id, err);
      }
    }
  } catch (err) {
    error.value = 'Error al cargar los centros';
    console.error('Error loading centers:', err);
  } finally {
    loadingCenters.value = false;
  }
}

const sections = computed(() => {
  if (!selectedCenter.value) return [];
  return sectionsMap.value[selectedCenter.value] || [];
});

const years = computed(() => {
  const defaultYears = ['2024-25', '2023-24', '2022-23', '2021-22'];
  const uniqueYears = new Set(defaultYears);
  allStudents.value.forEach(s => {
    if (s.academic_year) {
      uniqueYears.add(s.academic_year);
    }
  });
  return Array.from(uniqueYears).sort().reverse();
});


const filteredStudents = computed(() => {
  let result = allStudents.value;

  if (selectedCenter.value) {
    result = result.filter(s => s.center_id === selectedCenter.value);
  }

  if (selectedSection.value) {
    result = result.filter(s => s.section_id === selectedSection.value);
  }

  if (selectedYear.value) {
    result = result.filter(s => s.academic_year === selectedYear.value);
  }

  return result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
});

function viewStudent(studentId) {
  const student = allStudents.value.find(s => s.id === studentId);
  if (student) {
    router.push({
      name: 'student-detail',
      params: {
        centerId: student.center_id,
        sectionId: student.section_id,
        studentId: studentId
      }
    });
  }
}

onMounted(loadCenters);
</script>

<template>
  <div class="students-view">
    <header class="view-header">
      <div class="header-content">
        <h1>Alumnado</h1>
        <p class="header-subtitle">Consulta el alumnado de cada centro y sección</p>
      </div>
    </header>

    <!-- Filtros -->
    <div class="filters-card">
      <div class="filters-title">
        <span class="filters-label">Filtros</span>
      </div>

      <div class="filters-grid">
        <!-- Centro -->
        <div class="filter-item">
          <label for="center-select" class="filter-label">Centro</label>
          <div class="select-wrapper">
            <select
              id="center-select"
              v-model="selectedCenter"
              class="filter-select"
              :disabled="loadingCenters"
            >
              <option value="">-- Seleccionar centro --</option>
              <option v-for="center in centers" :key="center.id" :value="center.id">
                {{ center.name }}
              </option>
            </select>
            <ChevronDown :size="18" class="select-icon" />
          </div>
        </div>

        <!-- Sección -->
        <div class="filter-item">
          <label for="section-select" class="filter-label">Sección</label>
          <div class="select-wrapper">
            <select
              id="section-select"
              v-model="selectedSection"
              class="filter-select"
              :disabled="loadingSections"
            >
              <option value="">-- Seleccionar sección --</option>
              <option v-for="section in sections" :key="section.id" :value="section.id">
                {{ section.name }}
              </option>
            </select>
            <ChevronDown :size="18" class="select-icon" />
          </div>
        </div>

        <!-- Año Académico -->
        <div class="filter-item">
          <label for="year-select" class="filter-label">Año Académico</label>
          <div class="select-wrapper">
            <select
              id="year-select"
              v-model="selectedYear"
              class="filter-select"
            >
              <option value="">-- Todos los años --</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <ChevronDown :size="18" class="select-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- Errores -->
    <div v-if="error" class="error-banner">
      <span>{{ error }}</span>
    </div>

    <!-- Estados de carga -->
    <div v-if="loadingCenters || loadingSections || loadingStudents" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="selectedSection && filteredStudents.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"></path>
      </svg>
      <p>No hay alumnos que coincidan con los filtros seleccionados.</p>
    </div>

    <!-- Tabla de estudiantes -->
    <div v-else-if="filteredStudents.length > 0" class="students-table-card">
      <div class="table-header">
        <h3>{{ filteredStudents.length }} alumno{{ filteredStudents.length !== 1 ? 's' : '' }}</h3>
      </div>

      <div class="table-wrapper">
        <table class="students-table">
          <thead>
            <tr>
              <th class="col-name">Nombre</th>
              <th class="col-action">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id" class="student-row">
              <td class="col-name">
                <span class="student-name">{{ student.name }}</span>
              </td>
              <td class="col-action">
                <button class="btn-view-student" @click="viewStudent(student.id)">
                  Ver ficha
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Instrucción inicial -->
    <div v-else class="initial-state">
      <svg class="initial-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <p>Selecciona un centro y una sección para ver el alumnado</p>
    </div>
  </div>
</template>

<style scoped>
.students-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header */
.view-header {
  background-color: var(--surface-container-lowest);
  padding: 2rem 0;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--outline-variant);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.view-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--on-surface);
}

.header-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: var(--on-surface-variant);
}

/* Filtros */
.filters-card {
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.filters-title {
  background-color: var(--surface-container-low);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--outline-variant);
}

.filters-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--on-surface);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--on-surface);
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid var(--outline);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  color: var(--on-surface);
  font-size: 0.9rem;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease;
}

.filter-select:hover:not(:disabled) {
  border-color: var(--primary);
  background-color: var(--surface-container-low);
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 108, 73, 0.1);
}

.filter-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--surface-container-lowest);
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  pointer-events: none;
  color: var(--on-surface-variant);
  flex-shrink: 0;
}

/* Error Banner */
.error-banner {
  background-color: var(--error);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  color: var(--on-surface-variant);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--outline-variant);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  background-color: var(--surface-container-lowest);
  border: 1px dashed var(--outline-variant);
  border-radius: var(--radius-lg);
  color: var(--on-surface-variant);
  text-align: center;
}

.empty-icon,
.initial-icon {
  width: 48px;
  height: 48px;
  color: var(--on-surface-variant);
  opacity: 0.5;
}

.empty-state p,
.initial-state p {
  margin: 0;
  font-size: 0.95rem;
}

/* Table */
.students-table-card {
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-header {
  background-color: var(--surface-container-low);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--outline-variant);
}

.table-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--on-surface);
}

.table-wrapper {
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.students-table th {
  background-color: var(--surface-container-low);
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--outline-variant);
}

.students-table td {
  padding: 1.125rem 1.25rem;
  border-bottom: 1px solid var(--outline-variant);
  color: var(--on-surface);
}

.student-row:hover td {
  background-color: var(--surface-container-low);
}

.student-row:last-child td {
  border-bottom: none;
}

.col-name {
  width: 50%;
}

.col-year {
  width: 25%;
}

.col-action {
  width: 25%;
  text-align: center;
}

.student-name {
  font-weight: 500;
  color: var(--on-surface);
}

.year-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  background-color: var(--secondary-fixed);
  color: var(--on-primary-fixed-variant);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-view-student {
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: var(--on-primary);
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view-student:hover {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
  border-color: var(--primary);
}

.btn-view-student:active {
  transform: scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .students-view {
    gap: 1.5rem;
  }

  .view-header {
    padding: 1.5rem 1rem;
  }

  .view-header h1 {
    font-size: 1.5rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .col-name {
    width: 60%;
  }

  .col-year {
    width: 20%;
  }

  .col-action {
    width: 20%;
  }

  .students-table th,
  .students-table td {
    padding: 0.75rem 0.9rem;
    font-size: 0.85rem;
  }

  .btn-view-student {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
}
</style>
