<template>
  <div class="books-view">
    <!-- Header Section -->
    <div class="view-header">
      <div class="view-titles">
        <div class="title-row">
          <h1 class="page-title">Biblioteca y Seguimiento de Lecturas</h1>
          <span class="badge-catalog">Fondo Peñascal</span>
        </div>
        <p class="page-subtitle">
          Gestión del catálogo de títulos del centro y registro de lecturas individuales del alumnado
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="header-actions">
        <button 
          type="button" 
          class="btn btn-secondary"
          @click="openAssignModal(null)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="text-secondary">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
          <span>Asignar Libro a Alumno</span>
        </button>

        <button 
          v-if="userRole !== 'tutor'"
          type="button" 
          class="btn btn-primary"
          @click="openCreateBookModal"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span>Nuevo Libro</span>
        </button>
      </div>
    </div>

    <!-- Notification Toast -->
    <div v-if="toastMessage" class="alert alert-success toast-banner" role="status">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Segmented Navigation Tabs -->
    <div class="view-tabs">
      <button 
        type="button"
        class="tab-btn" 
        :class="{ active: activeTab === 'catalog' }"
        @click="activeTab = 'catalog'"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
        </svg>
        <span>Catálogo de Libros ({{ booksTotal }})</span>
      </button>

      <button 
        type="button"
        class="tab-btn" 
        :class="{ active: activeTab === 'readings' }"
        @click="activeTab = 'readings'"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
        <span>Lecturas del Aula ({{ readingsTotal }})</span>
      </button>
    </div>

    <!-- ==================== TAB 1: CATÁLOGO DE LIBROS ==================== -->
    <div v-if="activeTab === 'catalog'" class="tab-panel">
      <!-- Toolbar: Buscador y Filtros (FE-17) -->
      <div class="panel-toolbar flat-card">
        <div class="toolbar-left">
          <!-- Buscador -->
          <div class="search-input-wrapper">
            <span class="search-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </span>
            <input 
              v-model="catalogFilter" 
              type="text" 
              placeholder="Buscar título o autor..." 
              class="form-control pl-icon"
              @input="loadBooksList"
            />
          </div>

          <!-- Filtro por Nivel Pedagógico (FE-17 Escenario 1 y 2) -->
          <div class="filter-item">
            <label for="filter-level" class="sr-only">Nivel pedagógico</label>
            <select 
              id="filter-level"
              v-model="selectedLevel" 
              class="form-control select-compact"
              @change="loadBooksList"
            >
              <option value="">Todos los niveles</option>
              <option v-for="lvl in BOOK_LEVELS" :key="lvl" :value="lvl">
                Nivel {{ lvl }}
              </option>
            </select>
          </div>

          <!-- Ordenación: Pedagógica vs Alfabética (FE-17 Escenario 3) -->
          <div class="filter-item">
            <select 
              v-model="sortCriteria" 
              class="form-control select-compact"
              @change="applySorting"
            >
              <option value="pedagogical">Orden pedagógico (0 → II)</option>
              <option value="alphabetical">Orden alfabético (A-Z)</option>
            </select>
          </div>
        </div>

        <div class="toolbar-right">
          <!-- Toggle Deshabilitados -->
          <label class="toggle-label">
            <input 
              type="checkbox" 
              v-model="includeDisabled" 
              class="checkbox-input"
              @change="loadBooksList"
            />
            <span>Mostrar dados de baja</span>
          </label>
        </div>
      </div>

      <!-- Tabla de Libros -->
      <div class="table-container flat-card">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col" class="th-left">Título del Libro</th>
              <th scope="col" class="th-left">Autor</th>
              <th scope="col" class="th-center">Nivel Pedagógico</th>
              <th scope="col" class="th-left">Ejemplares / Formato</th>
              <th scope="col" class="th-center">Disponibilidad</th>
              <th scope="col" class="th-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="book in books" 
              :key="book.id"
              :class="{ 'row-disabled': !book.is_active }"
            >
              <!-- Título -->
              <td class="td-title">
                <span class="book-name font-bold">{{ book.title }}</span>
              </td>

              <!-- Autor -->
              <td class="td-author text-muted">
                {{ book.author || '—' }}
              </td>

              <!-- Nivel Pedagógico (FE-17 Escenario 2) -->
              <td class="td-level text-center">
                <BookLevelBadge :level="book.level" />
              </td>

              <!-- Ejemplares / Formato libre (FE-17 Escenario 5) -->
              <td class="td-copies">
                <span class="copies-tag">{{ book.copies || 'Disponible' }}</span>
              </td>

              <!-- Disponibilidad -->
              <td class="td-status text-center">
                <span 
                  v-if="book.is_active" 
                  class="status-pill status-pill--active"
                >
                  Activo
                </span>
                <span 
                  v-else 
                  class="status-pill status-pill--inactive"
                >
                  Baja lógica
                </span>
              </td>

              <!-- Acciones -->
              <td class="td-actions text-right">
                <div class="actions-wrapper">
                  <button 
                    v-if="book.is_active"
                    type="button" 
                    class="btn-action-text"
                    title="Asignar libro a un alumno"
                    @click="openAssignModal(book.id)"
                  >
                    Asignar
                  </button>

                  <button 
                    v-if="userRole !== 'tutor'"
                    type="button" 
                    class="btn-action-text"
                    title="Editar libro"
                    @click="openEditBookModal(book)"
                  >
                    Editar
                  </button>

                  <button 
                    v-if="userRole !== 'tutor' && book.is_active"
                    type="button" 
                    class="btn-action-text text-danger"
                    title="Dar de baja libro"
                    @click="handleDeleteBook(book)"
                  >
                    Baja
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="books.length === 0">
              <td colspan="6" class="empty-state-cell">
                No se encontraron libros en el catálogo con los filtros aplicados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== TAB 2: LECTURAS DEL AULA ==================== -->
    <div v-if="activeTab === 'readings'" class="tab-panel">
      <!-- Toolbar de Lecturas (FE-22 Escenario 5) -->
      <div class="panel-toolbar flat-card">
        <div class="toolbar-left">
          <!-- Segmented Filter: Todas, En curso, Finalizadas -->
          <div class="segmented-control">
            <button 
              type="button"
              class="seg-item" 
              :class="{ active: readingsStatusFilter === '' }"
              @click="setReadingFilter('')"
            >
              Todas ({{ allReadings.length }})
            </button>
            <button 
              type="button"
              class="seg-item" 
              :class="{ active: readingsStatusFilter === 'en_curso' }"
              @click="setReadingFilter('en_curso')"
            >
              En curso ({{ activeReadingsCount }})
            </button>
            <button 
              type="button"
              class="seg-item" 
              :class="{ active: readingsStatusFilter === 'finalizada' }"
              @click="setReadingFilter('finalizada')"
            >
              Finalizadas ({{ completedReadingsCount }})
            </button>
          </div>

          <!-- Buscador por Alumno o Libro -->
          <div class="search-input-wrapper">
            <span class="search-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </span>
            <input 
              v-model="readingSearch" 
              type="text" 
              placeholder="Filtrar por alumno o libro..." 
              class="form-control pl-icon"
            />
          </div>
        </div>

        <div class="toolbar-right">
          <button 
            type="button" 
            class="btn btn-secondary"
            @click="openAssignModal(null)"
          >
            + Asignar Nueva Lectura
          </button>
        </div>
      </div>

      <!-- Tabla de Lecturas Asignadas -->
      <div class="table-container flat-card">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col" class="th-left">Alumno</th>
              <th scope="col" class="th-left">Libro Asignado</th>
              <th scope="col" class="th-left">Fecha Inicio</th>
              <th scope="col" class="th-left">Fecha Fin</th>
              <th scope="col" class="th-center">Duración</th>
              <th scope="col" class="th-center">Estado</th>
              <th scope="col" class="th-right">Acción Pedagógica</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="reading in filteredReadings" 
              :key="reading.id"
              class="reading-row"
            >
              <!-- Alumno -->
              <td class="td-student">
                <span class="student-name font-bold">{{ reading.student_name }}</span>
              </td>

              <!-- Libro y Nivel -->
              <td class="td-book">
                <div class="book-cell-inline">
                  <span class="book-title-inline">{{ reading.book_title }}</span>
                  <BookLevelBadge :level="reading.book_level || '0'" />
                </div>
              </td>

              <!-- Fecha Inicio -->
              <td class="td-date">{{ reading.start_date }}</td>

              <!-- Fecha Fin (FE-22 Escenario 2) -->
              <td class="td-date">
                <span v-if="reading.end_date" class="text-on-surface font-medium">{{ reading.end_date }}</span>
                <span v-else class="text-muted italic">En lectura...</span>
              </td>

              <!-- Duración en Días (FE-22 Escenario 1) -->
              <td class="td-duration text-center">
                <span v-if="reading.end_date" class="duration-badge">
                  {{ calculateReadingDuration(reading.start_date, reading.end_date) }} días
                </span>
                <span v-else class="text-muted">—</span>
              </td>

              <!-- Estado Visual (FE-22 Escenario 2) -->
              <td class="td-status text-center">
                <span 
                  v-if="reading.status === 'en_curso'" 
                  class="status-pill status-pill--reading"
                >
                  <span class="status-dot dot-reading"></span>
                  En curso
                </span>
                <span 
                  v-else 
                  class="status-pill status-pill--completed"
                >
                  <span class="status-dot dot-completed"></span>
                  Finalizada
                </span>
              </td>

              <!-- Acciones: Cerrar lectura o Reabrir (FE-22 Escenario 1 y 4) -->
              <td class="td-actions text-right">
                <div class="actions-wrapper">
                  <!-- Botón Cerrar Lectura -->
                  <button 
                    v-if="reading.status === 'en_curso'"
                    type="button" 
                    class="btn-action-highlight"
                    title="Marcar como terminada indicando fecha de fin"
                    @click="openCloseReadingDialog(reading)"
                  >
                    Marcar terminada
                  </button>

                  <!-- Botón Reabrir Lectura (FE-22 Escenario 4) -->
                  <button 
                    v-else
                    type="button" 
                    class="btn-action-text text-secondary"
                    title="Reabrir lectura retirando fecha de fin"
                    @click="handleReopenReading(reading)"
                  >
                    Reabrir
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredReadings.length === 0">
              <td colspan="7" class="empty-state-cell">
                No hay lecturas registradas para este criterio de búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL 1: Formulario Alta / Edición de Libro (FE-17) -->
    <BookFormModal 
      :is-open="isBookModalOpen"
      :book="selectedBookForEdit"
      @close="isBookModalOpen = false"
      @saved="handleBookSaved"
    />

    <!-- MODAL 2: Asignar Libro a un Alumno (FE-21) -->
    <AssignBookModal 
      :is-open="isAssignModalOpen"
      :initial-book-id="selectedBookIdForAssign"
      @close="isAssignModalOpen = false"
      @assigned="handleReadingAssigned"
    />

    <!-- MODAL 3: Cerrar Lectura con Fecha de Fin (FE-22) -->
    <div v-if="closingReading" class="modal-backdrop" @click.self="closingReading = null">
      <div class="modal-dialog flat-card" role="dialog" aria-modal="true" aria-labelledby="close-modal-title">
        <div class="modal-header">
          <div>
            <h2 id="close-modal-title" class="modal-title">Marcar Lectura como Terminada</h2>
            <p class="modal-subtitle">
              Alumno: <strong>{{ closingReading.student_name }}</strong> · Libro: <em>{{ closingReading.book_title }}</em>
            </p>
          </div>
          <button type="button" class="btn-close" @click="closingReading = null">&times;</button>
        </div>

        <div v-if="closeErrorMessage" class="alert alert-danger" role="alert">
          {{ closeErrorMessage }}
        </div>

        <form @submit.prevent="submitCloseReading" class="close-reading-form">
          <div class="form-group">
            <label for="reading-close-date" class="form-label">
              Fecha de finalización de lectura <span class="required">*</span>
            </label>
            <input 
              id="reading-close-date"
              v-model="closeEndDate" 
              type="date" 
              required
              class="form-control"
              :min="closingReading.start_date"
            />
            <span class="form-hint">
              Fecha de inicio: {{ closingReading.start_date }} (la fecha de fin no puede ser anterior)
            </span>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closingReading = null">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              Guardar y Cerrar Lectura
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  BOOK_LEVELS, 
  compareBookLevels, 
  calculateReadingDuration, 
  getBooks, 
  deleteBook, 
  getReadings, 
  closeReading, 
  reopenReading 
} from '../../services/booksService';
import BookLevelBadge from '../../components/books/BookLevelBadge.vue';
import BookFormModal from '../../components/books/BookFormModal.vue';
import AssignBookModal from '../../components/books/AssignBookModal.vue';

