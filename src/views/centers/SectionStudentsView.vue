<script setup>
import { ref, onMounted } from 'vue';
import { getSectionStudents, getCenterSections, getCenters } from '@/services/directoryService';

const props = defineProps({
  centerId: { type: String, required: true },
  sectionId: { type: String, required: true }
});

const students = ref([]);
const centerName = ref('');
const sectionName = ref('');
const loading = ref(false);
const error = ref(null);

async function loadSection() {
  loading.value = true;
  error.value = null;
  try {
    const [studentsData, sectionsData, centersData] = await Promise.all([
      getSectionStudents(props.sectionId),
      getCenterSections(props.centerId),
      getCenters()
    ]);
    students.value = studentsData;
    sectionName.value = sectionsData.find(s => s.id === props.sectionId)?.name || '';
    centerName.value = centersData.find(c => c.id === props.centerId)?.name || '';
  } catch (err) {
    error.value = err.message || 'Error al cargar la sección';
    console.error('Error loading section students:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadSection);
</script>

<template>
  <div class="section-students">
    <header class="header">
      <nav class="breadcrumb" aria-label="Migas de pan">
        <router-link :to="{ name: 'centers' }" class="crumb">Centros</router-link>
        <span class="crumb-sep">/</span>
        <router-link
          :to="{ name: 'center-detail', params: { centerId } }"
          class="crumb"
          data-testid="breadcrumb-center"
        >
          {{ centerName || 'Centro' }}
        </router-link>
        <span class="crumb-sep">/</span>
        <span class="crumb current" data-testid="breadcrumb-section">{{ sectionName || 'Sección' }}</span>
      </nav>
      <h1>{{ sectionName || 'Sección' }}</h1>
      <p class="subtitle">Alumnado matriculado en esta sección.</p>
    </header>

    <div v-if="loading" class="state-loading">
      <p>Cargando alumnado...</p>
    </div>

    <div v-else-if="error" class="state-error">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="loadSection">Reintentar</button>
    </div>

    <div v-else-if="students.length === 0" class="state-empty" data-testid="empty-section">
      <p>Esta sección no tiene alumnado matriculado.</p>
      <p class="empty-hint">
        Puede deberse a que la importación del volcado de Alexia para este curso aún no se ha realizado.
      </p>
    </div>

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Alumno</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id" class="clickable">
            <td>
              <router-link
                :to="{ name: 'student-detail', params: { centerId, sectionId, studentId: student.id } }"
                class="link-row"
                data-testid="student-link"
              >
                {{ student.name }}
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="source-note">Los datos de centros, secciones y alumnado proceden de Alexia y son de solo lectura.</p>
  </div>
</template>

<style scoped>
.section-students {
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

.link-row {
  color: var(--secondary);
  font-weight: 600;
  text-decoration: none;
}

.link-row:hover {
  text-decoration: underline;
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

.state-empty .empty-hint {
  margin: 0.75rem 0 0;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
}

.state-loading p,
.state-error p,
.state-empty p {
  margin: 0;
}

.state-loading p,
.state-error p {
  margin-bottom: 1rem;
}
</style>