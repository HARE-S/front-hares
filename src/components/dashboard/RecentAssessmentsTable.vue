<template>
  <section aria-label="Tabla de Evaluaciones" class="recent-assessments-section">
    <!-- Table Control Toolbar -->
    <div class="toolbar-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
    <div class="table-responsive overflow-x-auto">
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
            v-for="assessment in filteredAssessments" 
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
                  :aria-label="'Escuchar audio de ' + assessment.studentName"
                  @click="playAudio(assessment)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  <span class="btn-audio-text">Audio</span>
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
        Mostrando <strong>{{ filteredAssessments.length }}</strong> de <strong>{{ allAssessments.length }}</strong> evaluaciones registradas en el Corte A
      </span>
      <div class="pagination-nav">
        <button type="button" class="btn-page-nav" disabled aria-label="Página anterior">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button type="button" class="btn-page-num active">1</button>
        <button type="button" class="btn-page-num">2</button>
        <button type="button" class="btn-page-num">3</button>
        <button type="button" class="btn-page-nav" aria-label="Página siguiente">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['export', 'play-audio', 'view-detail']);

const searchQuery = ref('');
const selectedType = ref('');

const allAssessments = ref([
  {
    id: 1,
    studentName: 'Lucas Méndez Ruiz',
    initials: 'LM',
    testCode: '3AF',
    testTitle: 'El bosque animado',
    testType: 'Texto Continuo',
    date: '24 Ene 2025',
    speed: 128,
    accuracy: 98.5,
    comprehension: '4/4',
    level: 'Avanzado'
  },
  {
    id: 2,
    studentName: 'Sofía Navarro Ortiz',
    initials: 'SN',
    testCode: '3AF',
    testTitle: 'El bosque animado',
    testType: 'Texto Continuo',
    date: '24 Ene 2025',
    speed: 118,
    accuracy: 96.0,
    comprehension: '4/4',
    level: 'En nivel'
  },
  {
    id: 3,
    studentName: 'Mateo Barrenechea',
    initials: 'MB',
    testCode: '3BL',
    testTitle: 'Aventuras en el mar',
    testType: 'Lectura de Palabras',
    date: '23 Ene 2025',
    speed: 82,
    accuracy: 88.0,
    comprehension: '2/4',
    level: 'Requiere apoyo'
  },
  {
    id: 4,
    studentName: 'Aitana Zubizarreta',
    initials: 'AZ',
    testCode: '3AF',
    testTitle: 'El bosque animado',
    testType: 'Texto Continuo',
    date: '23 Ene 2025',
    speed: 122,
    accuracy: 97.2,
    comprehension: '4/4',
    level: 'En nivel'
  },
  {
    id: 5,
    studentName: 'Iker Goikoetxea',
    initials: 'IG',
    testCode: '3CF',
    testTitle: 'Misterio en el museo',
    testType: 'Pseudopalabras',
    date: '22 Ene 2025',
    speed: 78,
    accuracy: 85.5,
    comprehension: '1/4',
    level: 'Requiere apoyo'
  },
  {
    id: 6,
    studentName: 'Emma Larrañaga',
    initials: 'EL',
    testCode: '3AF',
    testTitle: 'El bosque animado',
    testType: 'Texto Continuo',
    date: '21 Ene 2025',
    speed: 134,
    accuracy: 99.1,
    comprehension: '4/4',
    level: 'Avanzado'
  }
]);

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
  white-space: nowrap;
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
  white-space: nowrap;
}

.code-cell {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
}

