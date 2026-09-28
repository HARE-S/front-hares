<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="handleCancel">
    <div class="modal-dialog flat-card" role="dialog" aria-modal="true" aria-labelledby="modal-assign-title">
      <!-- Header -->
      <div class="modal-header">
        <div>
          <h2 id="modal-assign-title" class="modal-title">Asignar Libro a un Alumno</h2>
          <p class="modal-subtitle">Registro pedagógico de inicio de lectura individual (Aula 3º Primaria)</p>
        </div>
        <button type="button" class="btn-close" aria-label="Cerrar modal" @click="handleCancel">
          &times;
        </button>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="assign-form">
        <!-- Selector de Alumno -->
        <div class="form-group">
          <label for="assign-student" class="form-label">
            Alumno / Estudiante <span class="required">*</span>
          </label>
          <select 
            id="assign-student"
            v-model="formData.student_id" 
            required
            class="form-control"
            :disabled="isSubmitting"
          >
            <option value="" disabled>Selecciona un alumno...</option>
            <option v-for="student in studentsList" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.section }})
            </option>
          </select>
        </div>

        <!-- Selector Modo: Catálogo vs Libro Libre -->
        <div class="selection-mode-pills">
          <button 
            type="button" 
            class="pill-btn" 
            :class="{ active: selectionMode === 'catalog' }"
            @click="selectionMode = 'catalog'"
          >
            Libro del Catálogo
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            :class="{ active: selectionMode === 'custom' }"
            @click="selectionMode = 'custom'"
          >
            + Otro Libro de Aula
          </button>
        </div>

        <!-- MODO 1: Catálogo existente -->
        <div v-if="selectionMode === 'catalog'" class="form-group">
          <label class="form-label">
            Buscar Libro en el Catálogo <span class="required">*</span>
          </label>
          <div class="book-search-box">
            <span class="search-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Escribe título o autor para filtrar..."
              class="form-control pl-search"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Lista de libros filtrados para selección rápida -->
          <div class="books-picker-list">
            <label 
              v-for="b in filteredAvailableBooks" 
              :key="b.id"
              class="book-option-item"
              :class="{ selected: formData.book_id === b.id }"
            >
              <input 
                type="radio" 
                name="selected-book" 
                :value="b.id" 
                v-model="formData.book_id" 
                class="sr-only"
              />
              <div class="book-option-content">
                <div class="book-option-title-row">
                  <span class="book-opt-title">{{ b.title }}</span>
                  <BookLevelBadge :level="b.level" />
                </div>
                <div class="book-option-meta">
                  <span v-if="b.author" class="book-opt-author">{{ b.author }}</span>
                  <span v-if="b.copies" class="book-opt-copies">· {{ b.copies }}</span>
                </div>
              </div>
              <div class="select-indicator">
                <svg v-if="formData.book_id === b.id" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </label>

            <div v-if="filteredAvailableBooks.length === 0" class="no-books-msg">
              <p>No se encontraron libros activos que coincidan con la búsqueda.</p>
              <button 
                v-if="searchQuery.trim()" 
                type="button" 
                class="btn-suggest-custom"
                @click="switchToCustom(searchQuery)"
              >
                ¿Asignar "{{ searchQuery }}" como libro de aula?
              </button>
            </div>
          </div>
        </div>

        <!-- MODO 2: Libro Libre de Aula -->
        <div v-else class="custom-book-fields">
          <div class="form-group">
            <label for="custom-book-title" class="form-label">
              Título del Libro de Aula <span class="required">*</span>
            </label>
            <input 
              id="custom-book-title"
              v-model="customBook.title" 
              type="text" 
              placeholder="Ej: El Principito, Caperucita en Manhattan..."
              class="form-control"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-row">
            <div class="form-group col-half">
              <label for="custom-book-level" class="form-label">
                Nivel Pedagógico <span class="required">*</span>
              </label>
              <select 
                id="custom-book-level"
                v-model="customBook.level" 
                class="form-control"
                :disabled="isSubmitting"
              >
                <option v-for="lvl in BOOK_LEVELS" :key="lvl" :value="lvl">
                  Nivel {{ lvl }}
                </option>
              </select>
            </div>

            <div class="form-group col-half">
              <label for="custom-book-copies" class="form-label">
                Ejemplares / Formato <span class="optional-label">(opcional)</span>
              </label>
              <input 
                id="custom-book-copies"
                v-model="customBook.copies" 
                type="text" 
                placeholder="Ej: 15 ejemplares, PDF aula"
                class="form-control"
                :disabled="isSubmitting"
              />
            </div>
          </div>
        </div>

        <!-- Fechas: Inicio (requerida) y Fin (opcional - FE-21 Escenario 2) -->
        <div class="form-row">
          <div class="form-group col-half">
            <label for="assign-start-date" class="form-label">
              Fecha de inicio <span class="required">*</span>
            </label>
            <input 
              id="assign-start-date"
              v-model="formData.start_date" 
              type="date" 
              required
              class="form-control"
              :disabled="isSubmitting"
            />
            <span class="form-hint">Inicio de lectura por parte del alumno</span>
          </div>

          <div class="form-group col-half">
            <label for="assign-end-date" class="form-label">
              Fecha de fin <span class="optional-label">(opcional)</span>
            </label>
            <input 
              id="assign-end-date"
              v-model="formData.end_date" 
              type="date" 
              class="form-control"
              :disabled="isSubmitting"
            />
            <span class="form-hint">Dejar en blanco si está actualmente en curso</span>
          </div>
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
            :disabled="isSubmitting || !formData.student_id || (selectionMode === 'catalog' && !formData.book_id) || (selectionMode === 'custom' && !customBook.title.trim())"
          >
            {{ isSubmitting ? 'Asignando...' : 'Confirmar Asignación' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { BOOK_LEVELS, getBooks, assignBook } from '../../services/booksService';
import { getStudents } from '../../services/studentService';
import BookLevelBadge from './BookLevelBadge.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialStudentId: {
    type: [String, Number],
    default: null
  },
  initialBookId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['close', 'assigned']);

