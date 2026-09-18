<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import {
  Users,
  Calendar,
  Layers,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Award,
  ArrowUpDown,
  BookOpen
} from 'lucide-vue-next';
import { getSectionResults, deleteResult } from '../../services/resultsService';
import { formatDate, formatPPM, formatVef } from '../../utils/format';
import EditResultModal from '../../components/results/EditResultModal.vue';

const props = defineProps({
  sectionId: {
    type: String,
    default: 'sec-1'
  },
  userRole: {
    type: String,
    default: 'tutor'
  }
});

const currentSectionId = ref(props.sectionId || 'sec-1');
const availableSections = ref([
  { id: 'sec-1', name: '1º Primaria - Aula A (Tutoría)', grade: '1º Primaria' },
  { id: 'sec-2', name: '1º Primaria - Aula B', grade: '1º Primaria' },
  { id: 'sec-3', name: '2º Primaria - Aula A', grade: '2º Primaria' }
]);

const resultsList = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const groupBy = ref('chronological'); // 'chronological' | 'test'
const filterStartDate = ref('');
const filterEndDate = ref('');

// Modal de edición de resultado (FE-19)
const showEditModal = ref(false);
const selectedResultToEdit = ref(null);
const feedbackToast = ref(null);

watch(() => props.sectionId, (newId) => {
  if (newId) {
    currentSectionId.value = newId;
    loadResults();
  }
});

watch(currentSectionId, () => {
  loadResults();
});

async function loadResults() {
  isLoading.value = true;
  try {
    const list = await getSectionResults(currentSectionId.value, {
      startDate: filterStartDate.value || undefined,
      endDate: filterEndDate.value || undefined
    });
    resultsList.value = Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn('Error al cargar resultados de sección:', err);
    resultsList.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadResults();
});

// Filtrado de resultados
const filteredResults = computed(() => {
  let list = [...resultsList.value];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(r =>
      (r.studentName && r.studentName.toLowerCase().includes(q)) ||
      (r.testName && r.testName.toLowerCase().includes(q)) ||
      (r.testId && r.testId.toLowerCase().includes(q))
    );
  }

  if (filterStartDate.value) {
    list = list.filter(r => r.testDate >= filterStartDate.value);
  }
  if (filterEndDate.value) {
    list = list.filter(r => r.testDate <= filterEndDate.value);
  }

  // Orden cronológico descendente por defecto
  list.sort((a, b) => new Date(b.testDate || 0) - new Date(a.testDate || 0));

  return list;
});

// Agrupación por prueba (Escenario 2 de FE-29)
const resultsByTest = computed(() => {
  const groups = {};
  for (const r of filteredResults.value) {
    const key = r.testName || r.testId || 'Prueba sin título';
    if (!groups[key]) {
      groups[key] = {
        testTitle: key,
        testId: r.testId,
        items: []
      };
    }
    groups[key].items.push(r);
  }
  return Object.values(groups);
});

// Acciones de FE-19
function handleOpenEdit(result) {
  selectedResultToEdit.value = result;
  showEditModal.value = true;
}

function handleResultUpdated(updatedResult) {
  const idx = resultsList.value.findIndex(r => r.id === updatedResult.id);
  if (idx !== -1) {
    resultsList.value[idx] = updatedResult;
  }
  showFeedback('Resultado actualizado y métricas recalculadas correctamente.');
}

function handleResultDeleted(deletedId) {
  resultsList.value = resultsList.value.filter(r => r.id !== deletedId);
  showFeedback('Resultado anulado definitivamente del registro.');
}

function showFeedback(msg) {
  feedbackToast.value = msg;
  setTimeout(() => {
    feedbackToast.value = null;
  }, 4000);
}
</script>

