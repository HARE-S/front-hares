<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  User,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-vue-next';
import {
  calculatePPM,
  calculateVef,
  getReadingBand,
  formatPPM,
  formatVef
} from '@/utils/format';
import { registerSingleResult, _getInMemoryResults } from '@/services/resultsService';
import { getTests } from '@/services/testsService';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  studentId: {
    type: [String, Number],
    default: null
  },
  studentName: {
    type: String,
    default: ''
  },
  sectionId: {
    type: String,
    default: 'sec-1'
  },
  availableStudents: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'saved']);

// Lista por defecto de alumnos si no se pasan por props
const defaultStudents = [
  { id: '1', name: 'Lucas Méndez Ruiz', section: '1A' },
  { id: '2', name: 'Sofía Navarro Ortiz', section: '1A' },
  { id: '3', name: 'Mateo Barrenechea', section: '1A' },
  { id: '4', name: 'Aitana Zubizarreta', section: '1A' },
  { id: '5', name: 'Diego Martínez', section: '2A' },
  { id: '99', name: 'Miren Arana', section: 'sec-1' }
];

// Lista de pruebas disponibles
const tests = ref([
  { id: '1IF', code: '1IF', name: 'La Vaca', words: 299, course: 1, test_letter: 'I', type: 'F' },
  { id: '1AF', code: '1AF', name: 'El Patito Feo', words: 350, course: 1, test_letter: 'A', type: 'F' },
  { id: '2BL', code: '2BL', name: 'El Príncipe Feliz', words: 450, course: 2, test_letter: 'B', type: 'L' },
  { id: '2BF', code: '2BF', name: 'La Selva Negra', words: 380, course: 2, test_letter: 'B', type: 'F' }
]);

const selectedStudentId = ref('');
const selectedTestId = ref('');
const testDate = ref(new Date().toISOString().split('T')[0]);
const time = ref('');
const successes = ref('20');
const mistakes = ref('0');
const notes = ref('');

const isSubmitting = ref(false);
const errorMessage = ref('');
const forbiddenError = ref(false);
const confirmedSuspiciousTime = ref(false);
const resultSaved = ref(null);

const studentsList = computed(() => {
  if (props.availableStudents && props.availableStudents.length > 0) {
    return props.availableStudents;
  }
  return defaultStudents;
});

const currentStudentName = computed(() => {
  if (props.studentName) return props.studentName;
  const s = studentsList.value.find(st => String(st.id) === String(selectedStudentId.value));
  return s ? s.name : 'Alumno no seleccionado';
});

const completedTestIds = computed(() => {
  const existingResults = _getInMemoryResults();
  const studentIdToCheck = selectedStudentId.value || props.studentId;
  const completed = new Set();

  existingResults
    .filter(r => String(r.studentId) === String(studentIdToCheck))
    .forEach(r => {
      // Agregar tanto testId como code para mayor cobertura
      if (r.testId) completed.add(String(r.testId).trim());
      if (r.testCode) completed.add(String(r.testCode).trim());
      if (r.code) completed.add(String(r.code).trim());
    });

  const completedArray = Array.from(completed);
  console.log('[completedTestIds] Student:', studentIdToCheck, 'Completed:', completedArray, 'Total results:', existingResults.length);
  return completedArray;
});

const currentTest = computed(() => {
  return tests.value.find(t => t.id === selectedTestId.value || t.code === selectedTestId.value) || tests.value[0];
});

const testWords = computed(() => currentTest.value?.words || 108);

// Métricas en tiempo real
const previewPPM = computed(() => {
  const t = Number(time.value);
  if (!t || t <= 0) return 0;
  return calculatePPM(testWords.value, t);
});

const previewComprehension = computed(() => {
  const s = Number(successes.value);
  if (isNaN(s) || s < 0) return 0;
  return Math.round((Math.min(s, 20) / 20) * 100);
});

