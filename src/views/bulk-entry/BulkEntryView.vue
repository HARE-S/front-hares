<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import {
  Users,
  Layers,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  AlertTriangle,
  RotateCcw,
  Eye,
  UserX,
  Sparkles
} from 'lucide-vue-next';
import { getTests } from '../../services/testsService';
import { registerBatchResults } from '../../services/resultsService';
import { getCenters, getCenterSections, getSectionStudents } from '../../services/directoryService';
import {
  calculatePPM,
  calculateVef,
  getReadingBand,
  formatPPM,
  formatVef
} from '../../utils/format';

const props = defineProps({
  userRole: {
    type: String,
    default: 'tutor'
  }
});

const emit = defineEmits(['view-history']);

// Fallback para pruebas unitarias / entorno offline
const fallbackSections = [
  { id: 'sec-1', name: '1º Primaria - Aula A (Tutoría)', grade: '1º Primaria' },
  { id: 'sec-2', name: '1º Primaria - Aula B', grade: '1º Primaria' },
  { id: 'sec-3', name: '2º Primaria - Aula A', grade: '2º Primaria' }
];

const fallbackStudentsBySection = {
  'sec-1': [
    { id: '1', name: 'Lucas Méndez Ruiz', initialBand: 'Avanzado' },
    { id: '2', name: 'Sofía Navarro Ortiz', initialBand: 'Requiere apoyo' },
    { id: '3', name: 'Mateo Barrenechea', initialBand: 'En nivel' },
    { id: '4', name: 'Aitana Zubizarreta', initialBand: 'Avanzado' },
    { id: '7', name: 'Alejandro López', initialBand: 'Requiere apoyo' },
    { id: '8', name: 'Marina González', initialBand: 'En nivel' },
    { id: '9', name: 'Diego Martínez', initialBand: 'En nivel' },
    { id: '10', name: 'Elena Ruiz', initialBand: 'Requiere apoyo' }
  ],
  'sec-2': [
    { id: '11', name: 'Iker García Sanz', initialBand: 'En nivel' },
    { id: '12', name: 'Nora Etxebarria', initialBand: 'Avanzado' },
    { id: '13', name: 'Hugo Martín', initialBand: 'En nivel' },
    { id: '14', name: 'Lucía Bilbao', initialBand: 'Requiere apoyo' }
  ],
  'sec-3': [
    { id: '15', name: 'Pablo Domínguez', initialBand: 'En nivel' },
    { id: '16', name: 'Carla Vega', initialBand: 'Avanzado' },
    { id: '17', name: 'Marcos Alonso', initialBand: 'Requiere apoyo' }
  ]
};

// Lista de secciones disponibles
const availableSections = ref([...fallbackSections]);

// Estado del formulario de sesión
const selectedSectionId = ref('sec-1');
const selectedTestId = ref('');
const testDate = ref(new Date().toISOString().split('T')[0]);

// Catálogo de pruebas
const testsList = ref([]);
const isLoadingTests = ref(false);
const isLoadingStudents = ref(false);

// Alumnos activos según la sección elegida
const currentStudents = ref([...fallbackStudentsBySection['sec-1']]);

function createInitialGridData(students) {
  const initial = {};
  for (const s of (students || [])) {
    initial[s.id] = {
      time: '',
      successes: '',
      mistakes: '',
      absent: false,
      error: ''
    };
  }
  return initial;
}

// Rejilla de alumnos: Map de datos por id de alumno
// { [studentId]: { time: '', successes: '', mistakes: '', absent: false, error: '' } }
const gridData = ref(createInitialGridData(currentStudents.value));

// Feedback y estados
const feedbackSummary = ref(null);
const generalError = ref('');
const isSaving = ref(false);