<template>
  <div class="view-section-detail">
    <!-- Feedback flotante -->
    <div v-if="feedbackToast" class="toast-feedback">
      <CheckCircle2 :size="18" />
      <span>{{ feedbackToast }}</span>
    </div>

    <!-- Cabecera -->
    <header class="section-header">
      <div>
        <div class="title-with-badge">
          <h1>Historial de Pruebas de Sección</h1>
          <span class="badge-role">Supervisión</span>
        </div>
        <p class="description">
          Supervisa y verifica todas las evaluaciones realizadas en el aula (FE-29).
          Corrige o anula resultados erróneos con recálculo en vivo de métricas (FE-19).
        </p>
      </div>

      <!-- Selector de sección -->
      <div class="section-selector-card">
        <label for="detail-section-select">
          <Users :size="16" />
          <span>Aula:</span>
        </label>
        <select id="detail-section-select" v-model="currentSectionId" class="section-select">
          <option v-for="sec in availableSections" :key="sec.id" :value="sec.id">
            {{ sec.name }}
          </option>
        </select>
      </div>
    </header>

    <!-- Barra de filtros y alternador de agrupación -->
    <div class="filters-card">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar alumno o prueba..."
          class="search-input"
        />
      </div>

      <div class="date-filters">
        <div class="date-group">
          <span class="filter-label">Desde:</span>
          <input v-model="filterStartDate" type="date" class="date-mini" />
        </div>
        <div class="date-group">
          <span class="filter-label">Hasta:</span>
          <input v-model="filterEndDate" type="date" class="date-mini" />
        </div>
      </div>

      <!-- Alternador de agrupación (FE-29 Escenario 2) -->
      <div class="group-switcher">
        <button
          type="button"
          class="switch-btn"
          :class="{ active: groupBy === 'chronological' }"
          @click="groupBy = 'chronological'"
        >
          <Clock :size="14" />
          <span>Cronológico</span>
        </button>
        <button
          type="button"
          class="switch-btn"
          :class="{ active: groupBy === 'test' }"
          @click="groupBy = 'test'"
        >
          <Layers :size="14" />
          <span>Por Prueba</span>
        </button>
      </div>
    </div>

    <!-- Vista de Resultados: Lista Cronológica -->
    <div v-if="groupBy === 'chronological'" class="results-table-card">
      <div class="table-responsive">
        <table class="history-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Alumno</th>
              <th>Prueba</th>
              <th style="text-align: right;">Tiempo</th>
              <th style="text-align: right;">PPM</th>
              <th style="text-align: right;">Aciertos</th>
              <th style="text-align: right;">Vef</th>
              <th>Banda</th>
              <th style="text-align: center; width: 110px;">Acciones</th>
            </tr>
          </thead>
          <tbody v-if="filteredResults.length > 0">
            <tr v-for="item in filteredResults" :key="item.id">
              <td class="col-date">{{ formatDate(item.testDate) }}</td>
              <td class="col-student">
                <strong>{{ item.studentName || 'Alumno #' + item.studentId }}</strong>
              </td>
              <td class="col-test">{{ item.testName || item.testId }}</td>
              <td class="col-num">{{ item.time }}s</td>
              <td class="col-num font-semibold">{{ formatPPM(item.ppm) }}</td>
              <td class="col-num">{{ item.successes !== undefined ? item.successes + '/20' : '-' }}</td>
              <td class="col-num font-bold text-primary">{{ formatVef(item.vef) }}</td>
              <td>
                <span
                  class="badge-band"
                  :class="'band-' + (item.band || 'Sin datos').toLowerCase().replace(/\s+/g, '-')"
                >
                  {{ item.band || 'Sin datos' }}
                </span>
              </td>
              <td class="col-actions">
                <button
                  type="button"
                  class="action-btn action-btn--edit"
                  title="Corregir tiempo o aciertos (FE-19)"
                  @click="handleOpenEdit(item)"
                >
                  <Edit2 :size="15" />
                </button>
                <button
                  type="button"
                  class="action-btn action-btn--delete"
                  title="Anular resultado (FE-19)"
                  @click="handleOpenEdit(item)"
                >
                  <Trash2 :size="15" />
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="9" class="empty-cell">
                <div class="empty-state-box">
                  <FileText :size="32" class="empty-icon" />
                  <p>No se encontraron resultados para los filtros seleccionados.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Vista de Resultados: Agrupada por Prueba (Escenario 2 de FE-29) -->
    <div v-else class="test-groups-container">
      <div v-if="resultsByTest.length === 0" class="empty-card">
        <p>No hay evaluaciones registradas en este período.</p>
      </div>

      <div
        v-for="group in resultsByTest"
        :key="group.testTitle"
        class="test-group-block"
      >
        <div class="test-group-header">
          <div class="group-title-box">
            <BookOpen :size="18" class="text-primary" />
            <h3>{{ group.testTitle }}</h3>
            <span class="badge-count">{{ group.items.length }} evaluaciones</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="history-table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Fecha</th>
                <th style="text-align: right;">Tiempo</th>
                <th style="text-align: right;">PPM</th>
                <th style="text-align: right;">Aciertos</th>
                <th style="text-align: right;">Vef</th>
                <th>Banda</th>
                <th style="text-align: center; width: 100px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in group.items" :key="item.id">
                <td class="col-student">
                  <strong>{{ item.studentName || 'Alumno #' + item.studentId }}</strong>
                </td>
                <td class="col-date">{{ formatDate(item.testDate) }}</td>
                <td class="col-num">{{ item.time }}s</td>
                <td class="col-num font-semibold">{{ formatPPM(item.ppm) }}</td>
                <td class="col-num">{{ item.successes !== undefined ? item.successes + '/20' : '-' }}</td>
                <td class="col-num font-bold text-primary">{{ formatVef(item.vef) }}</td>
                <td>
                  <span
                    class="badge-band"
                    :class="'band-' + (item.band || 'Sin datos').toLowerCase().replace(/\s+/g, '-')"
                  >
                    {{ item.band || 'Sin datos' }}
                  </span>
                </td>
                <td class="col-actions">
                  <button
                    type="button"
                    class="action-btn action-btn--edit"
                    title="Corregir resultado"
                    @click="handleOpenEdit(item)"
                  >
                    <Edit2 :size="15" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de edición y rectificación (FE-19) -->
    <EditResultModal
      :is-open="showEditModal"
      :result="selectedResultToEdit"
      @close="showEditModal = false"
      @updated="handleResultUpdated"
      @deleted="handleResultDeleted"
    />
  </div>
