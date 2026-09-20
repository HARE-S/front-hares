<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getStudentRecord } from '@/services/studentService';
import RegisterResultModal from '@/components/results/RegisterResultModal.vue';
import { PlusCircle } from 'lucide-vue-next';

const route = useRoute();

const studentId = computed(() => route.params.studentId);
const loading = ref(false);
const error = ref(null);
const forbidden = ref(false);
const showRegisterModal = ref(false);

const studentData = ref(null);

async function loadStudentRecord() {
  loading.value = true;
  error.value = null;
  forbidden.value = false;

  try {
    studentData.value = await getStudentRecord(studentId.value);
  } catch (err) {
    if (err.status === 403) {
      forbidden.value = true;
      error.value = null;
    } else {
      error.value = err.message || 'Error al cargar la ficha del alumno';
      console.error('Error loading student record:', err);
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
    <!-- Estado de carga -->
    <div v-if="loading" class="state-loading">
      <p>Cargando ficha del alumno...</p>
    </div>

    <!-- Acceso denegado -->
    <div v-else-if="forbidden" class="state-forbidden">
      <p>No tienes permiso para acceder a esta información.</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-error">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="loadStudentRecord">Reintentar</button>
    </div>

    <!-- Contenido de la ficha -->
    <div v-else-if="studentData" class="student-content">
      <!-- Cabecera con datos del alumno -->
      <div class="student-header">
        <div class="header-info">
          <h1>{{ studentData.name }}</h1>
          <div class="header-meta">
            <span class="meta-item">📚 {{ studentData.grade }}</span>
            <span class="meta-item">👥 {{ studentData.section }}</span>
          </div>
          <div class="header-actions" style="margin-top: 0.75rem;">
            <button
              type="button"
              class="btn btn-primary"
              data-testid="open-register-test-btn"
              @click="showRegisterModal = true"
            >
              <PlusCircle :size="16" />
              <span>Registrar Prueba</span>
            </button>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-value">{{ studentData.stats?.averagePPM || '—' }}</div>
            <div class="stat-label">PPM Media</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ studentData.stats?.completedTests || '0' }}</div>
            <div class="stat-label">Pruebas Completadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ studentData.stats?.totalBooks || '0' }}</div>
            <div class="stat-label">Libros Leídos</div>
          </div>
        </div>
      </div>

      <!-- Secciones -->
      <div v-if="studentData.currentSections?.length > 0 || studentData.historicSections?.length > 0" class="card">
        <h2>Secciones</h2>
        <div v-if="studentData.currentSections?.length > 0" class="section-group">
          <h3 class="group-title">Actuales</h3>
          <div class="section-list">
            <div v-for="section in studentData.currentSections" :key="section.id" class="section-item">
              <div class="section-name">{{ section.name }}</div>
              <div class="section-teacher">{{ section.teacher }}</div>
            </div>
          </div>
        </div>
        <div v-if="studentData.historicSections?.length > 0" class="section-group">
          <h3 class="group-title">Anteriores</h3>
          <div class="section-list">
            <div v-for="section in studentData.historicSections" :key="section.id" class="section-item">
              <div class="section-name">{{ section.name }} <span class="section-year">({{ section.year }})</span></div>
              <div class="section-teacher">{{ section.teacher }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de evolución -->
      <div class="card">
        <div class="chart-header">
          <h2>Evolución de Velocidad Lectora</h2>
          <p class="chart-description">Progresión de PPM a lo largo del tiempo</p>
        </div>
        <div class="chart-placeholder">
          [Gráfico de serie temporal — FE-30]
        </div>
      </div>

      <!-- Tabla histórica de pruebas -->
      <div class="card">
        <h2>Histórico de Pruebas</h2>
        <div v-if="studentData.tests?.length > 0" class="table-wrapper">
          <table class="tests-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Prueba</th>
                <th>PPM Espontáneo</th>
                <th>Comprensión</th>
                <th>PPM Eficaz</th>
                <th>Banda</th>
                <th>Variación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(test, idx) in studentData.tests" :key="test.id">
                <td>{{ test.date }}</td>
                <td>{{ test.name }}</td>
                <td>{{ test.speedSpontaneous || '—' }}</td>
                <td>{{ test.comprehension || '—' }}%</td>
                <td>{{ test.effectiveSpeed || '—' }}</td>
                <td>
                  <span v-if="test.band" class="badge" :class="`badge-${test.band}`">
                    {{ test.band }}
                  </span>
                  <span v-else class="badge badge-info">Sin data</span>
                </td>
                <td>
                  <span v-if="test.variance !== null && test.variance !== undefined" class="variance" :class="{ positive: test.variance > 0, negative: test.variance < 0 }">
                    {{ test.variance > 0 ? '+' : '' }}{{ test.variance }}
                  </span>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <p>No hay pruebas registradas.</p>
        </div>
      </div>

      <!-- Diferencias funcional/literario -->
      <div class="card">
        <h2>Diferencias Funcional/Literario</h2>
        <div class="differences-grid">
          <div class="difference-card">
            <h3>Aspectos Funcionales</h3>
            <ul v-if="studentData.differences?.functional?.length > 0" class="difference-list">
              <li v-for="(item, idx) in studentData.differences.functional" :key="`func-${idx}`">
                {{ item }}
              </li>
            </ul>
            <p v-else class="empty-text">Sin observaciones</p>
          </div>
          <div class="difference-card">
            <h3>Aspectos Literarios</h3>
            <ul v-if="studentData.differences?.literary?.length > 0" class="difference-list">
              <li v-for="(item, idx) in studentData.differences.literary" :key="`lit-${idx}`">
                {{ item }}
              </li>
            </ul>
            <p v-else class="empty-text">Sin observaciones</p>
          </div>
        </div>
      </div>

      <!-- Libros leídos -->
      <div v-if="studentData.books?.length > 0" class="card">
        <h2>Libros Leídos</h2>
        <div class="table-wrapper">
          <table class="books-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Fecha de Lectura</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in studentData.books" :key="book.id">
                <td><strong>{{ book.title }}</strong></td>
                <td>{{ book.author }}</td>
                <td>{{ book.readDate }}</td>
                <td>
                  <span class="badge" :class="`badge-${book.status}`">
                    {{ book.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-else class="state-no-data">
      <p>No hay información disponible para este alumno.</p>
      <button class="btn btn-secondary" @click="loadStudentRecord">Recargar</button>
    </div>

    <!-- Modal para Registrar Resultado de Prueba (FE-18) -->
    <RegisterResultModal
      v-if="studentData"
      :is-open="showRegisterModal"
      :student-id="studentData.id"
      :student-name="studentData.name"
      :section-id="studentData.section"
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
  gap: 1.5rem;
}

.meta-item {
  font-size: 0.95rem;
  color: var(--on-surface-variant);
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  text-align: center;
  background-color: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  padding: 1rem;
  min-width: 120px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--green-600);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
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

/* Secciones */
.section-group {
  margin-bottom: 1.5rem;
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

.chart-placeholder {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-container-low);
  border: 1px dashed var(--gray-300);
  border-radius: var(--radius-md);
  color: var(--on-surface-variant);
  font-size: 0.9rem;
  font-style: italic;
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

.variance {
  font-weight: 600;
  font-size: 0.85rem;
}

.variance.positive {
  color: var(--success-text);
}

.variance.negative {
  color: var(--danger-text);
}

/* Diferencias */
.differences-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.difference-card {
  background-color: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.difference-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 1rem 0;
}

.difference-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.difference-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: var(--on-surface);
  font-size: 0.9rem;
}

.difference-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--green-600);
  font-weight: 700;
}

.empty-text {
  color: var(--on-surface-variant);
  font-style: italic;
  margin: 0;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-high {
  background-color: #ecfdf5;
  color: #065f46;
}

.badge-normal {
  background-color: #fff7ed;
  color: #92400e;
}

.badge-low {
  background-color: #fecaca;
  color: #991b1b;
}

.badge-info {
  background-color: #e0f2fe;
  color: #0c4a6e;
}

.badge-completed {
  background-color: #ecfdf5;
  color: #065f46;
}

.badge-in-progress {
  background-color: #fff7ed;
  color: #92400e;
}

/* Estados */
.state-loading,
.state-error,
.state-forbidden,
.state-no-data {
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

.state-forbidden {
  background-color: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
  padding: 2rem;
}

.state-loading p,
.state-error p,
.state-forbidden p,
.state-no-data p {
  margin: 0 0 1rem 0;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--on-surface-variant);
  font-style: italic;
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
    gap: 0.75rem;
  }

  .differences-grid {
    grid-template-columns: 1fr;
  }

  table {
    font-size: 0.8rem;
  }

  th, td {
    padding: 0.5rem;
  }
}
</style>
