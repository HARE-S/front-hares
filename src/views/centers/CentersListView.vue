<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getCenters, getCenterSections, getSectionStudents } from '@/services/directoryService';
import { matchesQuery } from '@/utils/search';
import {
  ChevronDown,
  FileSpreadsheet,
  Search,
  X,
  RotateCcw,
  ArrowUpDown,
  Building2,
  Users
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const centers = ref([]);
const sectionsMap = ref({});
const allStudents = ref([]);
const loadingCenters = ref(false);
const loadingSections = ref(false);
const loadingStudents = ref(false);
const error = ref(null);

const searchQuery = ref('');
const selectedCenter = ref('');
const selectedSection = ref('');
const selectedYear = ref('');
const sortBy = ref('name');
const sortOrder = ref('asc');

async function loadCenters() {
  loadingCenters.value = true;
  error.value = null;
  try {
    centers.value = await getCenters();
    // Cargar todos los estudiantes de todos los centros y secciones
    for (const center of centers.value) {
      try {
        const sections = await getCenterSections(center.id);
        sectionsMap.value[center.id] = Array.isArray(sections) ? sections : [];

        if (Array.isArray(sections)) {
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
        }
      } catch (err) {
        console.error('Error loading sections/students for center:', center.id, err);
      }
    }
  } catch (err) {
    error.value = err?.message || 'Error al cargar los centros';
    console.error('Error loading centers:', err);
  } finally {
    loadingCenters.value = false;
  }
}

// Al cambiar de centro, resetear sección si no pertenece al nuevo centro
watch(selectedCenter, (newCenter) => {
  if (newCenter) {
    const validSections = sectionsMap.value[newCenter] || [];
    if (!validSections.some(s => s.id === selectedSection.value)) {
      selectedSection.value = '';
    }
  } else {
    selectedSection.value = '';
  }
});

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

const hasActiveFilters = computed(() => {
  return Boolean(
    (selectedCenter.value && selectedCenter.value !== '') ||
    (selectedSection.value && selectedSection.value !== '') ||
    (selectedYear.value && selectedYear.value !== '') ||
    searchQuery.value.trim()
  );
});

function clearSearch() {
  searchQuery.value = '';
}

function resetFilters() {
  selectedCenter.value = '';
  selectedSection.value = '';
  selectedYear.value = '';
  searchQuery.value = '';
  sortBy.value = 'name';
  sortOrder.value = 'asc';
}

function toggleSort(field) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
}