const previewVef = computed(() => {
  const s = Number(successes.value);
  if (isNaN(s) || s < 0) return 0;
  return calculateVef(previewPPM.value, s, 20);
});

const previewBand = computed(() => {
  if (!previewVef.value) return 'Sin evaluar';
  return getReadingBand(previewVef.value);
});

const isFormValid = computed(() => {
  return selectedStudentId.value &&
         selectedTestId.value &&
         testDate.value &&
         testDate.value.trim() !== '' &&
         time.value &&
         Number(time.value) > 0 &&
         currentTest.value &&
         currentTest.value.name;
});

// Detección de tiempo sospechoso (FE-18 Escenario 6)
// Por ejemplo: ritmo > 350 PPM, o texto > 150 palabras con tiempo < 20s, o tiempo < 10s
const isSuspiciousTime = computed(() => {
  const t = Number(time.value);
  if (!t || t <= 0) return false;
  if (t < 10) return true;
  if (testWords.value >= 150 && t < 20) return true;
  if (previewPPM.value > 350) return true;
  return false;
});

// Reset del formulario al abrir
watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      selectedStudentId.value = props.studentId ? String(props.studentId) : (studentsList.value[0]?.id || '');
      console.log('[Modal Abierto] studentId:', selectedStudentId.value, 'props.studentId:', props.studentId);
      testDate.value = new Date().toISOString().split('T')[0];
      time.value = '';
      successes.value = '20';
      mistakes.value = '0';
      notes.value = '';
      errorMessage.value = '';
      forbiddenError.value = false;
      confirmedSuspiciousTime.value = false;
      resultSaved.value = null;
      await loadCatalogTests();
      // Asignar después de cargar los tests
      selectedTestId.value = tests.value[0]?.id || '1IF';
      console.log('[Modal] Tests cargados:', tests.value.length, 'Primer test:', tests.value[0]);
    }
  },
  { immediate: true }
);

async function loadCatalogTests() {
  try {
    const res = await getTests({ limit: 50 });
    if (res?.items?.length > 0) {
      // Normalizar IDs: usar 'code' como ID principal para consistencia
      tests.value = res.items.map(t => ({
        ...t,
        id: t.code || t.id  // Usar code como id si existe
      }));
      if (!selectedTestId.value) {
        selectedTestId.value = tests.value[0].id || tests.value[0].code;
      }
    }
  } catch (e) {
    console.debug('Error loading tests from API, using local catalog:', e);
  }
}