// Cargar catálogo de pruebas
async function loadTestsCatalog() {
  isLoadingTests.value = true;
  try {
    const res = await getTests({ limit: 100 });
    const list = res?.items || (Array.isArray(res) ? res : []);
    if (list.length > 0) {
      testsList.value = list.map(t => ({
        ...t,
        title: t.name || t.title,
        totalWords: t.words || t.totalWords || 108
      }));
    } else {
      testsList.value = [
        { id: '1IF', code: '1IF', title: 'La Vaca', totalWords: 108, course: 1, type: 'Informativo' },
        { id: '1LF', code: '1LF', title: 'El Perro Cantor', totalWords: 115, course: 1, type: 'Literario' },
        { id: '2IF', code: '2IF', title: 'Las Abejas y la Miel', totalWords: 140, course: 2, type: 'Informativo' },
        { id: '2LF', code: '2LF', title: 'El Viaje de Tom', totalWords: 152, course: 2, type: 'Literario' }
      ];
    }
    // Seleccionar por defecto la primera prueba disponible
    if (testsList.value.length > 0 && !selectedTestId.value) {
      selectedTestId.value = testsList.value[0].id;
    }
  } catch (err) {
    console.warn('Error al cargar catálogo de pruebas, usando predeterminadas:', err);
    testsList.value = [
      { id: '1IF', code: '1IF', title: 'La Vaca', totalWords: 108, course: 1, type: 'Informativo' }
    ];
    selectedTestId.value = '1IF';
  } finally {
    isLoadingTests.value = false;
  }
}

// Cargar secciones desde backend
async function loadSections() {
  try {
    const centers = await getCenters();
    if (Array.isArray(centers) && centers.length > 0) {
      const allSections = [];
      for (const center of centers) {
        try {
          const sections = await getCenterSections(center.id);
          if (Array.isArray(sections)) {
            for (const sec of sections) {
              allSections.push({
                ...sec,
                centerName: center.name,
                displayName: centers.length > 1 ? `${center.name} - ${sec.name}` : sec.name
              });
            }
          }
        } catch (e) {
          console.warn(`Error al cargar secciones del centro ${center.id}:`, e);
        }
      }
      if (allSections.length > 0) {
        availableSections.value = allSections;
        selectedSectionId.value = allSections[0].id;
        await loadStudentsForSection(allSections[0].id);
      }
    }
  } catch (err) {
    console.warn('Usando secciones por defecto debido a error al conectar con backend:', err);
  }
}

// Cargar alumnos de una sección
async function loadStudentsForSection(sectionId) {
  if (!sectionId) return;
  isLoadingStudents.value = true;
  try {
    if (String(sectionId).startsWith('sec-') && fallbackStudentsBySection[sectionId]) {
      currentStudents.value = fallbackStudentsBySection[sectionId];
      initGrid();
      return;
    }
    const students = await getSectionStudents(sectionId);
    if (Array.isArray(students) && students.length > 0) {
      currentStudents.value = students;
    } else if (fallbackStudentsBySection[sectionId]) {
      currentStudents.value = fallbackStudentsBySection[sectionId];
    } else {
      currentStudents.value = [];
    }
    initGrid();
  } catch (err) {
    console.warn(`Error al cargar alumnos para sección ${sectionId}:`, err);
    if (fallbackStudentsBySection[sectionId]) {
      currentStudents.value = fallbackStudentsBySection[sectionId];
    } else {
      currentStudents.value = [];
    }
    initGrid();
  } finally {
    isLoadingStudents.value = false;
  }
}

// Prueba seleccionada actualmente
const currentTest = computed(() => {
  return testsList.value.find(t => String(t.id) === String(selectedTestId.value)) || null;
});

const testWords = computed(() => currentTest.value?.totalWords || currentTest.value?.words || 108);

// Inicializar la rejilla cuando cambia de sección
function initGrid() {
  const initial = {};
  for (const student of currentStudents.value) {
    initial[student.id] = {
      time: '',
      successes: '',
      mistakes: '',
      absent: false,
      error: ''
    };
  }
  gridData.value = initial;
  feedbackSummary.value = null;
  generalError.value = '';

  // Situar foco en el primer input de la rejilla (Escenario 1)
  nextTick(() => {
    focusFirstInput();
  });
}

function focusFirstInput() {
  const first = document.querySelector('.grid-input--time');
  if (first) {
    first.focus();
  }
}

watch(selectedSectionId, (newSecId) => {
  loadStudentsForSection(newSecId);
});

onMounted(async () => {
  await Promise.all([
    loadTestsCatalog(),
    loadSections()
  ]);
  initGrid();
});