const props = defineProps({
  userRole: {
    type: String,
    default: 'coordinator'
  }
});

const activeTab = ref('catalog'); // 'catalog' | 'readings'
const toastMessage = ref(null);

// Catálogo State (FE-17)
const books = ref([]);
const booksTotal = ref(0);
const catalogFilter = ref('');
const selectedLevel = ref('');
const includeDisabled = ref(false);
const sortCriteria = ref('pedagogical'); // 'pedagogical' | 'alphabetical'

// Modales State
const isBookModalOpen = ref(false);
const selectedBookForEdit = ref(null);
const isAssignModalOpen = ref(false);
const selectedBookIdForAssign = ref(null);

// Lecturas State (FE-21, FE-22)
const allReadings = ref([]);
const readingsTotal = ref(0);
const readingsStatusFilter = ref(''); // '' (todas) | 'en_curso' | 'finalizada'
const readingSearch = ref('');
const closingReading = ref(null);
const closeEndDate = ref(new Date().toISOString().split('T')[0]);
const closeErrorMessage = ref(null);

function showToast(msg) {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = null;
  }, 4000);
}

// Carga del catálogo de libros
async function loadBooksList() {
  try {
    const res = await getBooks({
      filter: catalogFilter.value,
      level: selectedLevel.value,
      include_disabled: includeDisabled.value
    });
    books.value = res.items || [];
    booksTotal.value = res.total || books.value.length;
    applySorting();
  } catch (err) {
    books.value = [];
    booksTotal.value = 0;
  }
}

