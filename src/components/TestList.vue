<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { getTests, deleteTest } from '../services/testsService';
import TestTypeBadge from './domain/TestTypeBadge.vue';
import {
  Search,
  RotateCcw,
  Trash2,
  Edit2,
  BookText,
  ChevronLeft,
  ChevronRight,
  Layers,
  AlertTriangle,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-vue-next';

const props = defineProps({
  userRole: {
    type: String,
    default: 'coordinator' // 'coordinator' | 'tutor' | 'admin'
  }
});

const emit = defineEmits(['edit-test']);

const tests = ref([]);
const total = ref(0);
const page = ref(1);
const pages = ref(1);
const limit = ref(10);
const isLoading = ref(false);
const actionError = ref('');
const actionSuccess = ref('');

const canManage = computed(() => props.userRole !== 'tutor');

// Modal de confirmación pedagógica de baja
const testToDelete = ref(null);
const isConfirmOpen = ref(false);
const isDeleting = ref(false);

const filters = reactive({
  search: '',
  course: '',
  test_letter: '',
  type: '',
  include_disabled: false
});

function syncFiltersFromUrl() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (params.has('search')) filters.search = params.get('search') || '';
  if (params.has('course')) {
    const c = params.get('course');
    filters.course = c !== '' ? (isNaN(parseInt(c, 10)) ? c : parseInt(c, 10)) : '';
  }
  if (params.has('letter')) filters.test_letter = params.get('letter') || '';
  if (params.has('type')) filters.type = params.get('type') || '';
  if (params.has('include_disabled')) filters.include_disabled = params.get('include_disabled') === 'true';
  if (params.has('page')) page.value = parseInt(params.get('page'), 10) || 1;
}

function updateUrlQuery() {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.course !== '' && filters.course !== null && filters.course !== undefined) {
    params.set('course', String(filters.course));
  }
  if (filters.test_letter) params.set('letter', filters.test_letter);
  if (filters.type) params.set('type', filters.type);
  if (filters.include_disabled) params.set('include_disabled', 'true');
  if (page.value > 1) params.set('page', String(page.value));

  const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
  window.history.replaceState(null, '', newUrl);
}

async function fetchTests() {
  isLoading.value = true;
  actionError.value = '';
  try {
    const res = await getTests({
      filter: filters.search.trim() || undefined,
      course: filters.course !== '' ? filters.course : undefined,
      test_letter: filters.test_letter || undefined,
      type: filters.type || undefined,
      include_disabled: filters.include_disabled ? true : undefined,
      page: page.value,
      limit: limit.value
    });

    tests.value = res.items || [];
    total.value = res.total || 0;
    pages.value = res.pages || 1;
    page.value = res.page || 1;
    updateUrlQuery();
  } catch (err) {
    actionError.value = err.message || 'Error al cargar el catálogo de pruebas.';
  } finally {
    isLoading.value = false;
  }
}

function handleFilterChange() {
  page.value = 1;
  fetchTests();
}

function resetFilters() {
  filters.search = '';
  filters.course = '';
  filters.test_letter = '';
  filters.type = '';
  filters.include_disabled = false;
  page.value = 1;
  fetchTests();
}

function goToPage(newPage) {
  if (newPage >= 1 && newPage <= pages.value) {
    page.value = newPage;
    fetchTests();
  }
}

function openDeleteModal(test) {
  testToDelete.value = test;
  isConfirmOpen.value = true;
}

function closeDeleteModal() {
  testToDelete.value = null;
  isConfirmOpen.value = false;
}

async function confirmDelete() {
  if (!testToDelete.value) return;
  isDeleting.value = true;
  actionError.value = '';
  actionSuccess.value = '';

  try {
    await deleteTest(testToDelete.value.id);
    actionSuccess.value = `Prueba "${testToDelete.value.code}" dada de baja. El histórico se conserva íntegro.`;
    closeDeleteModal();
    await fetchTests();
  } catch (err) {
    actionError.value = err.message || 'Error al dar de baja la prueba.';
  } finally {
    isDeleting.value = false;
  }
}

function handleEdit(test) {
  emit('edit-test', test);
}

onMounted(() => {
  syncFiltersFromUrl();
  fetchTests();
});

defineExpose({
  refresh: fetchTests
});
</script>