// Métricas calculadas en vivo por alumno
function getStudentMetrics(studentId) {
  const row = gridData.value[studentId];
  if (!row || row.absent) return { ppm: null, vef: null, band: 'Sin datos' };

  const t = Number(row.time);
  if (!t || t <= 0) return { ppm: null, vef: null, band: 'Sin datos' };

  const ppm = calculatePPM(testWords.value, t);
  const s = row.successes !== '' ? Number(row.successes) : 20;
  const vef = calculateVef(ppm, s, 20);
  const band = getReadingBand(vef);

  return { ppm, vef, band };
}

// Alternar estado ausente
function toggleAbsent(studentId) {
  const row = gridData.value[studentId];
  if (!row) return;

  row.absent = !row.absent;
  if (row.absent) {
    row.time = '';
    row.successes = '';
    row.mistakes = '';
    row.error = '';
  }
}

// Resumen del estado actual del lote
const batchStats = computed(() => {
  let filled = 0;
  let absent = 0;
  let empty = 0;

  for (const s of currentStudents.value) {
    const row = gridData.value[s.id];
    if (!row) continue;
    if (row.absent) {
      absent++;
    } else if (row.time && Number(row.time) > 0) {
      filled++;
    } else {
      empty++;
    }
  }

  return { filled, absent, empty, total: currentStudents.value.length };
});

// Navegación con teclado por teclado (Escenario 5)
// Salta al siguiente input en orden: tiempo -> aciertos -> errores -> siguiente fila
function handleInputKeyDown(e, studentIndex, fieldName) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const fields = ['time', 'successes', 'mistakes'];
    const fieldIdx = fields.indexOf(fieldName);

    if (fieldIdx < 2) {
      // Siguiente campo en la misma fila
      const nextField = fields[fieldIdx + 1];
      const el = document.getElementById(`input-${currentStudents.value[studentIndex].id}-${nextField}`);
      if (el) el.focus();
    } else {
      // Siguiente fila, primer campo
      const nextStudentIdx = studentIndex + 1;
      if (nextStudentIdx < currentStudents.value.length) {
        const nextId = currentStudents.value[nextStudentIdx].id;
        const el = document.getElementById(`input-${nextId}-time`);
        if (el) el.focus();
      }
    }
  }
}

