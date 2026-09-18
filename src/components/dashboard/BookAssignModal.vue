<script setup>
import { ref, computed } from 'vue';
import { X, Plus, CheckCircle2, BookOpen, ArrowLeft, Search } from 'lucide-vue-next';
import { createBook } from '@/services/booksService';

const props = defineProps({
  isOpen: Boolean,
  students: {
    type: Array,
    default: () => []
  },
  allBooks: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'assign']);

const studentId = ref('');
const selectedBookIds = ref([]);
const assignDate = ref(new Date().toISOString().split('T')[0]);
const showAddForm = ref(false);
const searchQuery = ref('');

const newBookForm = ref({
  title: '',
  author: '',
  format: '',
  level: '',
  category: '',
  center: '',
  quantity: ''
});

const defaultStudents = [
  { id: 1, name: 'Lucas Méndez Ruiz' },
  { id: 2, name: 'Sofía Navarro Ortiz' },
  { id: 3, name: 'Mateo Barrenechea' },
  { id: 4, name: 'Aitana Zubizarreta' },
  { id: 5, name: 'Sofía Navarro Ortiz' },
  { id: 6, name: 'Aitana Zubizarreta' },
  { id: 7, name: 'Alejandro López' },
  { id: 8, name: 'Marina González' },
  { id: 9, name: 'Diego Martínez' },
  { id: 10, name: 'Elena Ruiz' }
];

const studentList = computed(() => props.students && props.students.length > 0 ? props.students : defaultStudents);

const allAvailableBooks = computed(() => props.allBooks && props.allBooks.length > 0 ? props.allBooks : books.value);