async function handleSave() {
  console.log('[handleSave] INICIADO');
  errorMessage.value = '';
  forbiddenError.value = false;

  if (!selectedStudentId.value) {
    errorMessage.value = 'Selecciona un alumno.';
    return;
  }
  if (!selectedTestId.value) {
    errorMessage.value = 'Selecciona una prueba de lectura.';
    return;
  }

  // Validar que la prueba no ya fue realizada
  const testIdStr = String(currentTest.value?.code || currentTest.value?.id || '').trim();
  console.log('[handleSave] testIdStr:', testIdStr, 'completedTestIds.value:', completedTestIds.value, 'studentId:', selectedStudentId.value);
  if (testIdStr && completedTestIds.value && completedTestIds.value.includes(testIdStr)) {
    errorMessage.value = `La prueba "${currentTest.value?.name || 'desconocida'}" ya fue realizada por este alumno. No se puede repetir.`;
    console.log('[handleSave] Prueba bloqueada por duplicado');
    return;
  }

  if (!testDate.value || testDate.value.trim() === '') {
    errorMessage.value = 'Indica la fecha de la prueba.';
    return;
  }
  if (!currentTest.value || !currentTest.value.name) {
    errorMessage.value = 'La prueba seleccionada no es válida.';
    return;
  }

  const numTime = Number(time.value);
  const numSuccesses = Number(successes.value);
  const numMistakes = Number(mistakes.value);

  // Escenario 3: Validaciones
  if (!time.value || isNaN(numTime) || numTime <= 0) {
    errorMessage.value = 'El tiempo debe ser un número entero mayor a cero segundos.';
    return;
  }
  if (isNaN(numSuccesses) || numSuccesses < 0) {
    errorMessage.value = 'Los aciertos no pueden ser negativos.';
    return;
  }
  if (isNaN(numMistakes) || numMistakes < 0) {
    errorMessage.value = 'Los errores no pueden ser negativos.';
    return;
  }
  if (numSuccesses + numMistakes > 20) {
    errorMessage.value = 'La suma de aciertos y errores no puede superar 20.';
    return;
  }

  // Escenario 6: Tiempo sospechoso requiere confirmación explícita
  if (isSuspiciousTime.value && !confirmedSuspiciousTime.value) {
    errorMessage.value = 'Por favor, confirma que el tiempo sospechoso es correcto antes de guardar.';
    return;
  }

  isSubmitting.value = true;
  try {
    // Validar que currentTest sea válido
    if (!currentTest.value || !currentTest.value.name || !currentTest.value.code) {
      errorMessage.value = 'Error: la prueba no tiene datos válidos. Actualiza la página.';
      isSubmitting.value = false;
      return;
    }

    // Validar que testDate sea válido y no vacío
    const finalTestDate = String(testDate.value || '').trim();
    if (!finalTestDate) {
      errorMessage.value = 'Error: la fecha de la prueba no es válida';
      isSubmitting.value = false;
      return;
    }

    // Calcular comprehensionPercentage
    const comprehensionPercentage = Math.round((Math.min(numSuccesses, 20) / 20) * 100);

    // Construir testName correctamente
    const finalTestName = `${currentTest.value.name} (${currentTest.value.code})`;

    const payload = {
      studentId: selectedStudentId.value,
      studentName: currentStudentName.value,
      testId: currentTest.value.code,
      testCode: currentTest.value.code,
      testName: finalTestName,
      testWords: testWords.value,
      sectionId: props.sectionId,
      testDate: finalTestDate,
      time: numTime,
      successes: numSuccesses,
      mistakes: numMistakes,
      comprehensionPercentage: comprehensionPercentage,
      notes: notes.value
    };

    console.log('[RegisterResultModal] Guardando:', payload);
    const saved = await registerSingleResult(payload);
    console.log('[RegisterResultModal] ✓ Guardado exitosamente:', saved);

    resultSaved.value = saved;
    emit('saved', saved);
  } catch (err) {
    if (err.status === 403) {
      forbiddenError.value = true;
      errorMessage.value = 'No tienes permiso sobre la sección de este alumno para registrar resultados.';
    } else if (err.status === 409) {
      errorMessage.value = `⚠️ ${err.message} No se permite registrar la misma prueba dos veces.`;
    } else {
      errorMessage.value = err.message || 'Error al registrar el resultado.';
    }
  } finally {
    isSubmitting.value = false;
  }
}

function handleClose() {
  emit('close');
}