// Guardado en lote
async function handleSaveBatch() {
  generalError.value = '';
  feedbackSummary.value = null;

  if (!selectedTestId.value) {
    generalError.value = 'Debes seleccionar una prueba del catálogo.';
    return;
  }
  if (!testDate.value) {
    generalError.value = 'Debes especificar la fecha de aplicación.';
    return;
  }

  // Validar errores por fila sin perder datos (Escenario 4)
  let hasRowErrors = false;
  const rowsToSave = [];

  for (const student of currentStudents.value) {
    const row = gridData.value[student.id];
    row.error = '';

    // Si está marcado como ausente o completamente vacío: no genera resultado (Escenario 2)
    const isEmpty = (!row.time || String(row.time).trim() === '') &&
                    (!row.successes || String(row.successes).trim() === '') &&
                    (!row.mistakes || String(row.mistakes).trim() === '');

    if (row.absent || isEmpty) {
      continue;
    }

    const t = Number(row.time);
    const s = row.successes !== '' ? Number(row.successes) : 0;
    const m = row.mistakes !== '' ? Number(row.mistakes) : 0;

    if (isNaN(t) || t <= 0) {
      row.error = 'El tiempo debe ser mayor a 0 segundos.';
      hasRowErrors = true;
      continue;
    }
    if (isNaN(s) || s < 0 || s > 20) {
      row.error = 'Los aciertos deben estar entre 0 y 20.';
      hasRowErrors = true;
      continue;
    }
    if (isNaN(m) || m < 0) {
      row.error = 'Los errores no pueden ser negativos.';
      hasRowErrors = true;
      continue;
    }

    rowsToSave.push({
      studentId: student.id,
      studentName: student.name,
      time: t,
      successes: s,
      mistakes: m,
      absent: false
    });
  }

  if (hasRowErrors) {
    generalError.value = 'Se han encontrado errores en algunas filas. Por favor corrígelas antes de guardar.';
    return;
  }

  if (rowsToSave.length === 0) {
    generalError.value = 'No hay resultados que registrar. Rellena al menos una fila o marca los ausentes.';
    return;
  }

  isSaving.value = true;
  try {
    const result = await registerBatchResults({
      sectionId: selectedSectionId.value,
      testId: selectedTestId.value,
      testName: currentTest.value?.title || 'Prueba',
      testWords: testWords.value,
      testDate: testDate.value,
      results: rowsToSave
    });

    feedbackSummary.value = {
      registered: result.registered || rowsToSave.length,
      absent: batchStats.value.absent + batchStats.value.empty,
      sectionName: availableSections.value.find(s => s.id === selectedSectionId.value)?.name,
      testTitle: currentTest.value?.title
    };

    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // En jsdom scrollTo puede no estar implementado
      }
    }
  } catch (err) {
    generalError.value = err.message || 'Error al guardar el lote de resultados.';
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="view-bulk-entry">
    <!-- Cabecera de la vista -->
    <header class="bulk-header">
      <div>
        <div class="title-with-badge">
          <h1>Registro de Evaluaciones en Aula</h1>
          <span class="badge-role">Tutoría</span>
        </div>
        <p class="description">
          Introduce de una sola vez las notas de lectura de todo el grupo tras la sesión (FE-20).
          Las filas que dejes en blanco se contabilizan como alumnos ausentes.
        </p>
      </div>

      <div class="quick-stats">
        <div class="stat-pill stat-pill--filled">
          <span class="stat-count">{{ batchStats.filled }}</span>
          <span class="stat-label">Completados</span>
        </div>
        <div class="stat-pill stat-pill--absent">
          <span class="stat-count">{{ batchStats.absent + batchStats.empty }}</span>
          <span class="stat-label">Ausentes</span>
        </div>
        <div class="stat-pill stat-pill--total">
          <span class="stat-count">{{ batchStats.total }}</span>
          <span class="stat-label">Total Aula</span>
        </div>
      </div>
    </header>

    <!-- Banner de resumen tras guardado exitoso -->
    <div v-if="feedbackSummary" class="success-banner">
      <div class="banner-icon">
        <CheckCircle2 :size="24" />
      </div>
      <div class="banner-content">
        <h4>¡Lote de resultados registrado con éxito!</h4>
        <p>
          Se han guardado correctamente <strong>{{ feedbackSummary.registered }} evaluaciones</strong> para
          <em>{{ feedbackSummary.testTitle }}</em>. Se contabilizaron
          <strong>{{ feedbackSummary.absent }} alumnos ausentes</strong> sin registrar valores a cero.
        </p>
        <div class="banner-actions">
          <button class="btn btn--secondary" @click="initGrid">
            <RotateCcw :size="16" />
            <span>Registrar otra sesión</span>
          </button>
          <button class="btn btn--primary" @click="$emit('view-history', selectedSectionId)">
            <Eye :size="16" />
            <span>Ver Historial de la Sección</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Banner de error general -->
    <div v-if="generalError" class="error-banner">
      <AlertCircle :size="20" />
      <span>{{ generalError }}</span>
    </div>

    <!-- Panel de configuración de la sesión -->
    <div class="session-card">
      <div class="session-form-grid">
        <!-- Selector de sección/aula -->
        <div class="control-group">
          <label for="section-select">
            <Users :size="16" />
            <span>Sección / Aula</span>
          </label>
          <select id="section-select" v-model="selectedSectionId" class="select-input">
            <option v-for="sec in availableSections" :key="sec.id" :value="sec.id">
              {{ sec.displayName || sec.name }}
            </option>
          </select>
        </div>

        <!-- Selector de prueba -->
        <div class="control-group">
          <label for="test-select">
            <Layers :size="16" />
            <span>Prueba de Lectura</span>
          </label>
          <select id="test-select" v-model="selectedTestId" class="select-input">
            <option v-for="t in testsList" :key="t.id" :value="t.id">
              [{{ t.code || t.id }}] {{ t.title }} ({{ t.totalWords || 108 }} palabras · {{ t.course }}º Primaria)
            </option>
          </select>
        </div>

        <!-- Selector de fecha -->
        <div class="control-group">
          <label for="date-select">
            <Calendar :size="16" />
            <span>Fecha de Aplicación</span>
          </label>
          <input
            id="date-select"
            v-model="testDate"
            type="date"
            class="date-input"
          />
        </div>
      </div>
    </div>

    <!-- Rejilla de notas de alumnos (FE-20) -->
    <div class="grid-card">
      <div class="grid-header-tools">
        <div class="info-help">
          <Sparkles :size="16" class="sparkle-icon" />
          <span>Usa el <strong>Tabulador</strong> o <strong>Enter</strong> para saltar rápidamente entre campos sin tocar el ratón.</span>
        </div>
        <button type="button" class="btn-clear" @click="initGrid">
          <RotateCcw :size="14" />
          <span>Limpiar rejilla</span>
        </button>
      </div>

      <div class="table-responsive">
        <table class="batch-table">
          <thead>
            <tr>
              <th class="th-index">#</th>
              <th class="th-student">Alumno</th>
              <th class="th-status">Estado</th>
              <th class="th-time">Tiempo (s)</th>
              <th class="th-successes">Aciertos (/20)</th>
              <th class="th-mistakes">Errores</th>
              <th class="th-metrics">Métricas en Vivo</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(student, idx) in currentStudents"
              :key="student.id"
              :class="{
                'row--absent': gridData[student.id]?.absent,
                'row--error': !!gridData[student.id]?.error,
                'row--filled': gridData[student.id]?.time && !gridData[student.id]?.absent
              }"
            >
              <!-- Índice -->
              <td class="col-index">{{ idx + 1 }}</td>

              <!-- Nombre del alumno -->
              <td class="col-name">
                <div class="student-name-box">
                  <span class="student-name">{{ student.name }}</span>
                  <span v-if="student.initialBand" class="badge-mini" :class="'band-' + student.initialBand.toLowerCase().replace(/\s+/g, '-')">
                    {{ student.initialBand }}
                  </span>
                </div>
                <!-- Mensaje de error por fila (Escenario 4) -->
                <span v-if="gridData[student.id]?.error" class="row-error-text">
                  {{ gridData[student.id].error }}
                </span>
              </td>

              <!-- Estado Presente / Ausente -->
              <td class="col-status">
                <button
                  type="button"
                  class="btn-toggle-absent"
                  :class="{ 'is-absent': gridData[student.id]?.absent }"
                  @click="toggleAbsent(student.id)"
                  :title="gridData[student.id]?.absent ? 'Marcar como presente' : 'Marcar como ausente'"
                >
                  <UserX v-if="gridData[student.id]?.absent" :size="14" />
                  <Check v-else :size="14" />
                  <span>{{ gridData[student.id]?.absent ? 'Ausente' : 'Presente' }}</span>
                </button>
              </td>

              <!-- Tiempo en segundos -->
              <td class="col-input col-time">
                <div class="input-cell-wrapper">
                  <input
                    :id="'input-' + student.id + '-time'"
                    v-model="gridData[student.id].time"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="ej. 55"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    :disabled="gridData[student.id]?.absent"
                    class="grid-input grid-input--time"
                    :class="{ 'has-error': !!gridData[student.id]?.error }"
                    @keydown="handleInputKeyDown($event, idx, 'time')"
                  />
                  <span class="unit-tag">s</span>
                </div>
              </td>

              <!-- Aciertos -->
              <td class="col-input col-successes">
                <div class="input-cell-wrapper">
                  <input
                    :id="'input-' + student.id + '-successes'"
                    v-model="gridData[student.id].successes"
                    type="number"
                    min="0"
                    max="20"
                    step="1"
                    placeholder="0-20"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    :disabled="gridData[student.id]?.absent"
                    class="grid-input"
                    @keydown="handleInputKeyDown($event, idx, 'successes')"
                  />
                  <span class="unit-tag">/20</span>
                </div>
              </td>

              <!-- Errores -->
              <td class="col-input col-mistakes">
                <div class="input-cell-wrapper">
                  <input
                    :id="'input-' + student.id + '-mistakes'"
                    v-model="gridData[student.id].mistakes"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    :disabled="gridData[student.id]?.absent"
                    class="grid-input"
                    @keydown="handleInputKeyDown($event, idx, 'mistakes')"
                  />
                  <span class="unit-tag">err</span>
                </div>
              </td>

              <!-- Métricas en vivo (PPM, Vef, Banda) -->
              <td class="col-metrics">
                <div v-if="!gridData[student.id]?.absent && gridData[student.id]?.time" class="live-metrics">
                  <div class="metric-item">
                    <span class="metric-val">{{ formatPPM(getStudentMetrics(student.id).ppm) }}</span>
                    <span class="metric-sub">PPM</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-val highlight">{{ formatVef(getStudentMetrics(student.id).vef) }}</span>
                    <span class="metric-sub">Vef</span>
                  </div>
                  <span
                    class="badge-band"
                    :class="'band-' + getStudentMetrics(student.id).band.toLowerCase().replace(/\s+/g, '-')"
                  >
                    {{ getStudentMetrics(student.id).band }}
                  </span>
                </div>
                <div v-else-if="gridData[student.id]?.absent" class="absent-note">
                  No evaluado (ausente)
                </div>
                <div v-else class="pending-note">
                  Sin datos
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pie de acciones de la rejilla -->
      <div class="grid-actions-footer">
        <div class="footer-help">
          <p>
            Al pulsar <strong>Guardar Lote de Resultados</strong> se enviarán los
            <strong>{{ batchStats.filled }} registros completos</strong>. Los alumnos en blanco quedarán como ausentes sin generar registros.
          </p>
        </div>

        <div class="footer-buttons">
          <button
            type="button"
            class="btn btn--secondary"
            :disabled="isSaving"
            @click="initGrid"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="btn btn--primary btn--save-batch"
            :disabled="isSaving || batchStats.filled === 0"
            @click="handleSaveBatch"
          >
            <Save :size="18" />
            <span>{{ isSaving ? 'Guardando evaluación...' : `Guardar Lote (${batchStats.filled} alumnos)` }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-bulk-entry {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Cabecera */
.bulk-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
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

/* Pastillas de estadísticas de la sesión */
.quick-stats {
  display: flex;
  gap: 0.75rem;
}

.stat-pill {
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 10px;
  padding: 0.6rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 85px;
}

.stat-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #64748b);
}

.stat-pill--filled .stat-count {
  color: #15803d;
}

.stat-pill--absent .stat-count {
  color: #b45309;
}

/* Banners */
.success-banner {
  display: flex;
  gap: 1.25rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  color: #166534;
}

.banner-icon {
  color: #16a34a;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.banner-content h4 {
  margin: 0 0 0.35rem 0;
  font-size: 1.05rem;
}

.banner-content p {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.banner-actions {
  display: flex;
  gap: 0.75rem;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
}

/* Panel de configuración de sesión */
.session-card {
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.session-form-grid {
  display: grid;
  grid-template-columns: 1.2fr 1.8fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 840px) {
  .session-form-grid {
    grid-template-columns: 1fr;
  }
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.control-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.select-input,
.date-input {
  height: 44px; /* Touch target >= 44px */
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 8px;
  padding: 0 0.75rem;
  font-size: 0.95rem;
  background-color: #ffffff;
  color: var(--text-primary, #0f172a);
  outline: none;
  transition: border-color 0.15s ease;
}

.select-input:focus,
.date-input:focus {
  border-color: var(--primary, #1e5e4c);
  box-shadow: 0 0 0 3px rgba(30, 94, 76, 0.15);
}

/* Rejilla de notas */
.grid-card {
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.grid-header-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.5rem;
  background-color: var(--surface-hover, #f8fafc);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.info-help {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
}

.sparkle-icon {
  color: #eab308;
}

.btn-clear {
  background: transparent;
  border: none;
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  min-height: var(--touch-target-min, 44px);
  border-radius: 6px;
}

.btn-clear:hover {
  background-color: #e2e8f0;
  color: var(--text-primary, #0f172a);
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

.batch-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.batch-table th {
  padding: 0.85rem 1rem;
  background-color: var(--surface-hover, #f8fafc);
  border-bottom: 2px solid var(--border-color, #e2e8f0);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.th-index { width: 40px; }
.th-student { min-width: 180px; }
.th-status { width: 120px; text-align: center; }
.th-time { width: 140px; }
.th-successes { width: 130px; }
.th-mistakes { width: 130px; }
.th-metrics { min-width: 170px; }

.batch-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  vertical-align: middle;
}

.batch-table tbody tr:hover {
  background-color: #f8fafc;
}

.row--filled {
  background-color: rgba(240, 253, 244, 0.4);
}

.row--absent {
  background-color: rgba(241, 245, 249, 0.6);
  opacity: 0.65;
}

.row--error {
  background-color: #fef2f2 !important;
}

.col-index {
  font-size: 0.85rem;
  color: var(--text-secondary, #94a3b8);
  font-weight: 600;
}

.student-name-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.student-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary, #0f172a);
}

.row-error-text {
  display: block;
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
  margin-top: 0.2rem;
}

.btn-toggle-absent {
  min-height: var(--touch-target-min, 44px); /* Ergonomía táctil FE-13 */
  padding: 0 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  transition: all 0.15s ease;
}

.btn-toggle-absent.is-absent {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #64748b;
}

.btn-toggle-absent:hover {
  border-color: var(--primary, #1e5e4c);
}

.input-cell-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.grid-input {
  width: 100%;
  height: 44px; /* Touch target >= 44px (FE-13) */
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 8px;
  padding: 0 2rem 0 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary, #0f172a);
  background: #ffffff;
  transition: all 0.15s ease;
}

.grid-input:focus {
  outline: none;
  border-color: var(--primary, #1e5e4c);
  box-shadow: 0 0 0 3px rgba(30, 94, 76, 0.15);
}

.grid-input.has-error {
  border-color: #ef4444;
  background-color: #fff1f2;
}

.grid-input:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
  opacity: 0.7;
}

.unit-tag {
  position: absolute;
  right: 0.6rem;
  font-size: 0.75rem;
  color: #94a3b8;
  pointer-events: none;
}

/* Métricas en vivo */
.live-metrics {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
}

.metric-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}

.metric-val.highlight {
  color: var(--primary, #1e5e4c);
}

.metric-sub {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #94a3b8;
}

.badge-band {
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
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

.badge-mini {
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.absent-note,
.pending-note {
  font-size: 0.8rem;
  font-style: italic;
  color: #94a3b8;
}

/* Pie de acciones de la rejilla */
.grid-actions-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: var(--surface-hover, #f8fafc);
  border-top: 1px solid var(--border-color, #e2e8f0);
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-help p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
  max-width: 550px;
}

.footer-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  height: 44px;
  padding: 0 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primary {
  background-color: var(--primary, #1e5e4c);
  color: #ffffff;
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--primary-hover, #164638);
}

.btn--secondary {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.btn--secondary:hover:not(:disabled) {
  background-color: #f1f5f9;
}

/* --- ADAPTACIÓN TABLETA (< 1280px - FE-13 Escenario 3) --- */
@media (max-width: 1279px) {
  .bulk-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .quick-stats {
    width: 100%;
    justify-content: flex-start;
  }

  .batch-table th,
  .batch-table td {
    padding: 0.6rem 0.35rem;
  }

  .th-index,
  .col-index {
    width: 28px;
    padding: 0.5rem 0.2rem;
    text-align: center;
  }

  .th-student,
  .col-name {
    min-width: 120px;
    max-width: 160px;
  }

  .student-name {
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 120px;
  }

  .badge-mini {
    display: none;
  }

  .th-status,
  .col-status {
    width: 78px;
    text-align: center;
  }

  .btn-toggle-absent {
    min-height: 44px;
    padding: 0 0.4rem;
    font-size: 0.75rem;
    gap: 0.2rem;
  }

  /* Las 3 columnas de datos caben holgadamente sin desplazamiento lateral */
  .th-time,
  .col-time {
    width: 85px;
  }

  .th-successes,
  .col-successes {
    width: 85px;
  }

  .th-mistakes,
  .col-mistakes {
    width: 80px;
  }

  .grid-input {
    height: 44px;
    min-height: 44px;
    font-size: 0.95rem;
    padding: 0 1.5rem 0 0.5rem;
  }

  .unit-tag {
    right: 0.35rem;
    font-size: 0.6875rem;
  }

  .th-metrics,
  .col-metrics {
    min-width: 100px;
    width: 110px;
  }

  .live-metrics {
    gap: 0.35rem;
  }

  .metric-val {
    font-size: 0.825rem;
  }

  .badge-band {
    font-size: 0.6875rem;
    padding: 0.15rem 0.35rem;
  }
}

/* --- ADAPTACIÓN MÓVIL (< 768px - FE-13 Escenario 5) --- */
@media (max-width: 767px) {
  .view-bulk-entry {
    padding: 0;
  }

  .quick-stats {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .stat-pill {
    width: 100%;
    justify-content: space-between;
  }

  .session-card {
    padding: 1rem;
  }

  .grid-actions-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-buttons {
    flex-direction: column;
    width: 100%;
  }

  .footer-buttons .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