function applySorting() {
  if (sortCriteria.value === 'pedagogical') {
    books.value.sort((a, b) => compareBookLevels(a.level, b.level));
  } else {
    books.value.sort((a, b) => a.title.localeCompare(b.title));
  }
}

// Carga de lecturas
async function loadReadingsList() {
  try {
    const res = await getReadings();
    allReadings.value = res.items || [];
    readingsTotal.value = allReadings.value.length;
  } catch (err) {
    allReadings.value = [];
    readingsTotal.value = 0;
  }
}

onMounted(() => {
  loadBooksList();
  loadReadingsList();
});

// Filtros de lecturas
const activeReadingsCount = computed(() => {
  return allReadings.value.filter(r => r.status === 'en_curso').length;
});

const completedReadingsCount = computed(() => {
  return allReadings.value.filter(r => r.status === 'finalizada').length;
});

const filteredReadings = computed(() => {
  return allReadings.value.filter(item => {
    const matchesStatus = !readingsStatusFilter.value || item.status === readingsStatusFilter.value;
    const term = readingSearch.value.trim().toLowerCase();
    const matchesSearch = !term || 
      item.student_name.toLowerCase().includes(term) || 
      item.book_title.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });
});

function setReadingFilter(status) {
  readingsStatusFilter.value = status;
}

