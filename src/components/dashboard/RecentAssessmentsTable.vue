<template>
  <section aria-label="Tabla de Evaluaciones" class="recent-assessments-section">
    <!-- Table Control Toolbar -->
    <div class="toolbar-container">
      <div>
        <h2 class="toolbar-title">Últimas Evaluaciones Registradas</h2>
        <p class="toolbar-subtitle">Sesiones de lectura individual cronometrada y comprensión inferencial</p>
      </div>

      <!-- Filters Cluster -->
      <div class="filters-cluster">
        <!-- Filter Dropdown: Test Type -->
        <select 
          v-model="selectedType" 
          class="filter-select"
          aria-label="Filtrar por tipo de prueba"
        >
          <option value="">Todas las pruebas</option>
          <option value="Lectura de Palabras">Lectura de Palabras</option>
          <option value="Pseudopalabras">Pseudopalabras</option>
          <option value="Texto Continuo">Texto Continuo</option>
        </select>

        <!-- Search input in table -->
        <div class="search-box">
          <span class="search-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </span>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Filtrar alumno..." 
            class="search-input"
            aria-label="Filtrar alumno"
          />
        </div>

        <!-- Download Button -->
        <button 
          type="button" 
          class="download-btn"
          @click="handleExport"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
          </svg>
          <span>Descargar registros</span>
        </button>
      </div>
    </div>

    <!-- Scrollable Table Canvas -->
    <div class="table-responsive">
      <table class="assessments-table">
        <thead>
          <tr>
            <th scope="col" class="th-left">Alumno</th>
            <th scope="col" class="th-left">Código de Prueba</th>
            <th scope="col" class="th-left">Fecha</th>
            <th scope="col" class="th-right">Velocidad</th>
            <th scope="col" class="th-right">Exactitud</th>
            <th scope="col" class="th-center">Comprensión</th>
            <th scope="col" class="th-center">Estado / Nivel</th>
            <th scope="col" class="th-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="assessment in paginatedAssessments" 
            :key="assessment.id"
            :class="['table-row', { 'row-alert': assessment.level === 'Requiere apoyo' }]"
          >
            <!-- Alumno -->
            <td class="td-student">
              <div class="student-cell">
                <div 
                  class="student-avatar" 
                  :class="avatarClass(assessment.level)"
                >
                  {{ assessment.initials }}
                </div>
                <span class="student-name">{{ assessment.studentName }}</span>
              </div>
            </td>

            <!-- Código de Prueba -->
            <td class="td-test-code">
              <div class="code-cell">
                <span class="code-badge">{{ assessment.testCode }}</span>
                <span class="test-title">{{ assessment.testTitle }}</span>
              </div>
            </td>

            <!-- Fecha -->
            <td class="td-date">{{ assessment.date }}</td>

            <!-- Velocidad -->
            <td class="td-speed text-right">
              <span 
                class="speed-metric" 
                :class="speedClass(assessment.speed)"
              >
                {{ assessment.speed }} PPM
              </span>
            </td>

            <!-- Exactitud -->
            <td class="td-accuracy text-right">
              <span :class="accuracyClass(assessment.accuracy)">
                {{ assessment.accuracy }}%
              </span>
            </td>

            <!-- Comprensión -->
            <td class="td-comprension text-center">
              <span 
                class="score-badge"
                :class="assessment.comprehension === '4/4' ? 'score-badge--perfect' : 'score-badge--alert'"
              >
                <svg v-if="assessment.comprehension === '4/4'" class="icon-check" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {{ assessment.comprehension }}
              </span>
            </td>

            <!-- Estado / Nivel -->
            <td class="td-status text-center">
              <span class="status-badge" :class="statusBadgeClass(assessment.level)">
                <span class="status-dot" :class="statusDotClass(assessment.level)"></span>
                {{ assessment.level }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="td-actions text-center">
              <div class="actions-group">
                <button 
                  type="button" 
                  class="btn-audio" 
                  :title="'Escuchar audio de ' + assessment.studentName"
                  @click="playAudio(assessment)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </button>
                <button 
                  type="button" 
                  class="btn-detail"
                  @click="viewDetail(assessment)"
                >
                  Ver detalle
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredAssessments.length === 0">
            <td colspan="8" class="empty-row">
              No se encontraron evaluaciones con los filtros seleccionados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Pagination & Record Counter -->
    <div class="pagination-footer">
      <span>
        Mostrando <strong>{{ paginatedAssessments.length }}</strong> de <strong>{{ filteredAssessments.length }}</strong> evaluaciones registradas en el Corte A
      </span>
      <div class="pagination-nav">
        <button
          type="button"
          class="btn-page-nav"
          :disabled="currentPage === 1"
          @click="prevPage"
          aria-label="Página anterior"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          type="button"
          class="btn-page-num"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="btn-page-nav"
          :disabled="currentPage === totalPages"
          @click="nextPage"
          aria-label="Página siguiente"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  course: {
    type: String,
    default: '2024-25'
  }
});

