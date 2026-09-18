<script setup>
import { ref, computed, watch } from 'vue';
import { X, AlertTriangle, Trash2, Check, Clock, Award, BookOpen, AlertCircle } from 'lucide-vue-next';
import {
  calculatePPM,
  calculateVef,
  getReadingBand,
  formatPPM,
  formatVef
} from '../../utils/format';
import { updateResult, deleteResult } from '../../services/resultsService';

const props = defineProps({
  isOpen: Boolean,
  result: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'updated', 'deleted']);

const time = ref('');
const successes = ref('');
const mistakes = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const showDeleteConfirm = ref(false);

watch(
  () => props.result,
  (newVal) => {
    if (newVal) {
      time.value = newVal.time !== undefined ? String(newVal.time) : '60';
      successes.value = newVal.successes !== undefined ? String(newVal.successes) : '20';
      mistakes.value = newVal.mistakes !== undefined ? String(newVal.mistakes) : '0';
      errorMessage.value = '';
      showDeleteConfirm.value = false;
    }
  },
  { immediate: true }
);

const testWords = computed(() => props.result?.testWords || 108);

// Cálculo en vivo de métricas
const previewPPM = computed(() => {
  const t = Number(time.value);
  if (!t || t <= 0) return 0;
  return calculatePPM(testWords.value, t);
});

const previewVef = computed(() => {
  const s = Number(successes.value);
  return calculateVef(previewPPM.value, s, 20);
});

const previewBand = computed(() => getReadingBand(previewVef.value));

const bandClass = computed(() => {
  switch (previewBand.value) {
    case 'Avanzado':
      return 'band-advanced';
    case 'En nivel':
      return 'band-normal';
    case 'Requiere apoyo':
      return 'band-support';
    default:
      return 'band-nodata';
  }
});

