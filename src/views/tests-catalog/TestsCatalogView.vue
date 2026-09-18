<script setup>
import { ref, nextTick } from 'vue';
import TestList from '@/components/TestList.vue';
import TestForm from '@/components/TestForm.vue';
import { PlusCircle, ArrowLeft, CheckCircle2, BookOpen } from 'lucide-vue-next';

const props = defineProps({
  userRole: {
    type: String,
    default: 'coordinator' // 'coordinator' | 'tutor' | 'admin'
  }
});

const viewMode = ref('list'); // 'list' | 'form'
const testToEdit = ref(null);
const testListRef = ref(null);
const toastMessage = ref('');
let toastTimeout = null;

function showToast(msg) {
  toastMessage.value = msg;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMessage.value = '';
  }, 4500);
}

function openCreate() {
  testToEdit.value = null;
  viewMode.value = 'form';
}

function handleEditTest(test) {
  testToEdit.value = test;
  viewMode.value = 'form';
}

function handleCancelEdit() {
  testToEdit.value = null;
  viewMode.value = 'list';
}

async function handleTestCreated(newTest) {
  showToast(`Prueba "${newTest.name}" (${newTest.code}) dada de alta correctamente.`);
  testToEdit.value = null;
  viewMode.value = 'list';
  await nextTick();
  if (testListRef.value?.refresh) {
    testListRef.value.refresh();
  }
}

async function handleTestUpdated(updatedTest) {
  showToast(`Prueba "${updatedTest.name}" (${updatedTest.code}) actualizada correctamente.`);
  testToEdit.value = null;
  viewMode.value = 'list';
  await nextTick();
  if (testListRef.value?.refresh) {
    testListRef.value.refresh();
  }
}

defineExpose({
  openCreate,
  handleEditTest,
  refreshList: () => testListRef.value?.refresh?.()
});
</script>

<template>
  <div class="tests-catalog-view">
    <!-- Cabecera de la Vista -->
    <header class="view-header">
      <div class="header-titles">
        <div class="title-badge-row">
          <h1 class="page-title">
            {{ viewMode === 'form' ? (testToEdit ? 'Editar Prueba de Lectura' : 'Nueva Prueba de Lectura') : 'Catálogo de Pruebas de Lectura' }}
          </h1>
          <span class="center-badge">Fondo Peñascal</span>
        </div>
        <p class="page-subtitle">
          {{ viewMode === 'form'
            ? (testToEdit
              ? 'Modifica los metadatos de la prueba. Si ya tiene histórico de resultados, el código permanecerá bloqueado.'
              : 'Registra un nuevo texto de control estandarizado especificando palabras, curso y tipología textual.')
            : 'Textos de control estandarizados para las evaluaciones periódicas de velocidad y comprensión lectora.' }}
        </p>
      </div>

      <!-- Acciones de cabecera -->
      <div class="header-actions">
        <button
          v-if="viewMode === 'form'"
          type="button"
          class="btn btn-secondary back-btn"
          @click="handleCancelEdit"
        >
          <ArrowLeft :size="18" />
          <span>Volver al Catálogo</span>
        </button>

        <button
          v-else-if="userRole !== 'tutor'"
          type="button"
          class="btn btn-primary create-btn"
          data-testid="create-test-btn"
          @click="openCreate"
        >
          <PlusCircle :size="18" />
          <span>Nueva Prueba</span>
        </button>
      </div>
    </header>

    <!-- Toast Notification Banner -->
    <transition name="fade">
      <div v-if="toastMessage" class="toast-banner" role="status">
        <CheckCircle2 :size="18" class="toast-icon" />
        <span class="toast-text">{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- Área de Contenido: Listado o Formulario -->
    <main class="catalog-content">
      <transition name="view-switch" mode="out-in">
        <section v-if="viewMode === 'form'" key="form" class="form-container">
          <TestForm
            :test-to-edit="testToEdit"
            :user-role="userRole"
            @test-created="handleTestCreated"
            @test-updated="handleTestUpdated"
            @cancel-edit="handleCancelEdit"
          />
        </section>

        <section v-else key="list" class="list-container">
          <TestList
            ref="testListRef"
            :user-role="userRole"
            @edit-test="handleEditTest"
          />
        </section>
      </transition>
    </main>
  </div>
</template>

<style scoped>
.tests-catalog-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 1.5rem);
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

/* Header */
.view-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
  padding-bottom: var(--space-4, 1rem);
  border-bottom: 1px solid var(--border-light, #e2e8f0);
}

@media (min-width: 768px) {
  .view-header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}

.title-badge-row {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: var(--text-2xl, 1.5rem);
  font-weight: 700;
  color: var(--green-950, #062b1b);
  letter-spacing: -0.02em;
}

.center-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  background-color: var(--green-50, #f0fdf4);
  color: var(--green-800, #166534);
  border: 1px solid var(--green-200, #bbf7d0);
  border-radius: 9999px;
  font-size: var(--text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.page-subtitle {
  margin: var(--space-2, 0.5rem) 0 0 0;
  font-size: var(--text-sm, 0.875rem);
  color: var(--gray-600, #4b5563);
  max-width: 700px;
  line-height: 1.5;
}

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 1.25rem;
  font-size: var(--text-sm, 0.875rem);
  font-weight: 600;
  border-radius: var(--radius-md, 0.375rem);
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--green-700, #15803d);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: var(--green-800, #166534);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn-secondary {
  background-color: #ffffff;
  color: var(--gray-700, #374151);
  border-color: var(--gray-300, #d1d5db);
}

.btn-secondary:hover {
  background-color: var(--gray-50, #f9fafb);
  border-color: var(--gray-400, #9ca3af);
}

/* Toast */
.toast-banner {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  padding: 0.75rem 1rem;
  background-color: var(--green-50, #f0fdf4);
  border: 1px solid var(--green-300, #86efac);
  border-radius: var(--radius-md, 0.375rem);
  color: var(--green-900, #14532d);
  font-size: var(--text-sm, 0.875rem);
  box-shadow: 0 2px 6px rgba(22, 101, 52, 0.08);
}

.toast-icon {
  color: var(--green-700, #15803d);
  flex-shrink: 0;
}

.toast-text {
  font-weight: 500;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.view-switch-enter-active,
.view-switch-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.view-switch-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.view-switch-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
