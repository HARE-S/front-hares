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
    <!-- Barra superior de pestañas unificadas de Recursos -->
    <div class="resources-nav-bar">
      <div class="resources-nav-pill">
        <button
          type="button"
          class="resources-tab-btn"
          :class="{ active: currentSubTab === 'tests' }"
          @click="setSubTab('tests')"
        >
          <Layers :size="17" />
          <span>Pruebas de Lectura</span>
        </button>

        <button
          type="button"
          class="resources-tab-btn"
          :class="{ active: currentSubTab === 'books' }"
          @click="setSubTab('books')"
        >
          <BookOpen :size="17" />
          <span>Biblioteca de Libros</span>
        </button>
      </div>
    </div>

    <!-- Contenido Activo -->
    <div class="resources-content">
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
    </div>
  </div>
</template>

<style scoped>
.resources-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.resources-nav-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 0.25rem;
}

.resources-nav-pill {
  display: inline-flex;
  background-color: var(--surface-container-high, #e7e8e8);
  padding: 0.3rem;
  border-radius: var(--radius-lg, 12px);
  gap: 0.35rem;
  border: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.08));
}

.resources-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.15rem;
  border-radius: var(--radius-md, 8px);
  border: none;
  background: transparent;
  color: var(--on-surface-variant, #49454f);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.resources-tab-btn:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.04);
  color: var(--on-surface, #1d1b20);
}

.resources-tab-btn.active {
  background-color: var(--surface-container-lowest, #ffffff);
  color: var(--primary, #006699);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.resources-content {
  width: 100%;
}
</style>
