<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getTests, deleteTest } from '../services/testsService';
import { Search, RotateCcw, Trash2, BookText, ChevronLeft, ChevronRight, Layers } from 'lucide-vue-next';

const tests = ref([]);
const total = ref(0);
const page = ref(1);
const pages = ref(1);
const limit = ref(10);
const isLoading = ref(false);
const actionError = ref('');
const actionSuccess = ref('');

const filters = reactive({
  search: '',
  course: '',
  type: ''
});

async function fetchTests() {
  isLoading.value = true;
  actionError.value = '';
  try {
    const res = await getTests({
      filter: filters.search.trim() || undefined,
      course: filters.course !== '' ? filters.course : undefined,
      type: filters.type || undefined,
      page: page.value,
      limit: limit.value
    });

    tests.value = res.items || [];
    total.value = res.total || 0;
    pages.value = res.pages || 1;
    page.value = res.page || 1;
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
  filters.type = '';
  page.value = 1;
  fetchTests();
}

function goToPage(newPage) {
  if (newPage >= 1 && newPage <= pages.value) {
    page.value = newPage;
    fetchTests();
  }
}

async function handleDelete(test) {
  if (!confirm(`¿Confirmas dar de baja lógica la prueba "${test.name}" (${test.code})?`)) {
    return;
  }

  actionError.value = '';
  actionSuccess.value = '';

  try {
    await deleteTest(test.id);
    actionSuccess.value = `Prueba "${test.code}" dada de baja correctamente.`;
    await fetchTests();
  } catch (err) {
    actionError.value = err.message || 'Error al eliminar la prueba.';
  }
}

onMounted(() => {
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
          <Layers :size="20" class="text-green-700" />
        </div>
        <div>
          <h2>Catálogo de Pruebas de Lectura</h2>
          <p class="subtitle">Listado de textos registrados con filtros y paginación en tiempo real</p>
        </div>
      </div>
      <div class="header-actions">
        <span class="badge badge-green">{{ total }} pruebas registradas</span>
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

    <!-- Alertas de estado de acción -->
    <div v-if="actionSuccess" class="alert alert-success">
      <span>{{ actionSuccess }}</span>
    </div>
    <div v-if="actionError" class="alert alert-danger">
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
          @keyup.enter="handleFilterChange"
        />
      </div>

      <div class="select-filters">
        <select
          v-model="filters.course"
          class="form-select filter-select"
          @change="handleFilterChange"
        >
          <option value="">Todos los cursos</option>
          <option :value="0">Curso 0</option>
          <option :value="1">Curso 1º</option>
          <option :value="2">Curso 2º</option>
          <option :value="3">Curso 3º</option>
          <option :value="4">Curso 4º</option>
          <option :value="5">Curso 5º</option>
          <option :value="6">Curso 6º</option>
        </select>

        <select
          v-model="filters.type"
          class="form-select filter-select"
          @change="handleFilterChange"
        >
          <option value="">Todos los tipos</option>
          <option value="F">Funcional (F)</option>
          <option value="L">Literario (L)</option>
        </select>

        <button
          v-if="filters.search || filters.course !== '' || filters.type"
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
      <p>Cargando pruebas desde el backend...</p>
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
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="test in tests" :key="test.id">
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
              <span v-if="test.type === 'F'" class="badge badge-green" title="Texto Funcional">Funcional</span>
              <span v-else-if="test.type === 'L'" class="badge badge-emerald" title="Texto Literario">Literario</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <span v-if="test.disabled_at" class="badge badge-danger">Deshabilitada</span>
              <span v-else class="badge badge-green">Activa</span>
            </td>
            <td class="text-right">
              <button
                class="btn btn-danger-outline btn-icon"
                title="Baja lógica de la prueba"
                @click="handleDelete(test)"
              >
                <Trash2 :size="15" />
              </button>
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
</template>

<style scoped>
.test-list-card {
  max-width: 1040px;
  margin: 0 auto;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.icon-box {
  background-color: var(--green-100);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
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
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 240px;
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
}

.filter-select {
  width: auto;
  min-width: 150px;
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

.btn-icon {
  padding: 0.35rem;
  border-radius: var(--radius-sm);
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
</style>
