<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCenterSections, getCenters } from '@/services/directoryService';

const props = defineProps({
  centerId: { type: String, required: true }
});

const router = useRouter();

const sections = ref([]);
const centerName = ref('');
const loading = ref(false);
const error = ref(null);

const title = computed(() => centerName.value || 'Centro');

async function loadCenter() {
  loading.value = true;
  error.value = null;
  try {
    const [sectionsData, centersData] = await Promise.all([
      getCenterSections(props.centerId),
      getCenters()
    ]);
    sections.value = sectionsData;
    centerName.value = centersData.find(c => c.id === props.centerId)?.name || '';
  } catch (err) {
    error.value = err.message || 'Error al cargar el centro';
    console.error('Error loading center detail:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadCenter);
</script>

<template>
  <div class="center-detail">
    <header class="header">
      <nav class="breadcrumb" aria-label="Migas de pan">
        <router-link :to="{ name: 'centers' }" class="crumb">Centros</router-link>
        <span class="crumb-sep">/</span>
        <span class="crumb current" data-testid="breadcrumb-center">{{ title }}</span>
      </nav>
      <h1>{{ title }}</h1>
      <p class="subtitle">Selecciona una sección para ver su alumnado.</p>
    </header>

    <div v-if="loading" class="state-loading">
      <p>Cargando secciones...</p>
    </div>

    <div v-else-if="error" class="state-error">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="loadCenter">Reintentar</button>
    </div>

    <div v-else-if="sections.length === 0" class="state-empty">
      <p>Este centro no tiene secciones activas.</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Sección</th>
            <th class="col-count">Alumnos matriculados</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in sections" :key="section.id" class="clickable">
            <td>
              <router-link
                :to="{ name: 'section-students', params: { centerId, sectionId: section.id } }"
                class="link-row"
                data-testid="section-link"
              >
                {{ section.name }}
              </router-link>
            </td>
            <td class="col-count">
              <span class="badge badge-count" data-testid="students-count">{{ section.students_count }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="source-note">Los datos de centros, secciones y alumnado proceden de Alexia y son de solo lectura.</p>
  </div>
</template>

<style scoped>
.center-detail {
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

.header h1 {
  margin: 0;
  color: var(--on-surface);
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: var(--on-surface-variant);
  font-size: 0.95rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--on-surface-variant);
}

.crumb {
  color: var(--secondary);
  text-decoration: none;
}

.crumb:hover {
  text-decoration: underline;
}

.crumb.current {
  color: var(--on-surface);
  font-weight: 600;
}

.crumb-sep {
  color: var(--outline);
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

.state-empty p,
.state-loading p,
.state-error p {
  margin: 0;
}

.state-loading p,
.state-error p {
  margin-bottom: 1rem;
}
</style>