const emit = defineEmits(['export', 'play-audio', 'view-detail']);

const currentCourse = ref(props.course);

watch(() => props.course, (newCourse) => {
  currentCourse.value = newCourse;
  console.log('📋 RecentAssessmentsTable: Curso cambió a', newCourse);
});

const searchQuery = ref('');
const selectedType = ref('');
const currentPage = ref(1);
const itemsPerPage = 4;

const assessmentsByCourse = {
  '2024-25': [
    { id: 1, studentName: 'Lucas Méndez Ruiz', initials: 'LM', testCode: '3AF', testTitle: 'El bosque animado', testType: 'Texto Continuo', date: '24 Ene 2025', speed: 128, accuracy: 98.5, comprehension: '4/4', level: 'Avanzado' },
    { id: 2, studentName: 'Sofía Navarro Ortiz', initials: 'SN', testCode: '3AF', testTitle: 'El bosque animado', testType: 'Texto Continuo', date: '24 Ene 2025', speed: 118, accuracy: 96.0, comprehension: '4/4', level: 'En nivel' },
    { id: 3, studentName: 'Mateo Barrenechea', initials: 'MB', testCode: '3BL', testTitle: 'Aventuras en el mar', testType: 'Lectura de Palabras', date: '23 Ene 2025', speed: 82, accuracy: 88.0, comprehension: '2/4', level: 'Requiere apoyo' },
    { id: 4, studentName: 'Aitana Zubizarreta', initials: 'AZ', testCode: '3AF', testTitle: 'El bosque animado', testType: 'Texto Continuo', date: '23 Ene 2025', speed: 122, accuracy: 97.2, comprehension: '4/4', level: 'En nivel' },
    { id: 5, studentName: 'Iker Goikoetxea', initials: 'IG', testCode: '3CF', testTitle: 'Misterio en el museo', testType: 'Pseudopalabras', date: '22 Ene 2025', speed: 78, accuracy: 85.5, comprehension: '1/4', level: 'Requiere apoyo' },
    { id: 6, studentName: 'Emma Larrañaga', initials: 'EL', testCode: '3AF', testTitle: 'El bosque animado', testType: 'Texto Continuo', date: '21 Ene 2025', speed: 134, accuracy: 99.1, comprehension: '4/4', level: 'Avanzado' }
  ],
  '2023-24': [
    { id: 7, studentName: 'Carlos Mendoza', initials: 'CM', testCode: '2AF', testTitle: 'La casa', testType: 'Texto Continuo', date: '20 Ene 2025', speed: 105, accuracy: 92.0, comprehension: '3/4', level: 'En nivel' },
    { id: 8, studentName: 'Isabel García', initials: 'IG', testCode: '2BL', testTitle: 'Viaje al futuro', testType: 'Lectura de Palabras', date: '19 Ene 2025', speed: 115, accuracy: 95.5, comprehension: '4/4', level: 'En nivel' },
    { id: 9, studentName: 'Francisco Pérez', initials: 'FP', testCode: '2CF', testTitle: 'El misterio', testType: 'Pseudopalabras', date: '18 Ene 2025', speed: 88, accuracy: 90.0, comprehension: '2/4', level: 'Requiere apoyo' },
    { id: 10, studentName: 'Ángela López', initials: 'AL', testCode: '2AF', testTitle: 'La casa', testType: 'Texto Continuo', date: '17 Ene 2025', speed: 120, accuracy: 99.0, comprehension: '4/4', level: 'Avanzado' }
  ],
  '2022-23': [
    { id: 11, studentName: 'Fernando Ruiz', initials: 'FR', testCode: '1AF', testTitle: 'El pueblo', testType: 'Texto Continuo', date: '16 Ene 2025', speed: 95, accuracy: 85.0, comprehension: '2/4', level: 'Requiere apoyo' },
    { id: 12, studentName: 'Alejandra López', initials: 'AL', testCode: '1BL', testTitle: 'Historias', testType: 'Lectura de Palabras', date: '15 Ene 2025', speed: 108, accuracy: 93.0, comprehension: '3/4', level: 'En nivel' },
    { id: 13, studentName: 'David García', initials: 'DG', testCode: '1CF', testTitle: 'Palabras nuevas', testType: 'Pseudopalabras', date: '14 Ene 2025', speed: 98, accuracy: 89.0, comprehension: '3/4', level: 'En nivel' },
    { id: 14, studentName: 'Mónica Sánchez', initials: 'MS', testCode: '1AF', testTitle: 'El pueblo', testType: 'Texto Continuo', date: '13 Ene 2025', speed: 118, accuracy: 96.0, comprehension: '4/4', level: 'En nivel' }
  ],
  '2021-22': [
    { id: 15, studentName: 'Antonio López', initials: 'AL', testCode: '0AF', testTitle: 'Inicio', testType: 'Texto Continuo', date: '12 Ene 2025', speed: 85, accuracy: 80.0, comprehension: '1/4', level: 'Requiere apoyo' },
    { id: 16, studentName: 'Beatriz García', initials: 'BG', testCode: '0BL', testTitle: 'Principios', testType: 'Lectura de Palabras', date: '11 Ene 2025', speed: 102, accuracy: 91.0, comprehension: '3/4', level: 'En nivel' },
    { id: 17, studentName: 'Enrique Pérez', initials: 'EP', testCode: '0CF', testTitle: 'Letras', testType: 'Pseudopalabras', date: '10 Ene 2025', speed: 78, accuracy: 82.0, comprehension: '1/4', level: 'Requiere apoyo' },
    { id: 18, studentName: 'Silvia Ruiz', initials: 'SR', testCode: '0AF', testTitle: 'Inicio', testType: 'Texto Continuo', date: '09 Ene 2025', speed: 112, accuracy: 94.0, comprehension: '3/4', level: 'En nivel' }
  ]
};

