<template>
  <div class="dashboard-view">
    <!-- SECTION 1: Page Header & Quick Actions Bar -->
    <header class="dashboard-header">
      <div class="header-titles">
        <div class="title-badge-row">
          <h1 class="page-title">Panel de Rendimiento Lector</h1>
          <span class="badge-baremo">{{ selectedCourse === '2024-25' ? 'Baremo Oficial 2024' : selectedCourse === '2023-24' ? 'Baremo Oficial 2023' : selectedCourse === '2022-23' ? 'Baremo Oficial 2022' : 'Baremo Oficial 2021' }}</span>
        </div>
        <p class="page-subtitle">Seguimiento sistemático de fluidez, velocidad (PPM) y comprensión lectora</p>
      </div>

      <!-- Action Button Group -->
      <div class="action-buttons-group">
        <!-- Super Admin: Panel de Aprobación -->
        <button
          v-if="user?.role === 'superadmin'"
          type="button"
          class="btn-dashboard btn-dashboard--secondary"
          @click="router.push('/admin/approval')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="btn-icon-secondary">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Panel de Aprobación</span>
        </button>

        <!-- Secondary Action: Assign Book -->
        <button
          type="button"
          class="btn-dashboard btn-dashboard--secondary"
          @click="handleAssignBook"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="btn-icon-secondary">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
          <span>Asignar Libro</span>
        </button>

        <!-- Secondary Action: Export -->
        <button 
          type="button" 
          class="btn-dashboard btn-dashboard--secondary"
          @click="handleExportReport"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="btn-icon-muted">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          <span>Exportar Informe (PDF/Excel)</span>
        </button>

        <!-- Primary Forest Action: New Assessment -->
        <button
          type="button"
          class="btn-dashboard btn-dashboard--primary"
          @click="handleNewAssessment"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="btn-icon-accent">
            <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
          <span>+ Nueva Evaluación en Directo</span>
        </button>
      </div>
    </header>

    <!-- Feedback Notice if user clicked action -->
    <div v-if="feedbackMessage" class="feedback-banner" role="status">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span>{{ feedbackMessage }}</span>
    </div>

    <!-- SECTION 2: Key Metric KPI Overview Cards -->
    <KpiOverview
      ref="kpiOverviewRef"
      :course="selectedCourse"
      @view-reinforcement="handleViewReinforcement"
      @view-report="(student) => { selectedReportStudent = student; showStudentReport = true; }"
    />

    <!-- SECTION 3: Analytics Section (8/4 Split Grid) -->
    <section aria-label="Análisis de Rendimiento" class="analytics-split-grid grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Main Analytical Chart: Fluidez Lectora PPM (8 cols) -->
      <div class="grid-col-chart lg:col-span-8">
        <FluencyChart :course="selectedCourse" />
      </div>

      <!-- Right Side: Distribución de Niveles (4 cols) -->
      <div class="grid-col-distribution lg:col-span-4">
        <LevelsDistribution :course="selectedCourse" @open-intervention="handleOpenIntervention" />
      </div>
    </section>

    <!-- SECTION 4: Data Table Section: Últimas Evaluaciones Registradas -->
    <RecentAssessmentsTable
      :course="selectedCourse"
      @export="handleTableExport"
      @play-audio="handlePlayAudio"
      @view-detail="handleViewDetail"
    />

    <!-- Modals -->
    <BookAssignModal
      :is-open="showBookModal"
      :students="kpiOverviewRef?.allStudents?.value || []"
      :all-books="allBooks"
      @close="closeBookModal"
      @assign="handleBookAssign"
    />

    <NewAssessmentModal
      :is-open="showAssessmentModal"
      :students="kpiOverviewRef?.allStudents?.value || []"
      :student-tests="kpiOverviewRef ? Object.assign({}, kpiOverviewRef.studentTests) : {}"
      @close="closeAssessmentModal"
      @create="handleAssessmentCreate"
    />

    <StudentReportModal
      :is-open="showStudentReport"
      :student="selectedReportStudent"
      :student-tests="kpiOverviewRef?.studentTests"
      @close="showStudentReport = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useCourse } from '@/composables/useCourse';
import KpiOverview from '../../components/dashboard/KpiOverview.vue';
import FluencyChart from '../../components/dashboard/FluencyChart.vue';
import LevelsDistribution from '../../components/dashboard/LevelsDistribution.vue';
import RecentAssessmentsTable from '../../components/dashboard/RecentAssessmentsTable.vue';
import BookAssignModal from '../../components/dashboard/BookAssignModal.vue';
import NewAssessmentModal from '../../components/dashboard/NewAssessmentModal.vue';
import StudentReportModal from '../../components/dashboard/StudentReportModal.vue';

const router = useRouter();
const { user } = useAuth();
const { selectedCourse } = useCourse();
const emit = defineEmits(['new-assessment', 'assign-book']);

const feedbackMessage = ref(null);
const showBookModal = ref(false);
const showAssessmentModal = ref(false);
const showStudentReport = ref(false);
const selectedReportStudent = ref(null);
const kpiOverviewRef = ref(null);
const allBooks = ref([]);

function showFeedback(msg) {
  feedbackMessage.value = msg;
  setTimeout(() => {
    feedbackMessage.value = null;
  }, 4000);
}

function handleAssignBook() {
  console.log('handleAssignBook triggered');
  showFeedback('Módulo de asignación de libros: Abriendo catálogo pedagógico...');
  emit('assign-book');
  if (kpiOverviewRef.value) {
    allBooks.value = kpiOverviewRef.value.getAllBooksFromStudents();
  }
  showBookModal.value = true;
}