// Handlers de Libros
function openCreateBookModal() {
  selectedBookForEdit.value = null;
  isBookModalOpen.value = true;
}

function openEditBookModal(book) {
  selectedBookForEdit.value = { ...book };
  isBookModalOpen.value = true;
}

function handleBookSaved(book) {
  showToast(`Libro "${book.title}" guardado correctamente.`);
  loadBooksList();
}

async function handleDeleteBook(book) {
  const confirmed = window.confirm(`¿Seguro que deseas dar de baja el libro "${book.title}" del catálogo? Los datos históricos se conservarán.`);
  if (!confirmed) return;

  try {
    await deleteBook(book.id);
    showToast(`Libro "${book.title}" dado de baja lógica.`);
    loadBooksList();
  } catch (err) {
    alert(err.message || 'Error al dar de baja el libro.');
  }
}

// Handlers de Asignación
function openAssignModal(bookId = null) {
  selectedBookIdForAssign.value = bookId;
  isAssignModalOpen.value = true;
}

function handleReadingAssigned(newReading) {
  showToast(`Lectura de "${newReading.book_title}" asignada a ${newReading.student_name}.`);
  loadReadingsList();
  activeTab.value = 'readings';
}

// Handlers de Cierre y Reapertura de Lecturas (FE-22)
function openCloseReadingDialog(reading) {
  closingReading.value = reading;
  closeEndDate.value = new Date().toISOString().split('T')[0];
  closeErrorMessage.value = null;
}

