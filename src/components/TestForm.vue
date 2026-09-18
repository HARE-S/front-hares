<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { createTest, updateTest, deduceLevelAndTypeFromCode } from '../services/testsService';
import { PlusCircle, CheckCircle2, AlertCircle, Sparkles, BookOpen, RotateCcw, Save, X } from 'lucide-vue-next';

const props = defineProps({
  testToEdit: {
    type: Object,
    default: null
  },
  userRole: {
    type: String,
    default: 'coordinator' // 'coordinator' | 'tutor' | 'admin'
  }
});

const emit = defineEmits(['test-created', 'test-updated', 'cancel-edit']);

const form = reactive({
  code: '',
  name: '',
  words: '',
  course: '',
  test_letter: '',
  type: ''
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const autoDeductionApplied = ref(false);

const isEditMode = computed(() => Boolean(props.testToEdit && props.testToEdit.id));
const isCodeLocked = computed(() => isEditMode.value && Boolean(props.testToEdit?.has_results));
const canManage = computed(() => props.userRole !== 'tutor');

// Deducción reactiva a medida que el usuario escribe el código (solo si no está bloqueado)
const deduced = computed(() => {
  return deduceLevelAndTypeFromCode(form.code);
});

// Precargar datos si se pasa testToEdit
watch(() => props.testToEdit, (newTest) => {
  if (newTest) {
    form.code = newTest.code || '';
    form.name = newTest.name || '';
    form.words = newTest.words !== undefined && newTest.words !== null ? newTest.words : '';
    form.course = newTest.course !== undefined && newTest.course !== null ? newTest.course : '';
    form.test_letter = newTest.test_letter || '';
    form.type = newTest.type || '';
    autoDeductionApplied.value = false;
    errorMessage.value = '';
    successMessage.value = '';
  } else {
    resetForm();
  }
}, { immediate: true });

// Autocompletar sugerencias del código si los campos están vacíos (en modo alta o código libre)
watch(() => form.code, (newCode) => {
  if (!newCode || isEditMode.value) {
    autoDeductionApplied.value = false;
    return;
  }
  const result = deduceLevelAndTypeFromCode(newCode);
  if (result.course !== null || result.testLetter !== null || result.testType !== null) {
    if (form.course === '' && result.course !== null) {
      form.course = result.course;
      autoDeductionApplied.value = true;
    }
    if (form.test_letter === '' && result.testLetter !== null) {
      form.test_letter = result.testLetter;
      autoDeductionApplied.value = true;
    }
    if (form.type === '' && result.testType !== null) {
      form.type = result.testType;
      autoDeductionApplied.value = true;
    }
  }
});

function applyDeductionManually() {
  const result = deduced.value;
  if (result.course !== null) form.course = String(result.course);
  if (result.testLetter !== null) form.test_letter = result.testLetter;
  if (result.testType !== null) form.type = result.testType;
  autoDeductionApplied.value = true;
}

function resetForm() {
  form.code = '';
  form.name = '';
  form.words = '';
  form.course = '';
  form.test_letter = '';
  form.type = '';
  autoDeductionApplied.value = false;
  errorMessage.value = '';
}

function handleCancel() {
  resetForm();
  emit('cancel-edit');
}

async function handleSubmit() {
  errorMessage.value = '';
  successMessage.value = '';

  if (!canManage.value) {
    errorMessage.value = 'Los tutores no tienen permiso para modificar o crear pruebas en el catálogo.';
    return;
  }

  // Validaciones del frontend coherentes con FE-14 y BE-11
  if (!form.code.trim()) {
    errorMessage.value = "El campo 'code' (código) es obligatorio.";
    return;
  }
  if (!form.name.trim()) {
    errorMessage.value = "El campo 'name' (nombre de la lectura) es obligatorio.";
    return;
  }
  const wordsNum = parseInt(form.words, 10);
  if (isNaN(wordsNum) || wordsNum <= 0) {
    errorMessage.value = "El campo 'words' (número de palabras) debe ser un entero estrictamente positivo (> 0).";
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      const updated = await updateTest(props.testToEdit.id, form);
      const resultObj = updated || { ...form, id: props.testToEdit.id, words: wordsNum };
      successMessage.value = `¡Prueba "${resultObj.name}" (${resultObj.code}) actualizada con éxito!`;
      emit('test-updated', resultObj);
    } else {
      const created = await createTest(form);
      successMessage.value = `¡Prueba "${created.name}" (${created.code}) dada de alta con éxito!`;
      emit('test-created', created);
      resetForm();
    }
  } catch (err) {
    if (err.status === 409) {
      errorMessage.value = 'Ese código ya existe en el catálogo.';
    } else {
      errorMessage.value = err.message || 'Error al guardar la prueba en el servidor.';
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="test-form-card flat-card">
    <div class="flat-card-header">
      <div class="header-title-group">
        <div class="icon-box">
          <BookOpen :size="24" class="text-green-700" />
        </div>
        <div>
          <h2>{{ isEditMode ? 'Edición de Prueba de Lectura' : 'Alta de Prueba en el Catálogo' }}</h2>
          <p class="subtitle">
            {{ isEditMode
              ? 'Modifica los parámetros de la prueba seleccionada'
              : 'Registra un nuevo texto de lectura para las evaluaciones de fluidez'
            }}
          </p>
        </div>
      </div>
      <span class="badge badge-green">{{ isEditMode ? 'FE-15 · Edición' : 'FE-14 · Alta' }}</span>
    </div>

    <!-- Contenedor del formulario con padding generoso -->
    <div class="card-body">
      <!-- Aviso de rol tutor si aplica -->
      <div v-if="!canManage" class="alert alert-warning" role="alert">
        <AlertCircle :size="18" />
        <span>Acceso de solo lectura: el rol tutor no puede añadir ni modificar pruebas.</span>
      </div>

    <!-- Alertas de estado -->
    <div v-if="successMessage" class="alert alert-success" role="alert">
      <CheckCircle2 :size="18" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      <AlertCircle :size="18" />
      <span>{{ errorMessage }}</span>
    </div>

    <form @submit.prevent="handleSubmit" novalidate>
      <div class="form-grid">
        <!-- Código de la prueba -->
        <div class="form-group col-span-1">
          <label for="test-code">
            Código de la prueba <span class="required">*</span>
          </label>
          <input
            id="test-code"
            v-model="form.code"
            type="text"
            class="form-input"
            :disabled="isCodeLocked || !canManage"
            :class="{ 'input-locked': isCodeLocked }"
            placeholder="Ej: 0IF, 1AF, 2BL..."
            required
            maxlength="50"
          />
          <span v-if="isCodeLocked" class="form-hint text-amber-700 font-medium">
            El código no puede modificarse porque hay resultados asociados.
          </span>
          <span v-else class="form-hint">
            Debe ser único. Determina automáticamente curso, letra y tipo.
          </span>
        </div>

        <!-- Nombre de la prueba -->
        <div class="form-group col-span-2">
          <label for="test-name">
            Nombre / Título de la lectura <span class="required">*</span>
          </label>
          <input
            id="test-name"
            v-model="form.name"
            type="text"
            class="form-input"
            :disabled="!canManage"
            placeholder="Ej: La vaca, Normativa piscinas..."
            required
            maxlength="255"
          />
          <span class="form-hint">Título visible para docentes y alumnado.</span>
        </div>

        <!-- Número de palabras -->
        <div class="form-group col-span-1">
          <label for="test-words">
            Número de palabras <span class="required">*</span>
          </label>
          <input
            id="test-words"
            v-model="form.words"
            type="number"
            class="form-input"
            :disabled="!canManage"
            placeholder="Ej: 269"
            min="1"
            required
          />
          <span class="form-hint">Total de palabras (> 0). Usado para calcular PPM.</span>
        </div>

        <!-- Curso -->
        <div class="form-group col-span-1">
          <label for="test-course">Curso escolar</label>
          <select
            id="test-course"
            v-model="form.course"
            class="form-select"
            :disabled="!canManage"
          >
            <option value="">(Sin asignar)</option>
            <option :value="0">0 (Diagnóstica / Inicial)</option>
            <option :value="1">1º Primaria</option>
            <option :value="2">2º Primaria</option>
            <option :value="3">3º Primaria</option>
            <option :value="4">4º Primaria</option>
            <option :value="5">5º Primaria</option>
            <option :value="6">6º Primaria</option>
          </select>
          <span class="form-hint">Primer dígito del código.</span>
        </div>

        <!-- Letra pedagógica (Vocabulario cerrado: I, A, B, C, D, E) -->
        <div class="form-group col-span-1">
          <label for="test-letter">Letra pedagógica</label>
          <select
            id="test-letter"
            v-model="form.test_letter"
            class="form-select"
            :disabled="!canManage"
          >
            <option value="">(Ninguna)</option>
            <option value="I">I — Inicial (Diagnóstica)</option>
            <option value="A">A — Primer corte</option>
            <option value="B">B — Segundo corte</option>
            <option value="C">C — Tercer corte</option>
            <option value="D">D — Cuarto corte</option>
            <option value="E">E — Quinto corte</option>
          </select>
          <span class="form-hint">Carácter central del código.</span>
        </div>

        <!-- Tipo de texto (Vocabulario cerrado: F, L) -->
        <div class="form-group col-span-1">
          <label for="test-type">Tipo de texto</label>
          <select
            id="test-type"
            v-model="form.type"
            class="form-select"
            :disabled="!canManage"
          >
            <option value="">(Sin tipo)</option>
            <option value="F">F — Funcional</option>
            <option value="L">L — Literario</option>
          </select>
          <span class="form-hint">Último carácter del código.</span>
        </div>
      </div>

      <!-- Sugerencia de autocompletado pedagógico (en modo alta) -->
      <div
        v-if="!isEditMode && (deduced.course !== null || deduced.testLetter !== null || deduced.testType !== null)"
        class="deduction-box"
      >
        <div class="deduction-content">
          <Sparkles :size="16" class="text-green-600" />
          <span>
            <strong>Deducción sugerida del código:</strong>
            Curso: <strong>{{ deduced.course ?? '—' }}</strong> ·
            Letra: <strong>{{ deduced.testLetter ?? '—' }}</strong> ·
            Tipo: <strong>{{ deduced.testType === 'F' ? 'Funcional (F)' : (deduced.testType === 'L' ? 'Literario (L)' : '—') }}</strong>
          </span>
        </div>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="applyDeductionManually"
        >
          Aplicar a los campos
        </button>
      </div>

      <!-- Barra de acciones -->
      <div class="form-actions">
        <button
          v-if="isEditMode"
          type="button"
          class="btn btn-secondary"
          :disabled="isSubmitting"
          @click="handleCancel"
        >
          <X :size="16" />
          <span>Cancelar edición</span>
        </button>

        <button
          v-else
          type="button"
          class="btn btn-secondary"
          :disabled="isSubmitting"
          @click="resetForm"
        >
          <RotateCcw :size="16" />
          <span>Limpiar</span>
        </button>

        <button
          v-if="canManage"
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting"
        >
          <component :is="isEditMode ? Save : PlusCircle" :size="16" />
          <span>
            {{ isSubmitting ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Dar de Alta Prueba') }}
          </span>
        </button>
      </div>
    </form>
  </div>
  </div>
</template>

<style scoped>
.test-form-card {
  max-width: 880px;
  margin: 0 auto;
  border-top: 4px solid var(--primary-container);
}

.flat-card-header {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid var(--outline-variant);
  background-color: var(--surface-container-lowest);
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 1.35rem;
}

.icon-box {
  background-color: var(--green-100);
  border: 1px solid var(--green-300);
  width: 54px;
  height: 54px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-container);
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-title-group h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--primary-container);
  letter-spacing: -0.015em;
  margin-bottom: 0.3rem;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--on-surface-variant);
  line-height: 1.4;
}

.card-body {
  padding: 1.75rem 2rem;
}

.required {
  color: var(--danger);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.col-span-1 {
  grid-column: span 1;
}

.col-span-2 {
  grid-column: span 2;
}

.input-locked {
  background-color: var(--gray-100);
  color: var(--gray-600);
  cursor: not-allowed;
  border-color: var(--gray-300);
}

.text-amber-700 {
  color: #b45309;
}

.font-medium {
  font-weight: 500;
}

.deduction-box {
  background-color: var(--green-50);
  border: 1px solid var(--green-200);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.deduction-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--green-950);
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--gray-200);
  padding-top: 1.25rem;
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .col-span-1, .col-span-2 {
    grid-column: span 1;
  }
  .deduction-box {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