<template>
  <div class="test-list-card flat-card">
    <div class="flat-card-header">
      <div class="header-title-group">
        <div class="icon-box">
          <Layers :size="24" class="text-green-700" />
        </div>
        <div>
          <h2>Catálogo de Pruebas de Lectura</h2>
          <p class="subtitle">Textos registrados con filtros, ordenación y paginación sincronizada</p>
        </div>
      </div>
      <div class="header-actions">
        <span class="badge badge-green">{{ total }} pruebas</span>
        <button
          class="btn btn-secondary btn-sm"
          :disabled="isLoading"
          title="Recargar catálogo"
          @click="fetchTests"
        >
          <RotateCcw :size="14" :class="{ 'spin-icon': isLoading }" />
          <span>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Contenedor principal con padding equilibrado -->
    <div class="card-body">
      <!-- Alertas de estado de acción -->
      <div v-if="actionSuccess" class="alert alert-success">
        <CheckCircle2 :size="18" />
        <span>{{ actionSuccess }}</span>
      </div>
      <div v-if="actionError" class="alert alert-danger">
        <AlertCircle :size="18" />
        <span>{{ actionError }}</span>
      </div>

    <!-- Barra de Filtros Planos -->
    <div class="filters-bar">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          v-model="filters.search"
          type="text"
          class="form-input search-input"
          placeholder="Buscar por código o título..."
          @input="handleFilterChange"
        />
      </div>

      <div class="select-filters">
        <!-- Curso -->
        <select
          v-model="filters.course"
          class="form-select filter-select"
          title="Filtrar por curso"
          @change="handleFilterChange"
        >
          <option value="">Todos los cursos</option>
          <option :value="0">Curso 0 (Inicial)</option>
          <option :value="1">1º Primaria</option>
          <option :value="2">2º Primaria</option>
          <option :value="3">3º Primaria</option>
          <option :value="4">4º Primaria</option>
          <option :value="5">5º Primaria</option>
          <option :value="6">6º Primaria</option>
        </select>

        <!-- Letra -->
        <select
          v-model="filters.test_letter"
          class="form-select filter-select-sm"
          title="Filtrar por letra"
          @change="handleFilterChange"
        >
          <option value="">Letras: Todas</option>
          <option value="I">I — Inicial</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
        </select>

        <!-- Tipo -->
        <select
          v-model="filters.type"
          class="form-select filter-select"
          title="Filtrar por tipo"
          @change="handleFilterChange"
        >
          <option value="">Todos los tipos</option>
          <option value="F">Funcional (F)</option>
          <option value="L">Literario (L)</option>
        </select>

        <!-- Checkbox mostrar deshabilitadas -->
        <label class="checkbox-label" title="Incluir pruebas dadas de baja lógica">
          <input
            v-model="filters.include_disabled"
            type="checkbox"
            class="form-checkbox"
            @change="handleFilterChange"
          />
          <span>Mostrar deshabilitadas</span>
        </label>

        <!-- Limpiar filtros -->
        <button
          v-if="filters.search || filters.course !== '' || filters.test_letter || filters.type || filters.include_disabled"
          class="btn btn-secondary btn-sm"
          @click="resetFilters"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="isLoading && tests.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando pruebas desde el catálogo...</p>
    </div>

    <!-- Tabla plana de pruebas -->
    <div v-else-if="tests.length > 0" class="flat-table-wrapper">
      <table class="flat-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Lectura / Título</th>
            <th>Palabras</th>
            <th>Curso</th>
            <th>Letra</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th v-if="canManage" class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="test in tests"
            :key="test.id"
            :class="{ 'row-disabled': test.disabled_at }"
          >
            <td>
              <span class="badge badge-emerald">{{ test.code }}</span>
            </td>
            <td class="font-medium">
              <div class="reading-title">
                <BookText :size="15" class="text-green-700" />
                <span>{{ test.name }}</span>
              </div>
            </td>
            <td>{{ test.words }} palabras</td>
            <td>
              <span v-if="test.course !== null && test.course !== undefined" class="badge badge-gray">
                {{ test.course === 0 ? 'Inicial' : `${test.course}º` }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <span v-if="test.test_letter" class="badge badge-green">
                {{ test.test_letter }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <TestTypeBadge :type="test.type" />
            </td>
            <td>
              <span v-if="test.disabled_at" class="badge badge-danger" title="Prueba dada de baja lógica">
                Deshabilitada
              </span>
              <span v-else class="badge badge-green">Activa</span>
            </td>
            <td v-if="canManage" class="text-right">
              <div class="actions-group">
                <button
                  class="btn btn-secondary btn-icon"
                  title="Editar datos de la prueba"
                  @click="handleEdit(test)"
                >
                  <Edit2 :size="14" />
                </button>
                <button
                  v-if="!test.disabled_at"
                  class="btn btn-danger-outline btn-icon"
                  title="Dar de baja lógica la prueba"
                  @click="openDeleteModal(test)"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <BookText :size="42" class="text-green-300" />
      <h3>No se encontraron pruebas</h3>
      <p class="subtitle">No hay pruebas que coincidan con los filtros aplicados o el catálogo está vacío.</p>
      <button class="btn btn-secondary btn-sm" @click="resetFilters">Restablecer filtros</button>
    </div>

    <!-- Paginación Plana -->
    <div v-if="pages > 1" class="pagination-bar">
      <div class="pagination-info">
        Página <strong>{{ page }}</strong> de <strong>{{ pages }}</strong> ({{ total }} resultados)
      </div>
      <div class="pagination-buttons">
        <button
          class="btn btn-secondary btn-sm"
          :disabled="page <= 1 || isLoading"
          @click="goToPage(page - 1)"
        >
          <ChevronLeft :size="16" />
          <span>Anterior</span>
        </button>
        <button
          class="btn btn-secondary btn-sm"
          :disabled="page >= pages || isLoading"
          @click="goToPage(page + 1)"
        >
          <span>Siguiente</span>
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>

    <!-- Modal de confirmación pedagógica de baja lógica -->
    <div v-if="isConfirmOpen" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-warning-icon">
            <AlertTriangle :size="22" />
          </div>
          <h3>Confirmar baja lógica de prueba</h3>
        </div>

        <div class="modal-body">
          <p>
            ¿Estás seguro de dar de baja la prueba <strong>"{{ testToDelete?.name }}"</strong> (<code>{{ testToDelete?.code }}</code>)?
          </p>
          <div class="pedagogical-notice">
            <strong>Garantía del histórico:</strong>
            <p>
              El histórico de resultados de los alumnos se conservará íntegro y seguirá siendo consultable. La prueba dejará de mostrarse en las listas activas para nuevos registros.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn btn-secondary"
            :disabled="isDeleting"
            @click="closeDeleteModal"
          >
            Cancelar
          </button>
          <button
            class="btn btn-danger"
            :disabled="isDeleting"
            @click="confirmDelete"
          >
            {{ isDeleting ? 'Procesando...' : 'Confirmar baja' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-list-card {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
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
  padding: 1.5rem 1.75rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}

.search-input {
  padding-left: 2.25rem;
}

.select-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-select {
  width: auto;
  min-width: 140px;
}

.filter-select-sm {
  width: auto;
  min-width: 120px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.825rem;
  color: var(--gray-700);
  cursor: pointer;
  user-select: none;
}

.form-checkbox {
  accent-color: var(--green-600);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.reading-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.font-medium {
  font-weight: 500;
  color: var(--green-950);
}

.text-right {
  text-align: right;
}

.text-muted {
  color: var(--gray-400);
}

.actions-group {
  display: inline-flex;
  gap: 0.35rem;
  justify-content: flex-end;
}

.btn-icon {
  padding: 0.35rem;
  border-radius: var(--radius-sm);
}

.row-disabled {
  opacity: 0.7;
  background-color: var(--gray-50);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--green-100);
  border-top-color: var(--green-600);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin-icon {
  animation: spin 0.8s linear infinite;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--gray-600);
}

.pagination-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(2px);
}

.modal-card {
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border-top: 4px solid var(--danger);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.modal-warning-icon {
  background-color: var(--danger-bg);
  color: var(--danger);
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  font-size: 0.9rem;
  color: var(--gray-700);
  line-height: 1.5;
}

.pedagogical-notice {
  margin-top: 0.85rem;
  background-color: var(--gray-50);
  border-left: 3px solid var(--green-600);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.825rem;
}

.pedagogical-notice p {
  margin-top: 0.25rem;
  color: var(--gray-600);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}
</style>