function getInitials(name) {
  if (!name) return 'AL';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

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

  const q = searchQuery.value.trim();
  if (q) {
    result = result.filter(s => {
      if (matchesQuery(s.name, q)) return true;
      if (s.external_id && matchesQuery(s.external_id, q)) return true;
      if (s.center_name && matchesQuery(s.center_name, q)) return true;
      if (s.section_name && matchesQuery(s.section_name, q)) return true;
      return false;
    });
  }

  return result.slice().sort((a, b) => {
    let valA = '';
    let valB = '';
    if (sortBy.value === 'center') {
      valA = a.center_name || '';
      valB = b.center_name || '';
    } else if (sortBy.value === 'section') {
      valA = a.section_name || '';
      valB = b.section_name || '';
    } else {
      valA = a.name || '';
      valB = b.name || '';
    }
    const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
});

function viewStudent(studentId) {
  const student = allStudents.value.find(s => s.id === studentId);
  if (student) {
    router.push({
      name: 'student-detail',
      params: {
        centerId: student.center_id || 'c-1',
        sectionId: student.section_id || 's-1',
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
      <div class="header-container">
        <div class="header-content">
          <h1>Alumnado</h1>
          <p class="header-subtitle">Consulta y busca el alumnado de cada centro y sección</p>
          <p class="source-note">Los datos proceden de Alexia y son de solo lectura.</p>
        </div>
        <div class="header-actions">
          <router-link to="/import" class="btn-import-header" title="Importar datos desde Excel o Alexia">
            <FileSpreadsheet :size="16" />
            <span>Importar Excel</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Resumen de centros activos en el ámbito del docente -->
    <div v-if="centers && centers.length > 0" class="centers-summary-bar">
      <div
        v-for="c in centers"
        :key="c.id"
        class="center-pill"
        data-testid="center-row"
      >
        <span class="center-name">{{ c.name }}</span>
        <span v-if="c.sections_count !== undefined" class="badge-count">{{ c.sections_count }}</span>
      </div>
    </div>

    <!-- Filtros y Buscador -->
    <div class="filters-card">
      <div class="filters-title">
        <div class="filters-title-left">
          <span class="filters-label">Búsqueda y Filtros</span>
          <span v-if="allStudents.length > 0" class="filters-sub-count">
            ({{ allStudents.length }} alumnos en total)
          </span>
        </div>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="btn-reset-filters"
          title="Restablecer todos los filtros"
          @click="resetFilters"
        >
          <RotateCcw :size="13" />
          <span>Limpiar filtros</span>
        </button>
      </div>

      <div class="filters-grid">
        <!-- Buscador por Nombre, Apellidos o ID -->
        <div class="filter-item filter-search">
          <label for="student-search-input" class="filter-label">Buscar alumno</label>
          <div class="search-input-wrapper">
            <Search :size="18" class="search-input-icon" />
            <input
              id="student-search-input"
              v-model="searchQuery"
              type="text"
              class="filter-input-search"
              placeholder="Buscar por nombre, apellidos, ID..."
              aria-label="Buscar alumno por nombre, apellidos o identificador"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="btn-clear-search-inline"
              aria-label="Borrar búsqueda"
              title="Borrar texto"
              @click="clearSearch"
            >
              <X :size="15" />
            </button>
          </div>
        </div>

        <!-- Selector de Centro -->
        <div class="filter-item">
          <label for="center-select" class="filter-label">Centro</label>
          <div class="select-wrapper">
            <select
              id="center-select"
              v-model="selectedCenter"
              class="filter-select"
              :disabled="loadingCenters"
            >
              <option value="">-- Todos los centros --</option>
              <option v-for="center in centers" :key="center.id" :value="center.id">
                {{ center.name }}
              </option>
            </select>
            <ChevronDown :size="18" class="select-icon" />
          </div>
        </div>

        <!-- Selector de Sección -->
        <div class="filter-item">
          <label for="section-select" class="filter-label">Sección</label>
          <div class="select-wrapper">
            <select
              id="section-select"
              v-model="selectedSection"
              class="filter-select"
              :disabled="loadingSections || !selectedCenter"
            >
              <option value="">{{ selectedCenter ? '-- Todas las secciones --' : '-- Selecciona centro primero --' }}</option>
              <option v-for="section in sections" :key="section.id" :value="section.id">
                {{ section.name }}
              </option>
            </select>
            <ChevronDown :size="18" class="select-icon" />
          </div>
        </div>

        <!-- Selector de Año Académico -->
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
    <div v-if="error" class="error-banner" role="alert">
      <span>{{ error }}</span>
      <button type="button" class="btn-retry" @click="loadCenters">Reintentar</button>
    </div>

    <!-- Estados de carga -->
    <div v-if="loadingCenters || loadingSections || loadingStudents" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>

    <!-- Estado vacío cuando no hay resultados para los filtros -->
    <div v-else-if="hasActiveFilters && filteredStudents.length === 0" class="empty-state">
      <Search class="empty-icon" :size="48" />
      <p class="empty-title">No hay alumnos que coincidan con los filtros seleccionados.</p>
      <p class="empty-hint">Prueba con otro término de búsqueda o limpia los filtros para ver el listado completo.</p>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="btn-clear-search-empty"
        @click="resetFilters"
      >
        <RotateCcw :size="14" />
        <span>Restablecer filtros</span>
      </button>
    </div>

    <!-- Tabla de estudiantes -->
    <div v-else-if="filteredStudents.length > 0" class="students-table-card">
      <div class="table-header">
        <div class="table-header-left">
          <h3>{{ filteredStudents.length }} alumno{{ filteredStudents.length !== 1 ? 's' : '' }}</h3>
          <span v-if="hasActiveFilters && allStudents.length > 0" class="filter-count-hint">
            (filtrado de {{ allStudents.length }} en total)
          </span>
        </div>
        <div v-if="searchQuery.trim()" class="search-term-badge">
          <span>Buscando: <strong>"{{ searchQuery.trim() }}"</strong></span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="students-table">
          <thead>
            <tr>
              <th class="col-name" @click="toggleSort('name')">
                <div class="th-content">
                  <span>Alumno</span>
                  <ArrowUpDown :size="13" class="sort-icon" />
                </div>
              </th>
              <th class="col-center" @click="toggleSort('center')">
                <div class="th-content">
                  <span>Centro</span>
                  <ArrowUpDown :size="13" class="sort-icon" />
                </div>
              </th>
              <th class="col-section" @click="toggleSort('section')">
                <div class="th-content">
                  <span>Sección / Grupo</span>
                  <ArrowUpDown :size="13" class="sort-icon" />
                </div>
              </th>
              <th class="col-year">Año Académico</th>
              <th class="col-action">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id" class="student-row">
              <td class="col-name">
                <div class="student-profile-cell">
                  <div class="student-avatar-chip">
                    {{ getInitials(student.name) }}
                  </div>
                  <div class="student-info-meta">
                    <span class="student-name">{{ student.name }}</span>
                    <span v-if="student.external_id" class="student-external-id">
                      ID: {{ student.external_id }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="col-center">
                <span class="center-badge">{{ student.center_name || '—' }}</span>
              </td>
              <td class="col-section">
                <span class="section-pill">{{ student.section_name || '—' }}</span>
              </td>
              <td class="col-year">
                <span class="year-badge">{{ student.academic_year || '2024-25' }}</span>
              </td>
              <td class="col-action">
                <button
                  type="button"
                  class="btn-view-student"
                  title="Ver ficha del alumno"
                  @click="viewStudent(student.id)"
                >
                  Ver ficha
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Instrucción inicial cuando no hay filtros y no hay alumnos cargados -->
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
  padding: 1.5rem 0;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--outline-variant);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  padding: 0;
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

.source-note {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  margin-top: 0.25rem;
  font-style: italic;
}

.header-actions {
  display: flex;
  align-items: center;
}

.btn-import-header {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  background-color: var(--surface-container-lowest);
  color: var(--on-surface);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-import-header:hover {
  background-color: var(--surface-container-low);
  border-color: var(--primary);
  color: var(--primary);
}

/* Summary Bar */
.centers-summary-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.center-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-full, 9999px);
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  color: var(--on-surface);
}

.badge-count {
  background-color: var(--surface-container-high);
  color: var(--on-surface-variant);
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Filtros */
.filters-card {
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05));
}

.filters-title {
  background-color: var(--surface-container-low);
  padding: 0.85rem 1.5rem;
  border-bottom: 1px solid var(--outline-variant);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-title-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filters-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--on-surface);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filters-sub-count {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  font-weight: 500;
}

.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background-color: var(--surface-container-high);
  color: var(--on-surface);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset-filters:hover {
  background-color: var(--surface-container-highest);
  border-color: var(--primary);
  color: var(--primary);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  padding: 1.5rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.filter-search {
  grid-column: 1 / -1;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--on-surface);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-input-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--on-surface-variant);
  pointer-events: none;
}

.filter-input-search {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.6rem;
  padding-right: 2.5rem;
  border: 1px solid var(--outline);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  color: var(--on-surface);
  font-size: 0.92rem;
  transition: all 0.2s ease;
}

.filter-input-search:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 108, 73, 0.12);
}

.btn-clear-search-inline {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--on-surface-variant);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.btn-clear-search-inline:hover {
  background-color: var(--surface-container-high);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-retry {
  margin-left: 1rem;
  padding: 0.35rem 0.75rem;
  background-color: white;
  color: var(--error, #ba1a1a);
  border: 1px solid var(--error, #ba1a1a);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-retry:hover {
  background-color: var(--error-container, #ffdad6);
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
  gap: 0.75rem;
  padding: 3.5rem 1.5rem;
  background-color: var(--surface-container-lowest);
  border: 1px dashed var(--outline-variant);
  border-radius: var(--radius-lg);
  color: var(--on-surface-variant);
  text-align: center;
}

.empty-icon,
.initial-icon {
  width: 44px;
  height: 44px;
  color: var(--on-surface-variant);
  opacity: 0.45;
  margin-bottom: 0.25rem;
}

.empty-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--on-surface);
}

.empty-hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--on-surface-variant);
}

.btn-clear-search-empty {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: var(--surface-container-high);
  color: var(--on-surface);
  border: 1px solid var(--outline);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-search-empty:hover {
  background-color: var(--surface-container-highest);
  border-color: var(--primary);
  color: var(--primary);
}

/* Students Table */
.students-table-card {
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05));
}