const filteredBooks = computed(() => {
  if (!searchQuery.value.trim()) return allAvailableBooks.value;
  return allAvailableBooks.value.filter(book =>
    book.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const books = ref([
  { id: 1, title: 'El Quijote', author: 'Cervantes' },
  { id: 2, title: 'La Casa de Bernarda Alba', author: 'García Lorca' },
  { id: 3, title: 'El Principito', author: 'Saint-Exupéry' },
  { id: 4, title: 'Cien años de soledad', author: 'García Márquez' },
  { id: 5, title: 'La sombra del viento', author: 'Carlos Ruiz Zafón' }
]);

const formatOptions = [
  'Fotocopias',
  'PDF',
  'Libro físico',
  'E-book',
  'Audiobook'
];

const levelOptions = [
  'Nivel 0',
  'Nivel 0-I',
  'Nivel I',
  'Nivel II',
  'Avanzado'
];

function toggleBook(bookId) {
  const index = selectedBookIds.value.indexOf(bookId);
  if (index > -1) {
    selectedBookIds.value.splice(index, 1);
  } else {
    selectedBookIds.value.push(bookId);
  }
}

function isBookSelected(bookId) {
  return selectedBookIds.value.includes(bookId);
}

async function handleAddBook() {
  if (!newBookForm.value.title || !newBookForm.value.author) {
    alert('Título y autor son requeridos');
    return;
  }

  try {
    const created = await createBook(newBookForm.value);
    console.log('Libro creado:', created);
    
    books.value.push(created);
    newBookForm.value = { title: '', author: '', format: '', level: '', category: '', center: '', quantity: '' };
    showAddForm.value = false;
  } catch (err) {
    console.error('Error al crear libro:', err);
    alert('Error al crear el libro: ' + err.message);
  }
}

function handleAssign() {
  console.log('handleAssign called');
  console.log('studentId:', studentId.value);
  console.log('selectedBookIds:', selectedBookIds.value);
  console.log('studentId truthy:', !!studentId.value);
  console.log('selectedBookIds length:', selectedBookIds.value.length);

  if (studentId.value && selectedBookIds.value.length > 0) {
    const selectedBooks = books.value.filter(b => selectedBookIds.value.includes(b.id));
    const booksWithDate = selectedBooks.map(book => ({
      ...book,
      date: assignDate.value
    }));
    console.log('Emitting assign with:', { studentId: parseInt(studentId.value), books: booksWithDate });
    emit('assign', {
      studentId: parseInt(studentId.value),
      books: booksWithDate
    });
    close();
  } else {
    console.log('Cannot assign: missing student or books');
  }
}

function close() {
  studentId.value = '';
  selectedBookIds.value = [];
  assignDate.value = new Date().toISOString().split('T')[0];
  showAddForm.value = false;
  newBookForm.value = { title: '', author: '', format: '', level: '', category: '', center: '', quantity: '' };
  emit('close');
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="close">
    <div class="modal-dialog" @click.stop>
      <!-- FORM AGREGAR LIBRO -->
      <template v-if="showAddForm">
        <div class="modal-header add-header">
          <button type="button" class="back-btn" @click="showAddForm = false">
            <ArrowLeft :size="20" />
          </button>
          <h2>Agregar Nuevo Libro</h2>
          <button type="button" class="close-btn" @click="close">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="title">Título del Libro *</label>
              <input
                id="title"
                v-model="newBookForm.title"
                type="text"
                class="form-control"
                placeholder="Ej: El Quijote"
              />
            </div>

            <div class="form-group full-width">
              <label for="author">Autor *</label>
              <input
                id="author"
                v-model="newBookForm.author"
                type="text"
                class="form-control"
                placeholder="Ej: Miguel de Cervantes"
              />
            </div>

            <div class="form-group">
              <label for="format">Formato (opcional)</label>
              <select id="format" v-model="newBookForm.format" class="form-control">
                <option value="">-- Selecciona --</option>
                <option v-for="fmt in formatOptions" :key="fmt" :value="fmt">
                  {{ fmt }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="level">Nivel</label>
              <select id="level" v-model="newBookForm.level" class="form-control">
                <option value="">-- Selecciona --</option>
                <option v-for="lvl in levelOptions" :key="lvl" :value="lvl">
                  {{ lvl }}
                </option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="category">Categoría</label>
              <input
                id="category"
                v-model="newBookForm.category"
                type="text"
                class="form-control"
                placeholder="Ej: Clásica, Infantil, Drama"
              />
            </div>

            <div class="form-group">
              <label for="center">Centro (opcional)</label>
              <input
                id="center"
                v-model="newBookForm.center"
                type="text"
                class="form-control"
                placeholder="Ej: Biblioteca A, Aula 3"
              />
            </div>

            <div class="form-group">
              <label for="quantity">Nº ejemplares (opcional)</label>
              <input
                id="quantity"
                v-model="newBookForm.quantity"
                type="number"
                class="form-control"
                placeholder="Ej: 5"
                min="0"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="showAddForm = false">Cancelar</button>
          <button type="button" class="btn-create" @click="handleAddBook">
            Crear Libro
          </button>
        </div>
      </template>

      <!-- FORM ASIGNAR LIBROS -->
      <template v-else>
        <div class="modal-header">
          <h2>Asignar Libros a Estudiante</h2>
          <button type="button" class="close-btn" @click="close">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="student">Seleccionar Estudiante</label>
            <select id="student" v-model="studentId" class="form-control">
              <option value="">-- Selecciona un estudiante --</option>
              <option v-for="s in studentList" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="assignDate">Fecha de Asignación</label>
            <input
              id="assignDate"
              v-model="assignDate"
              type="date"
              class="form-control"
            />
          </div>

          <div class="books-section">
            <div class="section-header">
              <h3>Lista de Libros</h3>
              <button type="button" class="add-book-btn" @click="showAddForm = true">
                <Plus :size="16" />
                Agregar Nuevo
              </button>
            </div>

            <div class="search-box">
              <Search :size="18" class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por título o autor..."
                class="search-input"
              />
            </div>

            <div class="books-grid">
              <div
                v-for="book in filteredBooks"
                :key="book.id"
                class="book-card"
                :class="{ selected: isBookSelected(book.id) }"
                @click="toggleBook(book.id)"
              >
                <div class="book-content">
                  <BookOpen :size="16" class="book-icon" />
                  <div class="book-info">
                    <div class="book-title">{{ book.title }}</div>
                    <div class="book-author">{{ book.author }}</div>
                  </div>
                </div>
                
                <div class="book-action">
                  <button
                    v-if="isBookSelected(book.id)"
                    type="button"
                    class="check-btn"
                    @click.stop="toggleBook(book.id)"
                  >
                    <CheckCircle2 :size="20" />
                  </button>
                  <button
                    v-else
                    type="button"
                    class="add-btn"
                    @click.stop="toggleBook(book.id)"
                  >
                    <Plus :size="20" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="close">Cancelar</button>
          <button
            type="button"
            class="btn-assign"
            @click="handleAssign"
            :disabled="!studentId || selectedBookIds.length === 0"
          >
            Asignar {{ selectedBookIds.length }} libro{{ selectedBookIds.length !== 1 ? 's' : '' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #f8fafb 0%, #f3f4f6 100%);
}

.modal-header.add-header {
  padding: 1.5rem 2rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
  flex: 1;
  text-align: center;
}

.back-btn,
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover,
.close-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #111827;
}

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.625rem;
  font-size: 0.95rem;
  color: #374151;
  letter-spacing: 0.3px;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1.125rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  transition: all 0.25s ease;
  font-family: inherit;
}

.form-control::placeholder {
  color: #d1d5db;
}

.form-control:hover {
  border-color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.form-control:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.books-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  background: white;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  font-size: 0.9rem;
  color: #111827;
  font-family: inherit;
}

.search-input::placeholder {
  color: #d1d5db;
}

.search-input:focus {
  outline: none;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.add-book-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.add-book-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.books-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: white;
}

.book-card:hover {
  background: #f0fdf4;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
  transform: translateX(4px);
}

.book-card.selected {
  background: #ecfdf5;
  border-color: #10b981;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
}

.book-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  flex: 1;
}

.book-icon {
  color: #10b981;
  flex-shrink: 0;
  margin-top: 2px;
}

.book-info {
  flex: 1;
}

.book-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #111827;
  line-height: 1.4;
}

.book-author {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.375rem;
}

.book-card.selected .book-title {
  color: #059669;
}

.book-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1rem;
  flex-shrink: 0;
}

.check-btn,
.add-btn {
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn {
  color: #d1d5db;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem;
}

.add-btn:hover {
  color: #10b981;
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.check-btn {
  color: #10b981;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid #f0f0f0;
  background: #f9fafb;
}

.btn-cancel,
.btn-assign,
.btn-create {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.25s;
  letter-spacing: 0.3px;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.btn-assign,
.btn-create {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.btn-assign:hover:not(:disabled),
.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-assign:active:not(:disabled),
.btn-create:active {
  transform: translateY(0);
}

.btn-assign:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}
</style>