const isSubmitting = ref(false);
const errorMessage = ref(null);
const searchQuery = ref('');
const availableBooks = ref([]);

const selectionMode = ref('catalog'); // 'catalog' | 'custom'
const customBook = ref({
  title: '',
  level: '0',
  copies: ''
});

const today = new Date().toISOString().split('T')[0];

const formData = ref({
  student_id: '',
  book_id: null,
  start_date: today,
  end_date: ''
});

// Estudiantes cargados de la base de datos
const studentsList = ref([]);

async function loadStudents() {
  try {
    const res = await getStudents({ limit: 100 });
    if (res && res.items && res.items.length > 0) {
      studentsList.value = res.items.map(s => ({
        id: s.id,
        name: s.name,
        section: (s.sections && s.sections.length > 0) ? s.sections.join(', ') : 'Matriculado'
      }));
      return;
    }
  } catch (err) {
    // Si no hay conexión o entorno offline
  }
  if (studentsList.value.length === 0) {
    studentsList.value = [
      { id: '1', name: 'Lucas Méndez Ruiz', section: '1A' },
      { id: '2', name: 'Sofía Navarro Ortiz', section: '1A' },
      { id: '3', name: 'Mateo Barrenechea', section: '1A' }
    ];
  }
}

async function loadBooks() {
  try {
    const res = await getBooks({ include_disabled: false });
    // Solo libros activos (FE-21 Escenario 4)
    availableBooks.value = res.items.filter(b => b.is_active);
  } catch (err) {
    availableBooks.value = [];
  }
}

onMounted(() => {
  loadBooks();
  loadStudents();
});

watch(() => props.isOpen, (open) => {
  if (open) {
    loadBooks();
    loadStudents();
    const defaultStudentId = props.initialStudentId || (studentsList.value[0]?.id || '');
    formData.value = {
      student_id: defaultStudentId,
      book_id: props.initialBookId || null,
      start_date: today,
      end_date: ''
    };
    selectionMode.value = 'catalog';
    customBook.value = {
      title: '',
      level: '0',
      copies: ''
    };
    searchQuery.value = '';
    errorMessage.value = null;
  }
});

function switchToCustom(title) {
  selectionMode.value = 'custom';
  customBook.value.title = title || '';
}

// Filtrado reactivo en vivo sobre los libros disponibles (FE-21 Escenario 3)
const filteredAvailableBooks = computed(() => {
  if (!searchQuery.value.trim()) {
    return availableBooks.value;
  }
  const term = searchQuery.value.trim().toLowerCase();
  return availableBooks.value.filter(b => 
    b.title.toLowerCase().includes(term) || 
    (b.author && b.author.toLowerCase().includes(term))
  );
});

function handleCancel() {
  errorMessage.value = null;
  emit('close');
}