const allAssessments = computed(() => assessmentsByCourse[currentCourse.value] || assessmentsByCourse['2024-25']);

const filteredAssessments = computed(() => {
  return allAssessments.value.filter(item => {
    const matchesSearch = searchQuery.value === '' ||
      item.studentName.toLowerCase().includes(searchQuery.value.trim().toLowerCase()) ||
      item.testCode.toLowerCase().includes(searchQuery.value.trim().toLowerCase()) ||
      item.testTitle.toLowerCase().includes(searchQuery.value.trim().toLowerCase());

    const matchesType = selectedType.value === '' || item.testType === selectedType.value;

    return matchesSearch && matchesType;
  });
});

const totalPages = computed(() => Math.ceil(filteredAssessments.value.length / itemsPerPage));

const paginatedAssessments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAssessments.value.slice(start, end);
});

const pageNumbers = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i);
  }
  return pages;
});

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function avatarClass(level) {
  if (level === 'Requiere apoyo') return 'avatar--error';
  if (level === 'Avanzado') return 'avatar--primary';
  return 'avatar--neutral';
}

function speedClass(speed) {
  if (speed < 85) return 'metric--error';
  if (speed > 125) return 'metric--secondary';
  return 'metric--default';
}

function accuracyClass(acc) {
  if (acc < 90) return 'text-error font-medium';
  return 'text-on-surface font-medium';
}

function statusBadgeClass(level) {
  if (level === 'Avanzado') return 'status-badge--avanzado';
  if (level === 'Requiere apoyo') return 'status-badge--error';
  return 'status-badge--optimo';
}

