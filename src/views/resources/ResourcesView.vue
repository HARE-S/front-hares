<script setup>
import { ref, watch, nextTick } from 'vue';
import { Layers, BookOpen } from 'lucide-vue-next';
import TestsCatalogView from '@/views/tests-catalog/TestsCatalogView.vue';
import BooksCatalogView from '@/views/books-catalog/BooksCatalogView.vue';

const props = defineProps({
  userRole: {
    type: String,
    default: 'coordinator'
  },
  course: {
    type: String,
    default: '2024-25'
  },
  initialSubTab: {
    type: String,
    default: 'tests' // 'tests' | 'books'
  }
});

const emit = defineEmits(['update:subTab']);

const currentSubTab = ref(props.initialSubTab === 'books' ? 'books' : 'tests');
const testsCatalogRef = ref(null);
const booksCatalogRef = ref(null);

watch(
  () => props.initialSubTab,
  (newTab) => {
    if (newTab) {
      currentSubTab.value = newTab === 'books' ? 'books' : 'tests';
    }
  }
);

function setSubTab(tab) {
  currentSubTab.value = tab;
  emit('update:subTab', tab);
}

async function openCreate() {
  currentSubTab.value = 'tests';
  await nextTick();
  testsCatalogRef.value?.openCreate?.();
}

defineExpose({
  openCreate,
  setSubTab,
  currentSubTab
});
</script>

<template>
  <div class="resources-view">
    <!-- Barra superior de Recursos: selector limpio y esbelto -->
    <div class="resources-nav-bar">
      <nav class="resources-nav-pill" aria-label="Secciones de Recursos">
        <button
          type="button"
          class="resources-tab-btn"
          :class="{ active: currentSubTab === 'tests' }"
          @click="setSubTab('tests')"
        >
          <Layers :size="15" />
          <span>Pruebas de Lectura</span>
        </button>

        <button
          type="button"
          class="resources-tab-btn"
          :class="{ active: currentSubTab === 'books' }"
          @click="setSubTab('books')"
        >
          <BookOpen :size="15" />
          <span>Biblioteca de Libros</span>
        </button>
      </nav>
    </div>

    <!-- Contenido Activo -->
    <main class="resources-content">
      <TestsCatalogView
        v-if="currentSubTab === 'tests'"
        ref="testsCatalogRef"
        :user-role="userRole"
        :course="course"
      />
      <BooksCatalogView
        v-else
        ref="booksCatalogRef"
        :user-role="userRole"
        :course="course"
      />
    </main>
  </div>
</template>

<style scoped>
.resources-view {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.resources-nav-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 0.15rem;
}

.resources-nav-pill {
  display: inline-flex;
  background-color: var(--surface-container-high, #f1f5f9);
  padding: 0.2rem;
  border-radius: var(--radius-md, 8px);
  gap: 0.2rem;
  border: 1px solid var(--outline-variant, #e2e8f0);
}

.resources-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--on-surface-variant, #64748b);
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.resources-tab-btn:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.03);
  color: var(--on-surface, #0f172a);
}

.resources-tab-btn.active {
  background-color: #ffffff;
  color: var(--primary, #006699);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.resources-content {
  width: 100%;
}
</style>