function handleBookAssign(data) {
  console.log('Libros asignados:', data);
  if (kpiOverviewRef.value) {
    kpiOverviewRef.value.addBooksToStudent(data.studentId, data.books);
  }
  showFeedback(`Se asignaron ${data.books.length} libro(s) a estudiante ${data.studentId}`);
}

function closeBookModal() {
  showBookModal.value = false;
}

function handleNewAssessment() {
  console.log('handleNewAssessment triggered');
  emit('new-assessment');
  showAssessmentModal.value = true;
}

function handleAssessmentCreate(data) {
  console.log('Nueva evaluación creada:', data);
  showFeedback(`Evaluación registrada para ${data.studentId} con prueba ${data.testId}`);
}

function closeAssessmentModal() {
  showAssessmentModal.value = false;
}

function handleExportReport() {
  console.log('handleExportReport triggered');
  downloadCSV();
}

function handleViewReinforcement() {
  console.log('handleViewReinforcement triggered');
  showFeedback('Filtrando alumnos prioritarios de intervención pedagógica (PPM < 85)...');
}

function handleOpenIntervention() {
  console.log('handleOpenIntervention triggered');
  showFeedback('Abriendo protocolo de lectura asistida para casos de intervención.');
}

function handleTableExport(data) {
  console.log('handleTableExport triggered', data);
  showFeedback(`Descarga iniciada: ${data.length} registros exportados a formato CSV/Excel.`);
}

function handlePlayAudio(assessment) {
  console.log('handlePlayAudio triggered', assessment.studentName);
  showFeedback(`Reproduciendo audio de lectura de ${assessment.studentName} (${assessment.testCode}).`);
}

function handleViewDetail(assessment) {
  console.log('handleViewDetail triggered', assessment.studentName);
  showFeedback(`Consultando ficha pedagógica completa de ${assessment.studentName}.`);
}

function viewStudentReport(student) {
  selectedReportStudent.value = student;
  showStudentReport.value = true;
}

function downloadCSV() {
  const data = [
    ['Alumno', 'Código', 'Prueba', 'Fecha', 'Velocidad', 'Exactitud', 'Comprensión', 'Nivel'],
    ['Lucas Méndez Ruiz', '3AF', 'El bosque animado', '24 Ene 2025', '128 PPM', '98.5%', '4/4', 'Avanzado'],
    ['Sofía Navarro Ortiz', '3AF', 'El bosque animado', '24 Ene 2025', '118 PPM', '96.0%', '4/4', 'En nivel'],
    ['Mateo Barrenechea', '3BL', 'Aventuras en el mar', '23 Ene 2025', '82 PPM', '88.0%', '2/4', 'Requiere apoyo'],
    ['Aitana Zubizarreta', '3AF', 'El bosque animado', '23 Ene 2025', '115 PPM', '95.0%', '3/4', 'En nivel']
  ];

  const csv = data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `evaluaciones-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showFeedback('Archivo CSV descargado correctamente');
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
  width: 100%;
}

/* Header */
.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(189, 201, 192, 0.25);
}

@media (min-width: 768px) {
  .dashboard-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.title-badge-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-family-display, 'Plus Jakarta Sans', sans-serif);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-on-surface, #191c1b);
  letter-spacing: -0.02em;
  margin: 0;
}

.badge-baremo {
  background-color: var(--color-primary-fixed, #8ef7c7);
  color: var(--color-on-primary-fixed-variant, #005136);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  letter-spacing: 0.01em;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: var(--color-on-surface-variant, #3f4943);
  margin: 0.25rem 0 0 0;
}

/* Button Group */
.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.btn-dashboard {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-lg, 0.5rem);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: 1px solid transparent;
}

.btn-dashboard--secondary {
  background-color: var(--color-surface-container-lowest, #ffffff);
  color: var(--color-on-surface, #191c1b);
  border-color: rgba(189, 201, 192, 0.6);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
}

.btn-dashboard--secondary:hover {
  background-color: var(--color-surface-container-low, #f2f5f2);
}

.btn-icon-secondary {
  color: var(--color-secondary, #006c49);
}

.btn-icon-muted {
  color: var(--color-on-surface-variant, #3f4943);
}

.btn-dashboard--primary {
  background-color: var(--color-primary-container, #0f3e2e);
  color: var(--color-surface-container-lowest, #ffffff);
  border-color: rgba(0, 108, 73, 0.4);
  box-shadow: 0 2px 4px rgba(15, 62, 46, 0.2);
}

.btn-dashboard--primary:hover {
  background-color: var(--color-primary, #0f3e2e);
  filter: brightness(1.1);
  box-shadow: 0 4px 8px rgba(15, 62, 46, 0.28);
}

.btn-icon-accent {
  color: var(--color-secondary-fixed, #6ffbbe);
}

/* Feedback Notice */
.feedback-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-primary-fixed, #8ef7c7);
  color: var(--color-on-primary-fixed-variant, #005136);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg, 0.5rem);
  font-size: 0.875rem;
  font-weight: 600;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 8 / 4 Split Grid */
.analytics-split-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .analytics-split-grid {
    grid-template-columns: repeat(12, 1fr);
  }

  .grid-col-chart {
    grid-column: span 8;
  }

  .grid-col-distribution {
    grid-column: span 4;
  }
}
</style>
