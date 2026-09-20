<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getStudentRecord } from '@/services/studentService';
import StateBlock from '@/components/ui/StateBlock.vue';
import MetricCard from '@/components/domain/MetricCard.vue';
import EvolutionChart from '@/components/charts/EvolutionChart.vue';
import RegisterResultModal from '@/components/results/RegisterResultModal.vue';
import { PlusCircle } from 'lucide-vue-next';
import { classifyVefBand, VEF_BAND_LABELS, vefBandClass } from '@/utils/bands';

const route = useRoute();

const studentId = computed(() => route.params.studentId);
const loading = ref(false);
const error = ref(null);
const forbidden = ref(false);
const showRegisterModal = ref(false);

const studentData = ref(null);

const currentSections = computed(() => studentData.value?.current_sections || []);
const historicalSections = computed(() => studentData.value?.historical_sections || []);
const results = computed(() => studentData.value?.results || []);
const readings = computed(() => studentData.value?.readings || []);

const currentSectionNames = computed(() => currentSections.value.map(section => section.name));
const firstSectionId = computed(() => currentSections.value[0]?.id || null);
const hasCurrentSection = computed(() => Boolean(firstSectionId.value));

const averagePPM = computed(() => {
  if (!results.value.length) return '—';
  const total = results.value.reduce((sum, result) => sum + (Number(result.ppm) || 0), 0);
  return Math.round(total / results.value.length);
});

const averageVEF = computed(() => {
  if (!results.value.length) return '—';
  const total = results.value.reduce((sum, result) => sum + (Number(result.vef) || 0), 0);
  return Math.round(total / results.value.length);
});

const evolutionData = computed(() =>
  results.value.map(result => ({
    date: result.test_date || '',
    ppm: result.ppm,
    vef: result.vef
  }))
);

function bandOf(result) {
  return classifyVefBand(result?.vef);
}

async function loadStudentRecord() {
  loading.value = true;
  error.value = null;
  forbidden.value = false;

  try {
    studentData.value = await getStudentRecord(studentId.value);
  } catch (err) {
    if (err.status === 403) {
      forbidden.value = true;
    } else {
      error.value = err;
    }
  } finally {
    loading.value = false;
  }
}

function handleResultSaved() {
  showRegisterModal.value = false;
  loadStudentRecord();
}

onMounted(() => {
  loadStudentRecord();
});
</script>