function handleResetAnother() {
  resultSaved.value = null;
  time.value = '';
  successes.value = '20';
  mistakes.value = '0';
  errorMessage.value = '';
  confirmedSuspiciousTime.value = false;
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop" role="dialog" aria-modal="true" data-testid="register-result-modal">
    <div class="modal-card">
      <!-- Cabecera -->
      <header class="modal-header">
        <div class="header-info">
          <h2 class="modal-title">Registrar Resultado de Prueba</h2>
          <p class="modal-subtitle">
            Consigna la lectura individual de un alumno y evalúa al momento sus métricas pedagógicas
          </p>
        </div>
        <button type="button" class="btn-close" aria-label="Cerrar modal" @click="handleClose">
          <X :size="20" />
        </button>
      </header>

      <!-- Mensaje de acceso denegado (Escenario 5) -->
      <div v-if="forbiddenError" class="alert alert-danger" data-testid="forbidden-alert">
        <AlertCircle :size="20" />
        <div>
          <strong>Acceso denegado</strong>
          <p>{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Pantalla de confirmación de resultado guardado (Escenario 1 y 2) -->
      <div v-else-if="resultSaved" class="success-summary-view" data-testid="result-saved-summary">
        <div class="success-header">
          <div class="success-icon-badge">
            <CheckCircle2 :size="32" class="text-green-600" />
          </div>
          <h3>¡Resultado registrado y guardado!</h3>
          <p class="success-meta">
            Alumno: <strong>{{ currentStudentName }}</strong><br>
            Prueba: <strong>{{ currentTest?.name }} ({{ currentTest?.code }})</strong><br>
            Fecha: <strong>{{ resultSaved.testDate }}</strong>
          </p>
          <p class="success-note">✓ Los datos se han guardado correctamente en tu historial de pruebas.</p>
        </div>

        <!-- Las tres métricas pedagógicas clave -->
        <div class="metrics-summary-grid">
          <div class="metric-card">
            <span class="metric-label">Velocidad Espontánea</span>
            <span class="metric-number" data-testid="saved-ppm">{{ formatPPM(resultSaved.ppm) }}</span>
            <span class="metric-unit">PPM</span>
          </div>

          <div class="metric-card">
            <span class="metric-label">Comprensión</span>
            <span class="metric-number" data-testid="saved-comp">{{ resultSaved.comprehensionPercentage }}%</span>
            <span class="metric-unit">{{ resultSaved.successes }}/20 aciertos</span>
          </div>

          <div class="metric-card highlight">
            <span class="metric-label">Velocidad Eficaz (Vef)</span>
            <span class="metric-number" data-testid="saved-vef">{{ formatVef(resultSaved.vef) }}</span>
            <span class="metric-badge" :class="`band-${resultSaved.band?.toLowerCase().replace(/\s+/g, '-')}`" data-testid="saved-band">
              {{ resultSaved.band }}
            </span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleResetAnother">
            Registrar Otra Prueba
          </button>
          <button type="button" class="btn btn-primary" @click="handleClose">
            Finalizar y Cerrar
          </button>
        </div>
      </div>

      <!-- Formulario de Registro -->
      <form v-else class="modal-form" @submit.prevent="handleSave">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="alert alert-danger" data-testid="error-alert">
          <AlertCircle :size="18" />
          <span>{{ errorMessage }}</span>
        </div>

        <div class="form-grid">
          <!-- Alumno -->
          <div class="form-group span-2">
            <label class="form-label" for="student-select">
              <User :size="16" />
              <span>Alumno</span>
            </label>
            <div v-if="studentId && studentName" class="fixed-student-badge">
              <strong>{{ studentName }}</strong>
            </div>
            <select
              v-else
              id="student-select"
              v-model="selectedStudentId"
              class="form-select"
              data-testid="student-select"
              required
            >
              <option value="" disabled>Selecciona un alumno...</option>
              <option v-for="stu in studentsList" :key="stu.id" :value="stu.id">
                {{ stu.name }} ({{ stu.section || 'Sección' }})
              </option>
            </select>
          </div>

          <!-- Prueba de Lectura -->
          <div class="form-group span-2">
            <label class="form-label" for="test-select">
              <BookOpen :size="16" />
              <span>Texto de Control / Prueba</span>
            </label>
            <select
              id="test-select"
              v-model="selectedTestId"
              class="form-select"
              data-testid="test-select"
              required
            >
              <option v-for="t in tests" :key="t.id" :value="t.id" :disabled="completedTestIds.includes(String(t.code)) || completedTestIds.includes(String(t.id))">
                {{ t.code }} — {{ t.name }} ({{ t.words }} palabras · Curso {{ t.course }})
                <span v-if="completedTestIds.includes(String(t.code)) || completedTestIds.includes(String(t.id))"> — Ya realizada</span>
              </option>
            </select>
          </div>

          <!-- Fecha -->
          <div class="form-group">
            <label class="form-label" for="test-date">
              <Calendar :size="16" />
              <span>Fecha de la prueba</span>
            </label>
            <input
              id="test-date"
              v-model="testDate"
              type="date"
              class="form-input"
              data-testid="test-date-input"
              required
            />
          </div>

          <!-- Tiempo (segundos) -->
          <div class="form-group">
            <label class="form-label" for="time-seconds">
              <Clock :size="16" />
              <span>Tiempo (en segundos)</span>
            </label>
            <input
              id="time-seconds"
              v-model="time"
              type="number"
              inputmode="numeric"
              min="1"
              placeholder="Ej. 65"
              class="form-input"
              data-testid="time-input"
              required
            />
            <span class="field-hint">Introduce el tiempo exacto en segundos (no minutos).</span>
          </div>

          <!-- Aciertos de Comprensión (0-20) -->
          <div class="form-group">
            <label class="form-label" for="successes-input">
              <span>Aciertos (0 a 20)</span>
            </label>
            <input
              id="successes-input"
              v-model="successes"
              type="number"
              inputmode="numeric"
              min="0"
              max="20"
              class="form-input"
              data-testid="successes-input"
              required
            />
          </div>

          <!-- Errores de Lectura -->
          <div class="form-group">
            <label class="form-label" for="mistakes-input">
              <span>Errores de lectura</span>
            </label>
            <input
              id="mistakes-input"
              v-model="mistakes"
              type="number"
              inputmode="numeric"
              min="0"
              class="form-input"
              data-testid="mistakes-input"
              required
            />
          </div>
        </div>

        <!-- Alerta de tiempo sospechoso (Escenario 6) -->
        <div v-if="isSuspiciousTime" class="alert alert-warning" data-testid="suspicious-time-alert">
          <AlertTriangle :size="20" class="alert-icon" />
          <div class="alert-body">
            <strong>⚠️ Tiempo potencialmente sospechoso ({{ previewPPM }} PPM)</strong>
            <p>
              El tiempo indicado ({{ time }} segundos) para un texto de {{ testWords }} palabras resulta en un ritmo inusualmente alto.
              Comprueba que no has introducido minutos en lugar de segundos.
            </p>
            <label class="confirm-checkbox-label">
              <input
                v-model="confirmedSuspiciousTime"
                type="checkbox"
                data-testid="confirm-suspicious-time"
              />
              <span>Confirmo que el valor medido es de {{ time }} segundos y es correcto.</span>
            </label>
          </div>
        </div>

        <!-- Previsualización en vivo de las 3 métricas (Escenario 2) -->
        <div class="live-preview-card" data-testid="live-preview-card">
          <div class="preview-header">
            <span class="preview-title">Cálculo instantáneo de métricas</span>
            <span class="preview-badge">{{ testWords }} palabras</span>
          </div>
          <div class="preview-metrics-row">
            <div class="p-metric">
              <span class="p-label">Velocidad</span>
              <span class="p-value" data-testid="preview-ppm">{{ previewPPM }} <small>PPM</small></span>
            </div>
            <div class="p-metric">
              <span class="p-label">Comprensión</span>
              <span class="p-value" data-testid="preview-comp">{{ previewComprehension }}%</span>
            </div>
            <div class="p-metric">
              <span class="p-label">Velocidad Eficaz</span>
              <span class="p-value" data-testid="preview-vef">{{ previewVef }} <small>Vef</small></span>
            </div>
            <div class="p-metric">
              <span class="p-label">Banda</span>
              <span class="band-chip" :class="`band-${previewBand.toLowerCase().replace(/\s+/g, '-')}`" data-testid="preview-band">
                {{ previewBand }}
              </span>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleClose">
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            data-testid="submit-result-btn"
          >
            <span v-if="isSubmitting">Guardando resultado...</span>
            <span v-else>Guardar Resultado</span>
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.modal-card {
  background-color: #ffffff;
  border-radius: var(--radius-lg, 0.5rem);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light, #e2e8f0);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--green-950, #062b1b);
}

.modal-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--gray-600, #4b5563);
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gray-400, #9ca3af);
  padding: 0.5rem;
  border-radius: var(--radius-md, 0.375rem);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: var(--gray-700, #374151);
  background-color: var(--gray-100, #f3f4f6);
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.span-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700, #374151);
}

.form-input,
.form-select {
  min-height: 44px;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-light, #cbd5e1);
  border-radius: var(--radius-md, 0.375rem);
  font-size: 0.9375rem;
  color: var(--gray-900, #111827);
  background-color: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--green-600, #16a34a);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
}

.fixed-student-badge {
  min-height: 44px;
  padding: 0.625rem 0.875rem;
  background-color: var(--green-50, #f0fdf4);
  border: 1px solid var(--green-200, #bbf7d0);
  border-radius: var(--radius-md, 0.375rem);
  color: var(--green-950, #062b1b);
  display: flex;
  align-items: center;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--gray-500, #6b7280);
}

/* Alertas */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-md, 0.375rem);
  font-size: 0.875rem;
}

.alert-danger {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alert-warning {
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.confirm-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

/* Previsualización de métricas en vivo */
.live-preview-card {
  background-color: var(--gray-50, #f8fafc);
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: var(--radius-md, 0.375rem);
  padding: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.preview-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-600, #4b5563);
}

.preview-badge {
  font-size: 0.75rem;
  background-color: #ffffff;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: 9999px;
  color: var(--gray-700, #374151);
}

.preview-metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.p-metric {
  background-color: #ffffff;
  padding: 0.625rem;
  border-radius: var(--radius-md, 0.375rem);
  border: 1px solid var(--border-light, #e2e8f0);
  display: flex;
  flex-direction: column;
}

.p-label {
  font-size: 0.7rem;
  color: var(--gray-500, #6b7280);
}

.p-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--green-950, #062b1b);
}

.p-value small {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-500, #6b7280);
}

.band-chip {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 9999px;
  text-align: center;
}

.band-avanzado {
  background-color: #ecfdf5;
  color: #065f46;
}

.band-en-nivel {
  background-color: #eff6ff;
  color: #1e40af;
}

.band-requiere-apoyo {
  background-color: #fef2f2;
  color: #991b1b;
}

/* Resumen tras guardar */
.success-summary-view {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.success-icon-badge {
  width: 56px;
  height: 56px;
  background-color: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem auto;
}

.success-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--green-950, #062b1b);
}

.success-meta {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: var(--gray-600, #4b5563);
  line-height: 1.5;
}

.success-note {
  margin: 1rem 0 0 0;
  padding: 0.75rem 1rem;
  background-color: #f0fdf4;
  border-left: 3px solid #22c55e;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #166534;
  font-weight: 500;
}

.metrics-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
}

.metric-card {
  background-color: var(--gray-50, #f8fafc);
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: var(--radius-md, 0.375rem);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-card.highlight {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--gray-600, #4b5563);
  margin-bottom: 0.25rem;
}

.metric-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--green-950, #062b1b);
}

.metric-unit {
  font-size: 0.75rem;
  color: var(--gray-500, #6b7280);
}

.metric-badge {
  margin-top: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light, #e2e8f0);
  width: 100%;
}

.btn {
  min-height: 44px;
  padding: 0 1.25rem;
  border-radius: var(--radius-md, 0.375rem);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  transition: background-color 0.15s ease;
}

.btn-primary {
  background-color: var(--green-700, #15803d);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--green-800, #166534);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #ffffff;
  color: var(--gray-700, #374151);
  border-color: var(--border-light, #cbd5e1);
}

.btn-secondary:hover {
  background-color: var(--gray-50, #f8fafc);
}
</style>