</template>

<style scoped>
.view-section-detail {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Toast */
.toast-feedback {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  background-color: #166534;
  color: #ffffff;
  padding: 0.85rem 1.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 10000;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Cabecera */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-with-badge h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}

.badge-role {
  font-size: 0.75rem;
  background-color: rgba(30, 94, 76, 0.12);
  color: var(--primary, #1e5e4c);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
}

.description {
  margin: 0.35rem 0 0 0;
  color: var(--text-secondary, #64748b);
  font-size: 0.95rem;
  max-width: 750px;
}

.section-selector-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
}

.section-selector-card label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.section-select {
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  cursor: pointer;
  outline: none;
}

/* Barra de filtros */
.filters-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 260px;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 8px;
  padding: 0 0.75rem 0 2.25rem;
  font-size: 0.9rem;
  outline: none;
  background: #ffffff;
}

.search-input:focus {
  border-color: var(--primary, #1e5e4c);
}

.date-filters {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.date-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.filter-label {
  font-size: 0.8rem;
  color: var(--text-secondary, #64748b);
}

.date-mini {
  height: 38px;
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 6px;
  padding: 0 0.5rem;
  font-size: 0.85rem;
  background: #ffffff;
}

.group-switcher {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 0.25rem;
  gap: 0.25rem;
}

.switch-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.switch-btn.active {
  background: #ffffff;
  color: var(--primary, #1e5e4c);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

/* Tabla de resultados */
.results-table-card {
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-responsive {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.history-table th {
  padding: 0.85rem 1rem;
  background-color: var(--surface-hover, #f8fafc);
  border-bottom: 2px solid var(--border-color, #e2e8f0);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  text-transform: uppercase;
}

.history-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  vertical-align: middle;
  font-size: 0.9rem;
}

.history-table tbody tr:hover {
  background-color: #f8fafc;
}

.col-date {
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
}

.col-num {
  text-align: right;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.text-primary {
  color: var(--primary, #1e5e4c);
}

.badge-band {
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.band-avanzado {
  background-color: #dcfce7;
  color: #15803d;
}

.band-en-nivel {
  background-color: #e0f2fe;
  color: #0369a1;
}

.band-requiere-apoyo {
  background-color: #fee2e2;
  color: #b91c1c;
}

.col-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.35rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  color: #64748b;
}

.action-btn--edit:hover {
  border-color: var(--primary, #1e5e4c);
  color: var(--primary, #1e5e4c);
  background: rgba(30, 94, 76, 0.06);
}

.action-btn--delete:hover {
  border-color: #ef4444;
  color: #dc2626;
  background: #fef2f2;
}

.empty-cell {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
}

/* Bloques agrupados por prueba */
.test-groups-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.test-group-block {
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.test-group-header {
  padding: 1rem 1.25rem;
  background-color: var(--surface-hover, #f8fafc);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.group-title-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.group-title-box h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary, #0f172a);
}

.badge-count {
  font-size: 0.75rem;
  background-color: #e2e8f0;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}
</style>