<template>
  <div class="student-detail">
    <!-- Carga (Escenario 1) -->
    <StateBlock v-if="loading" state="loading" skeleton="detail" />

    <!-- Acceso denegado (Escenario 6: no se filtra ningún dato) -->
    <StateBlock
      v-else-if="forbidden"
      state="forbidden"
      title="Acceso denegado"
      message="No tienes permiso para consultar la ficha de este alumno."
    />

    <!-- Alumno inexistente -->
    <StateBlock v-else-if="error && error.status === 404" state="notfound" />

    <!-- Error genérico -->
    <StateBlock
      v-else-if="error"
      state="error"
      :message="error.message || 'No se pudo cargar la ficha del alumno'"
      @retry="loadStudentRecord"
    />

    <template v-else-if="studentData">
      <!-- Cabecera con datos personales y resumen -->
      <div class="student-header">
        <div class="header-info">
          <h1 data-testid="student-name">{{ studentData.name }}</h1>
          <div class="header-meta">
            <span v-if="studentData.age != null" class="meta-item">{{ studentData.age }} años</span>
            <span v-if="studentData.external_id" class="meta-item">Expediente {{ studentData.external_id }}</span>
            <span v-if="currentSectionNames.length" class="meta-item">
              {{ currentSectionNames.join(', ') }}
            </span>
          </div>
          <div v-if="hasCurrentSection" class="header-actions">
            <button
              type="button"
              class="btn btn-primary"
              data-testid="open-register-test-btn"
              @click="showRegisterModal = true"
            >
              <PlusCircle :size="16" aria-hidden="true" />
              <span>Registrar Prueba</span>
            </button>
          </div>
        </div>
        <div class="header-stats">
          <MetricCard title="PPM media" :value="averagePPM" subtext="Velocidad espontánea" />
          <MetricCard title="VEF media" :value="averageVEF" subtext="Velocidad eficaz" />
          <MetricCard title="Pruebas" :value="studentData.total_results ?? results.length" />
          <MetricCard title="Lecturas" :value="studentData.total_readings ?? readings.length" />
        </div>
      </div>

      <!-- Secciones actuales e históricas (Escenario 4) -->
      <div class="card">
        <h2>Secciones</h2>
        <template v-if="currentSections.length || historicalSections.length">
          <div v-if="currentSections.length" class="section-group">
            <h3 class="group-title">Actuales</h3>
            <div class="section-list">
              <div v-for="section in currentSections" :key="section.id" class="section-item">
                <div class="section-name">{{ section.name }}</div>
                <div class="section-teacher">
                  Curso {{ section.academic_year }}
                  <template v-if="section.enrollment_date"> · desde {{ section.enrollment_date }}</template>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="explained-empty">
            Sin secciones actuales. El alumno aún no está asignado a un grupo este curso.
          </div>

          <div v-if="historicalSections.length" class="section-group">
            <h3 class="group-title">Anteriores</h3>
            <div class="section-list">
              <div v-for="section in historicalSections" :key="section.id" class="section-item section-item--historical">
                <div class="section-name">
                  {{ section.name }} <span class="section-year">({{ section.academic_year }})</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="explained-empty">Sin secciones anteriores.</div>
        </template>
        <div v-else class="explained-empty">El alumno no tiene secciones asignadas.</div>
      </div>

      <!-- Evolución de velocidad lectora (Escenario 1) -->
      <div class="card">
        <div class="chart-header">
          <h2>Evolución de Velocidad Lectora</h2>
          <p class="chart-description">Progresión de PPM y VEF a lo largo del tiempo.</p>
        </div>
        <EvolutionChart
          v-if="results.length"
          :student-name="studentData.name"
          :data="evolutionData"
          data-testid="evolution-chart"
        />
        <div v-else class="explained-empty">
          Sin resultados suficientes para dibujar la evolución. Aparecerá aquí cuando el alumno
          realice su primera prueba.
        </div>
      </div>

      <!-- Histórico de pruebas con las tres métricas y su banda (Escenario 3) -->
      <div class="card">
        <h2>Histórico de Pruebas</h2>
        <div v-if="results.length" class="table-wrapper">
          <table class="tests-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Prueba</th>
                <th>Vel. Espontánea</th>
                <th>Comprensión</th>
                <th>Vel. Eficaz</th>
                <th>Banda</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in results" :key="result.id" data-testid="result-row">
                <td>{{ result.test_date }}</td>
                <td>{{ result.test_name }}</td>
                <td>{{ result.ppm != null ? result.ppm : '—' }}</td>
                <td>{{ result.comprehension != null ? `${result.comprehension}%` : '—' }}</td>
                <td>{{ result.vef != null ? result.vef : '—' }}</td>
                <td>
                  <span class="badge" :class="vefBandClass(bandOf(result))">
                    {{ VEF_BAND_LABELS[bandOf(result)] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="explained-empty">
          Sin pruebas registradas. Al registrar la primera prueba se mostrará aquí su histórico
          con las tres métricas.
        </div>
      </div>

      <!-- Lecturas con su estado (Escenario 1) -->
      <div class="card">
        <h2>Lecturas</h2>
        <div v-if="readings.length" class="table-wrapper">
          <table class="books-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Nivel</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reading in readings" :key="reading.id" data-testid="reading-row">
                <td><strong>{{ reading.book_title || reading.title }}</strong></td>
                <td>{{ reading.level || reading.book_level || '—' }}</td>
                <td>{{ reading.start_date }}</td>
                <td>{{ reading.end_date || '—' }}</td>
                <td>
                  <span
                    class="badge"
                    :class="reading.status === 'finalizada' ? 'badge-finalizada' : 'badge-en-curso'"
                  >
                    {{ reading.status === 'finalizada' ? 'Finalizada' : 'En curso' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="explained-empty">
          Sin lecturas asignadas. Cuando se asigne un libro al alumno aparecerá aquí su
          progreso.
        </div>
      </div>
    </template>

    <!-- Sin ficha -->
    <StateBlock v-else state="empty" title="Sin ficha" message="No hay información disponible para este alumno.">
      <button class="btn btn-secondary" @click="loadStudentRecord">Recargar</button>
    </StateBlock>

    <!-- Modal de registro de prueba (FE-18) -->
    <RegisterResultModal
      v-if="studentData && showRegisterModal"
      :is-open="showRegisterModal"
      :student-id="studentData.id"
      :student-name="studentData.name"
      :section-id="firstSectionId"
      @close="showRegisterModal = false"
      @saved="handleResultSaved"
    />
  </div>
</template>

<style scoped>
.student-detail {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

/* Cabecera del alumno */
.student-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.header-info h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 0.75rem 0;
}

.header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
}

.meta-item {
  font-size: 0.95rem;
  color: var(--on-surface-variant);
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

/* Cards */
.card {
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.card h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 1rem 0;
  border-bottom: 2px solid var(--outline-variant);
  padding-bottom: 0.5rem;
}

.explained-empty {
  padding: 1.25rem;
  border: 1px dashed var(--outline-variant);
  border-radius: var(--radius-md);
  color: var(--on-surface-variant);
  font-size: 0.9rem;
  font-style: italic;
  background-color: var(--surface-container-low);
}

/* Secciones */
.section-group {
  margin-bottom: 1.25rem;
}

.section-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-item {
  background-color: var(--surface-container-low);
  border-left: 4px solid var(--green-500);
  padding: 0.75rem;
  border-radius: var(--radius-md);
}

.section-item--historical {
  border-left-color: var(--outline);
}

.section-name {
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: 0.25rem;
}

.section-year {
  font-size: 0.85rem;
  color: var(--on-surface-variant);
  font-weight: 400;
}

.section-teacher {
  font-size: 0.85rem;
  color: var(--on-surface-variant);
}

/* Gráficos */
.chart-header {
  margin-bottom: 1rem;
}

.chart-description {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  margin-top: 0.5rem;
}

/* Tablas */
.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--outline-variant);
}

th {
  background-color: var(--surface-container-low);
  font-weight: 600;
  color: var(--on-surface);
  font-size: 0.8rem;
}

tr:hover {
  background-color: var(--surface-container-low);
}

/* Bandas de velocidad eficaz */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-alta {
  background-color: var(--level-high-bg);
  border: 1px solid var(--level-high-border);
  color: var(--level-high-text);
}

.badge-normal {
  background-color: var(--level-normal-bg);
  border: 1px solid var(--level-normal-border);
  color: var(--level-normal-text);
}

.badge-baja {
  background-color: var(--level-low-bg);
  border: 1px solid var(--level-low-border);
  color: var(--level-low-text);
}

.badge-nodata {
  background-color: var(--level-nodata-bg);
  border: 1px solid var(--level-nodata-border);
  color: var(--level-nodata-text);
}

.badge-finalizada {
  background-color: var(--level-high-bg);
  border: 1px solid var(--level-high-border);
  color: var(--level-high-text);
}

.badge-en-curso {
  background-color: var(--level-progress-bg);
  border: 1px solid var(--level-progress-border);
  color: var(--level-progress-text);
}

/* Responsive */
@media (max-width: 768px) {
  .student-detail {
    padding: 1rem;
  }

  .student-header {
    flex-direction: column;
  }

  .header-stats {
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  table {
    font-size: 0.8rem;
  }

  th, td {
    padding: 0.5rem;
  }
}
</style>