function statusDotClass(level) {
  if (level === 'Avanzado') return 'dot-secondary';
  if (level === 'Requiere apoyo') return 'dot-error';
  return 'dot-secondary';
}

function handleExport() {
  emit('export', filteredAssessments.value);
}

function playAudio(assessment) {
  emit('play-audio', assessment);
}

function viewDetail(assessment) {
  emit('view-detail', assessment);
}
</script>

<style scoped>
.recent-assessments-section {
  background: var(--color-surface-container-lowest, #ffffff);
  border-radius: var(--radius-xl, 0.75rem);
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  overflow: hidden;
}

/* Toolbar */
.toolbar-container {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(189, 201, 192, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--color-surface-container-lowest, #ffffff);
}

@media (min-width: 768px) {
  .toolbar-container {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.toolbar-title {
  font-family: var(--font-family-display, 'Plus Jakarta Sans', sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-on-surface, #191c1b);
  margin: 0;
}

.toolbar-subtitle {
  font-size: 0.875rem;
  color: var(--color-on-surface-variant, #3f4943);
  margin: 0.25rem 0 0 0;
}

.filters-cluster {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  background-color: var(--color-surface-container-low, #f2f5f2);
  color: var(--color-on-surface, #191c1b);
  font-size: 0.875rem;
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid rgba(189, 201, 192, 0.5);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.filter-select:focus {
  border-color: var(--color-secondary, #006c49);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.65rem;
  pointer-events: none;
  color: var(--color-on-surface-variant, #3f4943);
  display: flex;
  align-items: center;
}

.search-input {
  background-color: var(--color-surface-container-low, #f2f5f2);
  color: var(--color-on-surface, #191c1b);
  font-size: 0.875rem;
  padding: 0.45rem 0.75rem 0.45rem 2rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid rgba(189, 201, 192, 0.5);
  outline: none;
  width: 11rem;
  transition: border-color 0.15s ease, width 0.2s ease;
}

.search-input:focus {
  border-color: var(--color-secondary, #006c49);
  width: 13rem;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background-color: var(--color-surface-container-low, #f2f5f2);
  color: var(--color-on-surface, #191c1b);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid rgba(189, 201, 192, 0.5);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.download-btn:hover {
  background-color: var(--color-surface-container-high, #e2e9e2);
}

/* Table */
.table-responsive {
  overflow-x: auto;
}

.assessments-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.assessments-table thead tr {
  background-color: var(--color-surface-container-low, #f2f5f2);
  border-bottom: 1px solid rgba(189, 201, 192, 0.3);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-on-surface-variant, #3f4943);
  font-weight: 700;
}

.assessments-table th,
.assessments-table td {
  padding: 0.85rem 1rem;
}

.th-left { text-align: left; }
.th-right { text-align: right; }
.th-center { text-align: center; }

.table-row {
  border-bottom: 1px solid rgba(189, 201, 192, 0.2);
  transition: background-color 0.15s ease;
  font-size: 0.875rem;
}

.table-row:hover {
  background-color: var(--color-surface-container-low, #f2f5f2);
}

.row-alert {
  background-color: rgba(186, 26, 26, 0.04);
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.avatar--primary {
  background-color: var(--color-primary-fixed, #8ef7c7);
  color: var(--color-on-primary-fixed-variant, #005136);
}

.avatar--neutral {
  background-color: var(--color-surface-container-high, #e2e9e2);
  color: var(--color-on-surface-variant, #3f4943);
}

.avatar--error {
  background-color: var(--color-error-container, #ffdad6);
  color: var(--color-on-error-container, #410002);
}

.student-name {
  font-weight: 600;
  color: var(--color-primary, #0f3e2e);
}

.code-cell {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.code-badge {
  background-color: var(--color-surface-container-high, #e2e9e2);
  color: var(--color-on-surface-variant, #3f4943);
  font-size: 0.75rem;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-weight: 700;
}

.test-title {
  color: var(--color-on-surface-variant, #3f4943);
  font-size: 0.8125rem;
}

.td-date {
  color: var(--color-on-surface-variant, #3f4943);
  font-size: 0.8125rem;
}

.speed-metric {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-size: 0.9375rem;
}

.metric--secondary {
  color: var(--color-secondary, #006c49);
}

.metric--error {
  color: var(--color-error, #ba1a1a);
}

.metric--default {
  color: var(--color-on-surface, #191c1b);
}

.text-error {
  color: var(--color-error, #ba1a1a);
}

.text-on-surface {
  color: var(--color-on-surface, #191c1b);
}

.text-right { text-align: right; }
.text-center { text-align: center; }

.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.score-badge--perfect {
  background-color: var(--color-surface-container-high, #e2e9e2);
  color: var(--color-on-surface, #191c1b);
}

.score-badge--alert {
  background-color: rgba(186, 26, 26, 0.12);
  color: var(--color-error, #ba1a1a);
}

.icon-check {
  color: var(--color-secondary, #006c49);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  font-weight: 700;
}

.status-badge--avanzado {
  background-color: rgba(142, 247, 199, 0.45);
  color: var(--color-on-secondary-fixed-variant, #005136);
}

.status-badge--optimo {
  background-color: rgba(111, 251, 190, 0.25);
  color: var(--color-on-primary-fixed-variant, #005136);
}

.status-badge--error {
  background-color: var(--color-error-container, #ffdad6);
  color: var(--color-on-error-container, #410002);
}

.status-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
}

.dot-secondary {
  background-color: var(--color-secondary, #006c49);
}

.dot-error {
  background-color: var(--color-error, #ba1a1a);
}

.actions-group {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-audio {
  color: var(--color-on-surface-variant, #3f4943);
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.btn-audio:hover {
  color: var(--color-secondary, #006c49);
}

.btn-detail {
  font-size: 0.75rem;
  color: var(--color-secondary, #006c49);
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: text-decoration 0.15s ease;
}

.btn-detail:hover {
  text-decoration: underline;
}

.empty-row {
  text-align: center;
  padding: 2rem;
  color: var(--color-on-surface-variant, #3f4943);
}

/* Pagination Footer */
.pagination-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(189, 201, 192, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: var(--color-surface-container-lowest, #ffffff);
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant, #3f4943);
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .pagination-footer {
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
  }
}

.pagination-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  row-gap: 0.5rem;
}

.btn-page-nav {
  padding: 0;
  border-radius: 0.35rem;
  border: 1px solid rgba(189, 201, 192, 0.5);
  background: none;
  color: var(--color-on-surface-variant, #3f4943);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.btn-page-nav:hover:not(:disabled) {
  background-color: var(--color-surface-container-low, #f2f5f2);
  border-color: rgba(189, 201, 192, 0.8);
}

.btn-page-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-page-nav svg {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}

.btn-page-num {
  padding: 0;
  border-radius: 0.35rem;
  border: 1px solid transparent;
  background: none;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-on-surface, #191c1b);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  line-height: 1;
}

.btn-page-num.active {
  background-color: var(--color-primary-container, #0f3e2e);
  color: var(--color-secondary-fixed, #6ffbbe);
  font-weight: 700;
  border-color: rgba(111, 251, 190, 0.3);
}

.btn-page-num:not(.active):hover {
  background-color: var(--color-surface-container-low, #f2f5f2);
  border-color: rgba(189, 201, 192, 0.5);
}

@media (max-width: 1024px) {
  .pagination-footer {
    padding: 0.85rem 1rem;
    font-size: 0.75rem;
  }

  .pagination-nav {
    gap: 0.25rem;
  }

  .btn-page-nav,
  .btn-page-num {
    width: 32px;
    height: 32px;
  }

  .btn-page-nav svg {
    width: 12px;
    height: 12px;
  }

  .btn-page-num {
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .pagination-footer {
    padding: 0.75rem 0.85rem;
    gap: 0.5rem;
  }

  .pagination-nav {
    gap: 0.2rem;
  }

  .btn-page-nav,
  .btn-page-num {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .btn-page-nav svg {
    width: 11px;
    height: 11px;
  }
}
</style>
