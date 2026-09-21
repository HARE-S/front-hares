<script setup>
import { ref, onMounted } from 'vue';
import { getCenters } from '@/services/directoryService';
import StudentSearch from '@/components/domain/StudentSearch.vue';

const centers = ref([]);
const loading = ref(false);
const error = ref(null);

async function loadCenters() {
  loading.value = true;
  error.value = null;
  try {
    centers.value = await getCenters();
  } catch (err) {
    error.value = err.message || 'Error al cargar los centros';
    console.error('Error loading centers:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadCenters);
</script>

<template>
  <div class="centers-list">
    <header class="header">
      <nav class="breadcrumb" aria-label="Migas de pan">
        <span class="crumb current">Centros</span>
      </nav>
      <div class="header-row">
        <div class="header-text">
          <h1>Centros</h1>
          <p class="subtitle">Selecciona un centro para ver sus secciones y su alumnado.</p>
        </div>
        <router-link
          :to="{ name: 'comparison' }"
          class="btn btn-secondary"
          data-testid="comparison-entry"
        >
          Comparativa por grupos
        </router-link>
      </div>
    </header>

    <div class="search-bar">
      <StudentSearch data-testid="student-search" />
    </div>

    <div v-if="loading" class="state-loading">
      <p>Cargando centros...</p>
    </div>

    <div v-else-if="error" class="state-error">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="loadCenters">Reintentar</button>
    </div>

    <div v-else-if="centers.length === 0" class="state-empty">
      <p>No hay centros activos.</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Centro</th>
            <th class="col-count">Secciones activas</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="center in centers"
            :key="center.id"
            class="clickable"
            data-testid="center-row"
          >
            <td>
              <router-link
                :to="{ name: 'center-detail', params: { centerId: center.id } }"
                class="link-row"
                data-testid="center-link"
              >
                {{ center.name }}
              </router-link>
            </td>
            <td class="col-count">
              <span class="badge badge-count" title="N.º de secciones activas del centro">{{ center.sections_count }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="source-note">Los datos de centros, secciones y alumnado proceden de Alexia y son de solo lectura.</p>
  </div>
</template>

<style scoped>
.centers-list {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.header-text h1 {
  margin: 0;
  color: var(--on-surface);
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: var(--on-surface-variant);
  font-size: 0.95rem;
}

.search-bar {
  max-width: 480px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--on-surface-variant);
}

.crumb.current {
  color: var(--secondary);
  font-weight: 600;
}

.table-wrapper {
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th, td {
  padding: 0.9rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid var(--outline-variant);
}

th {
  background-color: var(--surface-container-low);
  font-weight: 600;
  color: var(--on-surface);
  font-size: 0.8rem;
  text-transform: uppercase;
}

tr:last-child td {
  border-bottom: none;
}

tr.clickable:hover td {
  background-color: var(--surface-container-low);
}

.col-count {
  width: 140px;
}

.link-row {
  color: var(--secondary);
  font-weight: 600;
  text-decoration: none;
}

.link-row:hover {
  text-decoration: underline;
}

.badge-count {
  display: inline-block;
  min-width: 2rem;
  text-align: center;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background-color: var(--surface-container-high);
  color: var(--on-surface-variant);
}

.source-note {
  margin: 0;
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  font-style: italic;
}

.state-loading,
.state-error,
.state-empty {
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
  color: var(--on-surface-variant);
}

.state-error {
  background-color: var(--danger-bg);
  border-color: var(--danger-border);
  color: var(--danger-text);
}

.state-empty p {
  margin: 0;
}

.state-loading p,
.state-error p {
  margin: 0 0 1rem 0;
}
</style>