.code-badge {
  background-color: var(--color-surface-container-high, #e2e9e2);
  color: var(--color-on-surface-variant, #3f4943);
  font-size: 0.75rem;
  padding: 0.15rem 0.45rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-weight: 700;
  white-space: nowrap;
}

.test-title {
  color: var(--color-on-surface-variant, #3f4943);
  font-size: 0.8125rem;
  white-space: nowrap;
}

.td-date {
  color: var(--color-on-surface-variant, #3f4943);
  font-size: 0.8125rem;
  white-space: nowrap;
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
  padding: 0.9rem 1.25rem;
  border-top: 1px solid rgba(189, 201, 192, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-surface-container-lowest, #ffffff);
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant, #3f4943);
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-page-nav {
  padding: 0.35rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(189, 201, 192, 0.5);
  background: none;
  color: var(--color-on-surface-variant, #3f4943);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-page-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-page-num {
  padding: 0.25rem 0.65rem;
  border-radius: 0.25rem;
  border: none;
  background: none;
  font-size: 0.8125rem;
  color: var(--color-on-surface, #191c1b);
  cursor: pointer;
}

.btn-page-num.active {
  background-color: var(--color-primary-container, #0f3e2e);
  color: var(--color-secondary-fixed, #6ffbbe);
  font-weight: 700;
}

.btn-page-num:not(.active):hover {
  background-color: var(--color-surface-container-low, #f2f5f2);
}

.btn-audio-text {
  display: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-on-surface-variant, #3f4943);
}

/* =========================================================================
   DISEÑO RESPONSIVO DEL RECUADRO DE EVALUACIONES
   ========================================================================= */

/* --- TABLETA & ESCRITORIO MEDIO (768px - 1100px) --- */
@media (min-width: 768px) and (max-width: 1100px) {
  .toolbar-container {
    padding: 1rem 1.25rem;
  }

  .assessments-table th,
  .assessments-table td {
    padding: 0.65rem 0.5rem;
    font-size: 0.8125rem;
  }

  .student-cell {
    gap: 0.5rem;
  }

  .student-avatar {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.7rem;
  }

  .code-badge {
    font-size: 0.7rem;
    padding: 0.1rem 0.35rem;
  }

  .test-title {
    font-size: 0.75rem;
  }

  .status-badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
  }
}

/* --- MÓVIL Y TABLETAS PEQUEÑAS (< 768px): TRANSFORMACIÓN A FICHAS / TARJETAS --- */
@media (max-width: 767px) {
  .toolbar-container {
    padding: 1rem;
    gap: 0.85rem;
  }

  .toolbar-title {
    font-size: 1.15rem;
  }

  .toolbar-subtitle {
    font-size: 0.8rem;
  }

  .filters-cluster {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .search-box {
    width: 100%;
  }

  .search-input {
    width: 100% !important;
  }

  .filter-select {
    width: 100%;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
  }

  /* Desactivar scroll horizontal forzado y pasar a vista de tarjetas */
  .table-responsive {
    overflow-x: visible !important;
    padding: 0;
  }

  .assessments-table {
    display: block !important;
    width: 100% !important;
    border: none !important;
  }

  .assessments-table thead {
    display: none !important;
  }

  .assessments-table tbody {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.85rem !important;
    padding: 0.85rem !important;
    background-color: var(--color-surface-container-low, #f4f6f4) !important;
  }

  .assessments-table .table-row {
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas:
      "student student status"
      "test test date"
      "speed accuracy comp"
      "actions actions actions";
    gap: 0.65rem;
    padding: 1rem;
    background-color: var(--color-surface-container-lowest, #ffffff) !important;
    border: 1px solid rgba(189, 201, 192, 0.45) !important;
    border-radius: var(--radius-lg, 12px) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
  }

  .assessments-table .table-row:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 108, 73, 0.35) !important;
  }

  .assessments-table .table-row.row-alert {
    background-color: rgba(254, 242, 242, 0.7) !important;
    border-color: rgba(239, 68, 68, 0.35) !important;
  }

  .td-student {
    grid-area: student;
    padding: 0 !important;
    border: none !important;
  }

  .student-cell {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .student-name {
    font-size: 0.95rem;
    font-weight: 700;
  }

  .td-status {
    grid-area: status;
    padding: 0 !important;
    border: none !important;
    justify-self: end;
    align-self: center;
  }

  .td-test-code {
    grid-area: test;
    padding: 0 !important;
    border: none !important;
  }

  .td-date {
    grid-area: date;
    padding: 0 !important;
    border: none !important;
    justify-self: end;
    align-self: center;
    font-size: 0.75rem;
    color: var(--color-on-surface-variant, #64748b);
  }

  .td-speed {
    grid-area: speed;
    padding: 0.5rem 0.35rem !important;
    border: 1px solid rgba(189, 201, 192, 0.35) !important;
    border-radius: 8px;
    background-color: var(--color-surface-container-low, #f2f5f2) !important;
    text-align: center !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .td-speed::before {
    content: "Velocidad";
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-on-surface-variant, #64748b);
    margin-bottom: 0.2rem;
    letter-spacing: 0.03em;
  }

  .td-accuracy {
    grid-area: accuracy;
    padding: 0.5rem 0.35rem !important;
    border: 1px solid rgba(189, 201, 192, 0.35) !important;
    border-radius: 8px;
    background-color: var(--color-surface-container-low, #f2f5f2) !important;
    text-align: center !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .td-accuracy::before {
    content: "Exactitud";
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-on-surface-variant, #64748b);
    margin-bottom: 0.2rem;
    letter-spacing: 0.03em;
  }

  .td-comprension {
    grid-area: comp;
    padding: 0.5rem 0.35rem !important;
    border: 1px solid rgba(189, 201, 192, 0.35) !important;
    border-radius: 8px;
    background-color: var(--color-surface-container-low, #f2f5f2) !important;
    text-align: center !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .td-comprension::before {
    content: "Comprensión";
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-on-surface-variant, #64748b);
    margin-bottom: 0.2rem;
    letter-spacing: 0.03em;
  }

  .td-actions {
    grid-area: actions;
    padding: 0.65rem 0 0 0 !important;
    border: none !important;
    border-top: 1px solid rgba(189, 201, 192, 0.25) !important;
  }

  .td-actions .actions-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .btn-audio {
    padding: 0.4rem 0.75rem;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 6px;
    gap: 0.4rem;
  }

  .btn-audio-text {
    display: inline-block;
  }

  .btn-detail {
    font-size: 0.85rem;
    font-weight: 700;
    padding: 0.45rem 0.85rem;
    background-color: rgba(0, 108, 73, 0.08);
    border-radius: 6px;
  }

  .empty-row {
    display: block !important;
    width: 100%;
    text-align: center;
    padding: 2rem 1rem;
  }

  .pagination-footer {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    text-align: center;
  }
}
</style>