.table-header {
  background-color: var(--surface-container-low);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--outline-variant);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.table-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.table-header h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--on-surface);
}

.filter-count-hint {
  font-size: 0.85rem;
  color: var(--on-surface-variant);
}

.search-term-badge {
  font-size: 0.82rem;
  background-color: var(--surface-container-high);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
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
  padding: 0.95rem 1.25rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  border-bottom: 1px solid var(--outline-variant);
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  user-select: none;
}

.th-content:hover {
  color: var(--primary);
}

.sort-icon {
  opacity: 0.6;
}

.students-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--outline-variant);
  color: var(--on-surface);
  vertical-align: middle;
}

.student-row:hover td {
  background-color: var(--surface-container-low);
}

.student-row:last-child td {
  border-bottom: none;
}

.col-name {
  width: 32%;
}

.col-center {
  width: 24%;
}

.col-section {
  width: 20%;
}

.col-year {
  width: 12%;
}

.col-action {
  width: 12%;
  text-align: right;
}

.student-profile-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar-chip {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--primary-container, #d1e8d5);
  color: var(--on-primary-container, #002114);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.student-info-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.student-name {
  font-weight: 600;
  color: var(--on-surface);
  line-height: 1.2;
}

.student-external-id {
  font-size: 0.75rem;
  color: var(--on-surface-variant);
  font-family: monospace;
}

.center-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  background-color: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  font-weight: 500;
}

.section-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  background-color: var(--secondary-container, #e8def8);
  color: var(--on-secondary-container, #1d192b);
  border-radius: var(--radius-full, 9999px);
  font-size: 0.78rem;
  font-weight: 600;
}

.year-badge {
  display: inline-block;
  padding: 0.25rem 0.55rem;
  background-color: var(--surface-container-high);
  color: var(--on-surface-variant);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
}

.btn-view-student {
  padding: 0.45rem 0.9rem;
  background-color: var(--primary);
  color: var(--on-primary);
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
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
@media (max-width: 900px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 680px) {
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

  .students-table th,
  .students-table td {
    padding: 0.75rem 0.85rem;
    font-size: 0.85rem;
  }

  .col-center,
  .col-year {
    display: none;
  }

  .btn-view-student {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>
