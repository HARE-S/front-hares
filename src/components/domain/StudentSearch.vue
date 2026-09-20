<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Search, X, Loader2 } from 'lucide-vue-next';
import { searchStudents } from '@/services/studentService';

/**
 * Buscador de alumnos (FE-27).
 * - Resultados a los 2 caracteres, sin mínimo de tres (Escenario 1).
 * - Control de frecuencia: espera a que el usuario deje de escribir (Escenario 6).
 * - Cada resultado muestra centro y sección (Escenario 3).
 * - Navegación con teclado: flechas, Enter y Escape.
 * - "Sin coincidencias" cuando no hay resultados (Escenario 5).
 */

const props = defineProps({
  minChars: {
    type: Number,
    default: 2
  },
  debounceMs: {
    type: Number,
    default: 300
  },
  limit: {
    type: Number,
    default: 8
  }
});

const router = useRouter();

const root = ref(null);
const query = ref('');
const results = ref([]);
const loading = ref(false);
const searched = ref(false);
const open = ref(false);
const activeIndex = ref(-1);

let debounceTimer = null;
let requestSeq = 0;

function closePanel() {
  open.value = false;
  activeIndex.value = -1;
}

async function runSearch() {
  const term = query.value.trim();
  if (term.length < props.minChars) {
    results.value = [];
    searched.value = false;
    closePanel();
    return;
  }

  loading.value = true;
  const seq = ++requestSeq;

  try {
    const data = await searchStudents({ q: term, limit: props.limit });
    if (seq !== requestSeq) return;
    results.value = data?.items || [];
    searched.value = true;
    open.value = true;
    activeIndex.value = results.value.length ? 0 : -1;
  } catch (err) {
    if (seq !== requestSeq) return;
    results.value = [];
    searched.value = true;
    open.value = true;
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
    }
  }
}

watch(query, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runSearch, props.debounceMs);
});

function handleKeydown(event) {
  const list = results.value;
  if (!open.value) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (list.length) activeIndex.value = (activeIndex.value + 1) % list.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (list.length) activeIndex.value = (activeIndex.value - 1 + list.length) % list.length;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (list.length && activeIndex.value >= 0) {
      navigate(list[activeIndex.value]);
    }
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closePanel();
  }
}

function navigate(item) {
  const section = item.sections && item.sections[0];
  if (!section) return;
  closePanel();
  router.push({
    name: 'student-detail',
    params: {
      centerId: section.center_id,
      sectionId: section.id,
      studentId: item.id
    }
  });
}

function clearSearch() {
  query.value = '';
  results.value = [];
  searched.value = false;
  closePanel();
}

function handleDocClick(event) {
  if (root.value && !root.value.contains(event.target)) {
    closePanel();
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocClick);
});

onBeforeUnmount(() => {
  clearTimeout(debounceTimer);
  document.removeEventListener('mousedown', handleDocClick);
});
</script>

<template>
  <div ref="root" class="student-search">
    <div class="search-box">
      <Search :size="18" class="search-icon" aria-hidden="true" />
      <input
        v-model="query"
        type="text"
        class="search-input"
        placeholder="Buscar alumno por nombre…"
        aria-label="Buscar alumno por su nombre"
        data-testid="search-input"
        @keydown="handleKeydown"
      />
      <button
        v-if="query"
        type="button"
        class="search-clear"
        aria-label="Borrar búsqueda"
        data-testid="search-clear"
        @click="clearSearch"
      >
        <X :size="16" aria-hidden="true" />
      </button>
    </div>

    <div v-if="open" class="search-panel" data-testid="search-panel">
      <div v-if="loading" class="search-state">
        <Loader2 :size="16" class="spin" aria-hidden="true" />
        Buscando…
      </div>

      <ul v-else-if="results.length" class="search-results">
        <li
          v-for="(item, index) in results"
          :key="item.id"
          class="search-result"
          :class="{ 'search-result--active': index === activeIndex }"
          data-testid="search-item"
          @mouseenter="activeIndex = index"
          @mousedown.prevent="navigate(item)"
        >
          <div class="result-name">{{ item.name }}</div>
          <div v-for="section in item.sections" :key="section.id" class="result-meta">
            {{ section.name }} · {{ section.center }}
          </div>
        </li>
      </ul>

      <div v-else-if="searched" class="search-state" data-testid="search-empty">
        Sin coincidencias para tu búsqueda.
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-search {
  position: relative;
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  padding: 0 0.75rem;
  transition: var(--transition-normal);
}

.search-box:focus-within {
  border-color: var(--secondary);
  box-shadow: 0 0 0 3px var(--level-normal-border);
}

.search-icon {
  color: var(--on-surface-variant);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0.6rem 0;
  font-size: 0.95rem;
  color: var(--on-surface);
}

.search-input::placeholder {
  color: var(--on-surface-variant);
}

.search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--on-surface-variant);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-full);
}

.search-clear:hover {
  color: var(--on-surface);
  background-color: var(--surface-container-high);
}

.search-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  z-index: 30;
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.search-results {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
}

.search-result {
  padding: 0.6rem 0.9rem;
  cursor: pointer;
}

.search-result--active,
.search-result:hover {
  background-color: var(--surface-container-low);
}

.result-name {
  font-weight: 600;
  color: var(--on-surface);
  font-size: 0.92rem;
}

.result-meta {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  margin-top: 0.15rem;
}

.search-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
}

.spin {
  animation: search-spin 0.8s linear infinite;
}

@keyframes search-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>