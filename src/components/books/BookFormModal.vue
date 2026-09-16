<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="handleCancel">
    <div class="modal-dialog flat-card" role="dialog" aria-modal="true" :aria-labelledby="modalTitleId">
      <!-- Modal Header -->
      <div class="modal-header">
        <div>
          <h2 :id="modalTitleId" class="modal-title">
            {{ isEditMode ? 'Editar Libro de Lectura' : 'Nuevo Libro para el Catálogo' }}
          </h2>
          <p class="modal-subtitle">
            Gestión del fondo bibliográfico del centro para seguimiento de fluidez y comprensión
          </p>
        </div>
        <button type="button" class="btn-close" aria-label="Cerrar modal" @click="handleCancel">
          &times;
        </button>
      </div>

      <!-- Error Banner -->
      <div v-if="errorMessage" class="alert alert-danger mb-4" role="alert">
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="book-form">
        <!-- Título -->
        <div class="form-group">
          <label for="book-title" class="form-label">
            Título del libro <span class="required">*</span>
          </label>
          <input 
            id="book-title"
            v-model="formData.title" 
            type="text" 
            required 
            placeholder="Ej: El bosque animado"
            class="form-control"
            :disabled="isSubmitting"
          />
        </div>

        <!-- Autor -->
        <div class="form-group">
          <label for="book-author" class="form-label">Autor / Ilustrador</label>
          <input 
            id="book-author"
            v-model="formData.author" 
            type="text" 
            placeholder="Ej: Wenceslao Fernández Flórez"
            class="form-control"
            :disabled="isSubmitting"
          />
        </div>

        <!-- Nivel Pedagógico y Ejemplares en 2 columnas -->
        <div class="form-row">
          <div class="form-group col-half">
            <label for="book-level" class="form-label">
              Nivel pedagógico <span class="required">*</span>
            </label>
            <select 
              id="book-level"
              v-model="formData.level" 
              required
              class="form-control"
              :disabled="isSubmitting"
            >
              <option v-for="lvl in BOOK_LEVELS" :key="lvl" :value="lvl">
                Nivel {{ lvl }}
              </option>
            </select>
            <span class="form-hint">Escala pedagógica oficial del centro (0 a II)</span>
          </div>

          <div class="form-group col-half">
            <label for="book-copies" class="form-label">Ejemplares / Formato</label>
            <input 
              id="book-copies"
              v-model="formData.copies" 
              type="text" 
              placeholder="Ej: 11 fotocopias, PDF..."
              class="form-control"
              :disabled="isSubmitting"
            />
            <span class="form-hint">Anotación libre de inventario físico</span>
          </div>
        </div>

        <!-- Estado Activo / Baja Lógica -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="formData.is_active" 
              class="checkbox-input"
              :disabled="isSubmitting"
            />
            <span>Libro activo y disponible para asignar a alumnos</span>
          </label>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            :disabled="isSubmitting"
            @click="handleCancel"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Registrar Libro') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { BOOK_LEVELS, createBook, updateBook } from '../../services/booksService';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  book: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);

const isEditMode = computed(() => Boolean(props.book && props.book.id));
const modalTitleId = computed(() => isEditMode.value ? 'modal-edit-book-title' : 'modal-create-book-title');

const isSubmitting = ref(false);
const errorMessage = ref(null);

const formData = ref({
  title: '',
  author: '',
  level: '0',
  copies: '',
  is_active: true
});

watch(() => props.book, (newVal) => {
  if (newVal) {
    formData.value = {
      title: newVal.title || '',
      author: newVal.author || '',
      level: newVal.level || '0',
      copies: newVal.copies || '',
      is_active: newVal.is_active !== undefined ? newVal.is_active : true
    };
  } else {
    resetForm();
  }
  errorMessage.value = null;
}, { immediate: true });

function resetForm() {
  formData.value = {
    title: '',
    author: '',
    level: '0',
    copies: '',
    is_active: true
  };
  errorMessage.value = null;
}

function handleCancel() {
  resetForm();
  emit('close');
}

async function handleSubmit() {
  errorMessage.value = null;
  if (!formData.value.title.trim()) {
    errorMessage.value = 'El título del libro es obligatorio.';
    return;
  }

  isSubmitting.value = true;
  try {
    let result;
    if (isEditMode.value) {
      result = await updateBook(props.book.id, formData.value);
    } else {
      result = await createBook(formData.value);
    }
    emit('saved', result);
    resetForm();
    emit('close');
  } catch (err) {
    errorMessage.value = err.message || 'Error al guardar el libro en el catálogo.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 62, 46, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-dialog {
  background: var(--color-surface-container-lowest, #ffffff);
  border-radius: var(--radius-xl, 0.75rem);
  width: 100%;
  max-width: 34rem;
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  overflow: hidden;
  animation: modalIn 0.2s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(189, 201, 192, 0.3);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.modal-title {
  font-family: var(--font-family-display, 'Plus Jakarta Sans', sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-on-surface, #191c1b);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant, #3f4943);
  margin: 0.25rem 0 0 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-on-surface-variant, #3f4943);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm, 0.25rem);
}

.btn-close:hover {
  background-color: var(--color-surface-container-high, #e2e9e2);
}

.book-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface, #191c1b);
}

.required {
  color: var(--color-error, #ba1a1a);
}

.form-control {
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid rgba(189, 201, 192, 0.6);
  background-color: var(--color-surface-container-lowest, #ffffff);
  color: var(--color-on-surface, #191c1b);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.form-control:focus {
  border-color: var(--color-secondary, #006c49);
  box-shadow: 0 0 0 2px rgba(0, 108, 73, 0.15);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.col-half {
  flex: 1;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--color-on-surface-variant, #3f4943);
}

.checkbox-group {
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-on-surface, #191c1b);
  cursor: pointer;
}

.checkbox-input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--color-secondary, #006c49);
  cursor: pointer;
}

.alert-danger {
  margin: 1rem 1.5rem 0;
  padding: 0.75rem 1rem;
  background-color: var(--color-error-container, #ffdad6);
  color: var(--color-on-error-container, #410002);
  border-radius: var(--radius-md, 0.5rem);
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(189, 201, 192, 0.3);
}
</style>