async function handleSubmit() {
  errorMessage.value = null;
  if (!formData.value.student_id) {
    errorMessage.value = 'Debes seleccionar un alumno.';
    return;
  }

  if (selectionMode.value === 'custom') {
    if (!customBook.value.title.trim()) {
      errorMessage.value = 'Debes introducir el título del libro.';
      return;
    }
  } else {
    if (!formData.value.book_id) {
      errorMessage.value = 'Debes seleccionar un libro para la lectura.';
      return;
    }
  }

  if (!formData.value.start_date) {
    errorMessage.value = 'La fecha de inicio es obligatoria.';
    return;
  }
  if (formData.value.end_date && formData.value.end_date < formData.value.start_date) {
    errorMessage.value = 'La fecha de fin no puede ser anterior a la de inicio.';
    return;
  }

  isSubmitting.value = true;
  try {
    const student = studentsList.value.find(s => String(s.id) === String(formData.value.student_id));
    let payload;

    if (selectionMode.value === 'custom') {
      payload = {
        student_id: formData.value.student_id,
        student_name: student ? student.name : 'Alumno',
        book_title: customBook.value.title.trim(),
        title: customBook.value.title.trim(),
        level: customBook.value.level || '0',
        copies_note: customBook.value.copies.trim() || null,
        start_date: formData.value.start_date,
        end_date: formData.value.end_date || null
      };
    } else {
      const selectedBook = availableBooks.value.find(b => String(b.id) === String(formData.value.book_id));
      payload = {
        student_id: formData.value.student_id,
        student_name: student ? student.name : 'Alumno',
        book_id: formData.value.book_id,
        test_id: selectedBook?.test_id || null,
        test_code: selectedBook?.test_code || null,
        book_title: selectedBook ? selectedBook.title : '',
        title: selectedBook ? selectedBook.title : '',
        level: selectedBook ? selectedBook.level : '0',
        copies_note: selectedBook ? (selectedBook.copies || '') : '',
        start_date: formData.value.start_date,
        end_date: formData.value.end_date || null
      };
    }

    const reading = await assignBook(payload);
    emit('assigned', reading);
    emit('close');
  } catch (err) {
    errorMessage.value = err.message || 'Error al registrar la asignación de lectura.';
  } finally {
    isSubmitting.value = false;
  }
}

</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 62, 46, 0.45);
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
  max-width: 36rem;
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

.assign-form {
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

.optional-label {
  font-weight: 400;
  color: var(--color-on-surface-variant, #3f4943);
  font-size: 0.75rem;
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

.book-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  pointer-events: none;
  color: var(--color-on-surface-variant, #3f4943);
  display: flex;
  align-items: center;
}

.pl-search {
  padding-left: 2.25rem;
  width: 100%;
}

.books-picker-list {
  max-height: 11rem;
  overflow-y: auto;
  border: 1px solid rgba(189, 201, 192, 0.4);
  border-radius: var(--radius-md, 0.5rem);
  background-color: var(--color-surface-container-low, #f2f5f2);
  margin-top: 0.35rem;
  display: flex;
  flex-direction: column;
}

.book-option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid rgba(189, 201, 192, 0.25);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.book-option-item:last-child {
  border-bottom: none;
}

.book-option-item:hover {
  background-color: var(--color-surface-container-high, #e2e9e2);
}

.book-option-item.selected {
  background-color: rgba(142, 247, 199, 0.3);
  border-color: rgba(0, 108, 73, 0.3);
}

.book-option-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.book-option-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.book-opt-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-on-surface, #191c1b);
}

.book-option-meta {
  font-size: 0.75rem;
  color: var(--color-on-surface-variant, #3f4943);
}

.select-indicator {
  width: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary, #006c49);
}

.no-books-msg {
  padding: 1.5rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant, #3f4943);
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

.alert-danger {
  margin: 1rem 1.5rem 0;
  padding: 0.75rem 1rem;
  background-color: var(--color-error-container, #ffdad6);
  color: var(--color-on-error-container, #410002);
  border-radius: var(--radius-md, 0.5rem);
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(189, 201, 192, 0.3);
}

.selection-mode-pills {
  display: flex;
  background-color: var(--color-surface-container-high, #e2e9e2);
  padding: 0.25rem;
  border-radius: var(--radius-md, 0.5rem);
  gap: 0.35rem;
  margin-bottom: 0.25rem;
}

.pill-btn {
  flex: 1;
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-sm, 0.375rem);
  border: none;
  background: transparent;
  color: var(--color-on-surface-variant, #3f4943);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn.active {
  background-color: var(--color-surface-container-lowest, #ffffff);
  color: var(--color-secondary, #006c49);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-suggest-custom {
  margin-top: 0.75rem;
  background: var(--color-surface-container-lowest, #ffffff);
  border: 1px dashed var(--color-secondary, #006c49);
  color: var(--color-secondary, #006c49);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm, 0.375rem);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-suggest-custom:hover {
  background-color: rgba(0, 108, 73, 0.08);
}

.custom-book-fields {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  background: var(--color-surface-container-low, #f2f5f2);
  padding: 1rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid rgba(189, 201, 192, 0.4);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