async function submitCloseReading() {
  if (!closingReading.value) return;
  closeErrorMessage.value = null;

  // Validación de fecha coherente (FE-22 Escenario 3)
  if (closeEndDate.value < closingReading.value.start_date) {
    closeErrorMessage.value = 'La fecha de fin no puede ser anterior a la de inicio.';
    return;
  }

  try {
    await closeReading(closingReading.value.id, { end_date: closeEndDate.value });
    showToast(`Lectura de "${closingReading.value.book_title}" marcada como terminada.`);
    closingReading.value = null;
    loadReadingsList();
  } catch (err) {
    closeErrorMessage.value = err.message || 'Error al cerrar la lectura.';
  }
}

async function handleReopenReading(reading) {
  try {
    await reopenReading(reading.id);
    showToast(`Lectura de "${reading.book_title}" reabierta en curso.`);
    loadReadingsList();
  } catch (err) {
    alert(err.message || 'Error al reabrir la lectura.');
  }
}
</script>

<style scoped>
.books-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
  width: 100%;
}

/* Header */
.view-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(189, 201, 192, 0.25);
}

@media (min-width: 768px) {
  .view-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-family-display, 'Plus Jakarta Sans', sans-serif);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-on-surface, #191c1b);
  letter-spacing: -0.02em;
  margin: 0;
}