async function handleSave() {
  errorMessage.value = '';
  const numTime = Number(time.value);
  const numSuccesses = Number(successes.value);
  const numMistakes = Number(mistakes.value);

  if (!numTime || numTime <= 0) {
    errorMessage.value = 'El tiempo debe ser un valor mayor a 0 segundos.';
    return;
  }
  if (numSuccesses < 0 || numSuccesses > 20) {
    errorMessage.value = 'Los aciertos deben estar entre 0 y 20.';
    return;
  }
  if (numMistakes < 0) {
    errorMessage.value = 'Los errores no pueden ser negativos.';
    return;
  }

  isSubmitting.value = true;
  try {
    const updated = await updateResult(props.result.id, {
      time: numTime,
      successes: numSuccesses,
      mistakes: numMistakes,
      testWords: testWords.value
    });
    emit('updated', updated);
    emit('close');
  } catch (err) {
    errorMessage.value = err.message || 'Error al actualizar el resultado';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  isSubmitting.value = true;
  try {
    await deleteResult(props.result.id);
    emit('deleted', props.result.id);
    emit('close');
  } catch (err) {
    errorMessage.value = err.message || 'Error al anular el resultado';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div v-if="isOpen && result" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <!-- Cabecera -->
      <div class="modal-header">
        <div class="header-title-area">
          <div class="header-icon">
            <BookOpen :size="20" />
          </div>
          <div>
            <h3>Rectificar Resultado de Lectura</h3>
            <p class="subtitle">{{ result.studentName || 'Alumno' }} · {{ result.testName || 'Prueba' }}</p>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <X :size="20" />
        </button>
      </div>

      <!-- Diálogo de confirmación de anulación definitiva -->
      <div v-if="showDeleteConfirm" class="confirm-box">
        <div class="confirm-icon">
          <AlertTriangle :size="24" />
        </div>
        <div class="confirm-content">
          <h4>¿Anular definitivamente este resultado?</h4>
          <p>
            Esta acción eliminará el registro de evaluación por completo de los cálculos pedagógicos y del histórico.
            <strong>Esta operación no se puede deshacer.</strong>
          </p>
          <div class="confirm-actions">
            <button class="btn btn--secondary" :disabled="isSubmitting" @click="showDeleteConfirm = false">
              Cancelar
            </button>
            <button class="btn btn--danger" :disabled="isSubmitting" @click="handleDelete">
              <Trash2 :size="16" />
              <span>Sí, anular resultado</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Formulario de edición -->
      <form v-else @submit.prevent="handleSave" class="modal-body">
        <div v-if="errorMessage" class="error-banner">
          <AlertCircle :size="18" />
          <span>{{ errorMessage }}</span>
        </div>

        <div class="metrics-preview">
          <div class="preview-item">
            <span class="preview-label">PPM Recalculadas</span>
            <span class="preview-value">{{ formatPPM(previewPPM) }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Velocidad Eficaz</span>
            <span class="preview-value">{{ formatVef(previewVef) }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Banda Pedagógica</span>
            <span class="badge" :class="bandClass">{{ previewBand }}</span>
          </div>
        </div>

        <div class="form-grid">
          <!-- Tiempo en segundos -->
          <div class="form-group">
            <label for="edit-time">
              <span>Tiempo de lectura (segundos)</span>
            </label>
            <div class="input-with-icon">
              <Clock :size="16" class="input-icon" />
              <input
                id="edit-time"
                v-model="time"
                type="number"
                min="1"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
                required
                class="form-control"
              />
            </div>
            <span class="helper-text">Mínimo 1 segundo</span>
          </div>

          <!-- Aciertos -->
          <div class="form-group">
            <label for="edit-successes">
              <span>Aciertos de comprensión</span>
            </label>
            <div class="input-with-icon">
              <Check :size="16" class="input-icon" />
              <input
                id="edit-successes"
                v-model="successes"
                type="number"
                min="0"
                max="20"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
                required
                class="form-control"
              />
            </div>
            <span class="helper-text">Sobre 20 preguntas</span>
          </div>

          <!-- Errores -->
          <div class="form-group">
            <label for="edit-mistakes">
              <span>Errores de lectura</span>
            </label>
            <div class="input-with-icon">
              <AlertTriangle :size="16" class="input-icon" />
              <input
                id="edit-mistakes"
                v-model="mistakes"
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
                required
                class="form-control"
              />
            </div>
            <span class="helper-text">Palabras erróneas u omitidas</span>
          </div>
        </div>

        <!-- Acciones del pie -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn--outline-danger"
            :disabled="isSubmitting"
            @click="showDeleteConfirm = true"
          >
            <Trash2 :size="16" />
            <span>Anular</span>
          </button>

          <div class="right-actions">
            <button
              type="button"
              class="btn btn--secondary"
              :disabled="isSubmitting"
              @click="$emit('close')"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn--primary"
              :disabled="isSubmitting"
            >
              <Check :size="16" />
              <span>{{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  background: var(--surface-card, #ffffff);
  border-radius: 12px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color, #e2e8f0);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  background-color: var(--surface-hover, #f8fafc);
}

.header-title-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: rgba(30, 94, 76, 0.1);
  color: var(--primary, #1e5e4c);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title-area h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
}

.subtitle {
  margin: 0.15rem 0 0 0;
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary, #0f172a);
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.metrics-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  background-color: var(--surface-hover, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-secondary, #64748b);
  font-weight: 600;
}

.preview-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary, #0f172a);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-secondary, #64748b);
  pointer-events: none;
}

.form-control {
  width: 100%;
  height: 44px; /* Touch target >= 44px (FE-13) */
  padding: 0 0.75rem 0 2.25rem;
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 8px;
  font-size: 0.95rem;
  background: #ffffff;
  color: var(--text-primary, #0f172a);
  transition: border-color 0.15s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary, #1e5e4c);
  box-shadow: 0 0 0 3px rgba(30, 94, 76, 0.15);
}

.helper-text {
  font-size: 0.75rem;
  color: var(--text-secondary, #64748b);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.band-advanced {
  background-color: #dcfce7;
  color: #15803d;
}

.band-normal {
  background-color: #e0f2fe;
  color: #0369a1;
}

.band-support {
  background-color: #fee2e2;
  color: #b91c1c;
}

.band-nodata {
  background-color: #f1f5f9;
  color: #64748b;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e2e8f0);
}

.right-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  height: 44px; /* Touch target >= 44px */
  padding: 0 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
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
  background-color: #f1f5f9;
  color: #334155;
}

.btn--secondary:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.btn--outline-danger {
  background: transparent;
  border: 1px solid #fca5a5;
  color: #dc2626;
}

.btn--outline-danger:hover:not(:disabled) {
  background-color: #fef2f2;
}

.btn--danger {
  background-color: #dc2626;
  color: #ffffff;
}

.btn--danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

/* Confirm box */
.confirm-box {
  padding: 1.5rem;
  display: flex;
  gap: 1.25rem;
  background-color: #fff1f2;
  border-top: 1px solid #ffe4e6;
  border-bottom: 1px solid #ffe4e6;
}

.confirm-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #fecdd3;
  color: #e11d48;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirm-content h4 {
  margin: 0 0 0.5rem 0;
  color: #9f1239;
  font-size: 1.05rem;
}

.confirm-content p {
  margin: 0 0 1.25rem 0;
  font-size: 0.875rem;
  color: #881337;
  line-height: 1.4;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
