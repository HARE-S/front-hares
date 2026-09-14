<script setup>
import { ref } from 'vue';
import TestForm from './components/TestForm.vue';
import TestList from './components/TestList.vue';
import { BookOpen, ListFilter, PlusCircle, CheckCircle2 } from 'lucide-vue-next';

const currentTab = ref('catalog'); // 'catalog' | 'new-test'
const testListRef = ref(null);
const lastCreatedNotification = ref(null);

function handleTestCreated(newTest) {
  lastCreatedNotification.value = newTest;
  // Refrescar el listado y conmutar a la vista de catálogo
  if (testListRef.value) {
    testListRef.value.refresh();
  }
  currentTab.value = 'catalog';

  setTimeout(() => {
    lastCreatedNotification.value = null;
  }, 6000);
}
</script>

<template>
  <div class="app-layout">
    <!-- Barra Superior de Navegación (Plano Verde y Blanco) -->
    <header class="app-header">
      <div class="header-container">
        <div class="brand-group">
          <div class="brand-badge">
            <BookOpen :size="20" class="brand-icon" />
          </div>
          <div>
            <h1 class="brand-title">HARE-S</h1>
            <span class="brand-tag">Batería de Lectura Eficaz · Peñascal</span>
          </div>
        </div>

        <!-- Pestañas de Navegación Planas -->
        <nav class="nav-tabs">
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'catalog' }"
            @click="currentTab = 'catalog'"
          >
            <ListFilter :size="17" />
            <span>Catálogo de Pruebas</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'new-test' }"
            @click="currentTab = 'new-test'"
          >
            <PlusCircle :size="17" />
            <span>Dar de Alta Prueba</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="app-main">
      <div class="main-container">
        <!-- Notificación tras crear prueba y conmutar de vista -->
        <div v-if="lastCreatedNotification && currentTab === 'catalog'" class="alert alert-success toast-banner">
          <CheckCircle2 :size="18" />
          <span>
            Prueba <strong>{{ lastCreatedNotification.name }}</strong> (<code>{{ lastCreatedNotification.code }}</code>) registrada correctamente en el backend.
          </span>
        </div>

        <!-- Vistas -->
        <transition name="fade" mode="out-in">
          <TestList
            v-if="currentTab === 'catalog'"
            ref="testListRef"
            key="catalog"
          />
          <TestForm
            v-else-if="currentTab === 'new-test'"
            key="new-test"
            @test-created="handleTestCreated"
          />
        </transition>
      </div>
    </main>

    <!-- Pie de página plano -->
    <footer class="app-footer">
      <p>HARE-S Frontend · Vue 3 + Vite · Conectado al backend Flask (Puerto 5000)</p>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: var(--white);
  border-bottom: 2px solid var(--green-600);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.brand-badge {
  background-color: var(--green-700);
  color: var(--white);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-title {
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  color: var(--green-950);
}

.brand-tag {
  font-size: 0.75rem;
  color: var(--gray-500);
  display: block;
}

.nav-tabs {
  display: flex;
  gap: 0.5rem;
  background-color: var(--gray-100);
  padding: 0.25rem;
  border-radius: var(--radius-md);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.tab-btn:hover {
  color: var(--green-900);
}

.tab-btn.active {
  background-color: var(--white);
  color: var(--green-850);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.app-main {
  flex: 1;
  padding: 2rem 1.5rem;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
}

.toast-banner {
  margin-bottom: 1.5rem;
}

.app-footer {
  text-align: center;
  padding: 1.5rem;
  font-size: 0.8rem;
  color: var(--gray-500);
  border-top: 1px solid var(--gray-200);
  background-color: var(--white);
}

/* Transición suave entre pestañas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }
  .nav-tabs {
    width: 100%;
  }
  .tab-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