.badge-catalog {
  background-color: var(--color-primary-fixed, #8ef7c7);
  color: var(--color-on-primary-fixed-variant, #005136);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: var(--color-on-surface-variant, #3f4943);
  margin: 0.25rem 0 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Tabs */
.view-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(189, 201, 192, 0.3);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.15rem;
  border: none;
  background: none;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-on-surface-variant, #3f4943);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: var(--color-secondary, #006c49);
}

.tab-btn.active {
  color: var(--color-secondary, #006c49);
  border-bottom-color: var(--color-secondary, #006c49);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Toolbar */
.panel-toolbar {
  padding: 0.875rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--color-surface-container-lowest, #ffffff);
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  border-radius: var(--radius-lg, 0.5rem);
}

@media (min-width: 900px) {
  .panel-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-item {
  display: inline-flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Uniform form controls */
.form-control {
  height: 2.375rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-on-surface, #191c1b);
  background-color: var(--color-surface-container-lowest, #ffffff);
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-md, 0.375rem);
  box-sizing: border-box;
  vertical-align: middle;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-secondary, #006c49);
  box-shadow: 0 0 0 3px rgba(0, 108, 73, 0.15);
}

.search-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  pointer-events: none;
  color: var(--color-on-surface-variant, #3f4943);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pl-icon {
  padding-left: 2.25rem !important;
  width: 15rem;
}

.select-compact {
  padding: 0.45rem 1.75rem 0.45rem 0.75rem;
  cursor: pointer;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant, #3f4943);
  cursor: pointer;
  margin-bottom: 0 !important;
  user-select: none;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--color-secondary, #006c49);
  margin: 0;
}

/* Segmented control for readings */
.segmented-control {
  display: inline-flex;
  background-color: var(--color-surface-container-low, #f2f5f2);
  padding: 0.2rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid rgba(189, 201, 192, 0.4);
}

.seg-item {
  border: none;
  background: none;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm, 0.25rem);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-on-surface-variant, #3f4943);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.seg-item.active {
  background-color: var(--color-surface-container-lowest, #ffffff);
  color: var(--color-on-surface, #191c1b);
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Table */
.table-container {
  background-color: var(--color-surface-container-lowest, #ffffff);
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  border-radius: var(--radius-xl, 0.75rem);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table thead tr {
  background-color: var(--color-surface-container-low, #f2f5f2);
  border-bottom: 1px solid rgba(189, 201, 192, 0.3);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-on-surface-variant, #3f4943);
  font-weight: 700;
}

.data-table th,
.data-table td {
  padding: 0.85rem 1rem;
  vertical-align: middle;
}

.th-left, .td-title, .td-author, .td-copies { text-align: left; }
.th-right, .td-actions { text-align: right; }
.th-center, .td-level, .td-status, .td-duration { text-align: center; }

.data-table tbody tr {
  border-bottom: 1px solid rgba(189, 201, 192, 0.2);
  font-size: 0.875rem;
  transition: background-color 0.15s ease;
}

.data-table tbody tr:hover {
  background-color: var(--color-surface-container-low, #f2f5f2);
}

.row-disabled {
  opacity: 0.6;
  background-color: #fafafa;
}

.copies-tag {
  display: inline-block;
  background-color: var(--color-surface-container-high, #e2e9e2);
  color: var(--color-on-surface-variant, #3f4943);
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm, 0.25rem);
  font-weight: 500;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  line-height: 1.2;
}

.status-pill--active {
  background-color: rgba(142, 247, 199, 0.4);
  color: var(--color-on-primary-fixed-variant, #005136);
}

.status-pill--inactive {
  background-color: var(--color-surface-container-high, #e2e9e2);
  color: var(--color-on-surface-variant, #3f4943);
}

.status-pill--reading {
  background-color: rgba(111, 251, 190, 0.25);
  color: var(--color-secondary, #006c49);
}

.status-pill--completed {
  background-color: var(--color-primary-fixed, #8ef7c7);
  color: var(--color-primary, #0f3e2e);
}

.status-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
}

.dot-reading {
  background-color: var(--color-secondary, #006c49);
}

.dot-completed {
  background-color: var(--color-primary, #0f3e2e);
}

.duration-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-secondary, #006c49);
  background-color: rgba(0, 108, 73, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
  font-variant-numeric: tabular-nums;
}

.book-cell-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
}

.text-secondary {
  color: var(--color-secondary, #006c49) !important;
}

.text-danger {
  color: var(--color-error, #ba1a1a) !important;
}

.btn-action-icon {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  color: var(--color-secondary, #006c49);
  transition: all 0.15s ease;
}

.btn-action-icon:hover {
  background-color: var(--color-surface-container-high, #e2e9e2);
}

.btn-action-text {
  background: none;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.2rem 0.45rem;
  border-radius: var(--radius-sm, 0.25rem);
  color: var(--color-secondary, #006c49);
  transition: all 0.15s ease;
  line-height: 1.25;
}

.btn-action-text:hover {
  background-color: var(--color-surface-container-high, #e2e9e2);
  text-decoration: none;
}

.btn-action-text.text-danger {
  color: var(--color-error, #ba1a1a) !important;
}

.btn-action-text.text-danger:hover {
  background-color: var(--color-error-container, #ffdad6);
  color: #93000a !important;
}

.btn-action-highlight {
  background-color: rgba(0, 108, 73, 0.1);
  color: var(--color-secondary, #006c49);
  border: 1px solid rgba(0, 108, 73, 0.3);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-sm, 0.25rem);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action-highlight:hover {
  background-color: var(--color-secondary, #006c49);
  color: #ffffff;
}

.empty-state-cell {
  text-align: center;
  padding: 2.5rem;
  color: var(--color-on-surface-variant, #3f4943);
}

/* Toast */
.toast-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Close reading dialog form */
.close-reading-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
