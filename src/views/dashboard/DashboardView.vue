<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();

// Datos de ejemplo (en producción vendrían del backend)
const sectionData = ref({
  name: 'Aula 3A',
  averagePPM: 115,
  targetPPM: 125,
  progressPercent: 92,
  evaluatedStudents: 24,
  totalStudents: 26,
  booksReadThisTerm: 68,
  studentsNeedingSupport: 3
});

const pedagogicalAction = ref({
  recommendation: 'Revisar las grabaciones de decodificación fonética para los 3 alumnos con PPM inferior a 85 en la prueba 3BL y 3CF.',
  studentCount: 3,
  alert: 'students_need_support'
});

const metrics = computed(() => [
  {
    title: 'Velocidad Media del Aula',
    value: `${sectionData.value.averagePPM} PPM`,
    subtext: `Objetivo: ${sectionData.value.targetPPM} PPM`,
    badge: { label: `+8% vs. Corte Inicial`, type: 'success' }
  },
  {
    title: 'Alumnos Evaluados',
    value: `${sectionData.value.evaluatedStudents} / ${sectionData.value.totalStudents}`,
    subtext: `${Math.round((sectionData.value.evaluatedStudents / sectionData.value.totalStudents) * 100)}% completitud`,
    badge: { label: '82% completitud', type: 'success' }
  },
  {
    title: 'Libros Leídos en Trimestre',
    value: `${sectionData.value.booksReadThisTerm} títulos`,
    subtext: 'en este período',
    badge: { label: '+14 este mes', type: 'success' }
  },
  {
    title: 'Alerta Pedagógica',
    value: `${sectionData.value.studentsNeedingSupport}`,
    subtext: 'Requieren Apoyo',
    badge: { label: 'PPM < 85 o > 5% errores', type: 'danger' }
  }
]);
</script>

<template>
  <div class="dashboard">
    <!-- Cabecera -->
    <div class="page-header">
      <div class="header-left">
        <h1>Panel de Rendimiento Lector</h1>
        <p class="subtitle">Seguimiento sistemático de fluidez, velocidad (PPM) y comprensión lectora</p>
      </div>
      <div class="header-right">
        <span class="badge-label">Baremo Oficial 2024</span>
        <button class="btn btn-secondary">📋 Asignar Libro</button>
        <button class="btn btn-primary">➕ Nueva Evaluación en Directo</button>
      </div>
    </div>

    <!-- Tarjetas de Métricas -->
    <div class="metrics-grid">
      <div v-for="(metric, idx) in metrics" :key="idx" class="metric-card">
        <div class="metric-header">
          <h3>{{ metric.title }}</h3>
          <span v-if="metric.badge" class="badge" :class="`badge-${metric.badge.type}`">
            {{ metric.badge.label }}
          </span>
        </div>
        <div class="metric-value">{{ metric.value }}</div>
        <div class="metric-subtext">{{ metric.subtext }}</div>
      </div>
    </div>

    <!-- Sección de Gráficos -->
    <div class="charts-grid">
      <!-- Gráfico de Progreso -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>Progreso de Fluidez Lectora (PPM)</h2>
          <p>Comparativa longitudinal: Media Aula 3A frente a Baremo Estándar HARE-S</p>
          <div class="chart-tabs">
            <button class="tab-btn active">Trimestral</button>
            <button class="tab-btn">Anual</button>
          </div>
        </div>
        <div class="chart-placeholder">
          [Gráfico de líneas — FE-30, FE-31]
        </div>
      </div>

      <!-- Distribución de Niveles -->
      <div class="distribution-card">
        <h2>Distribución de Niveles</h2>
        <p>Clasificación según baremo de fluidez (26 alumnos)</p>
        <div class="distribution-placeholder">
          [Distribución de bandas por nivel — FE-34]
        </div>
      </div>
    </div>

    <!-- Bloque de Acción Pedagógica -->
    <div v-if="pedagogicalAction" class="pedagogical-action">
      <div class="action-icon">⚠️</div>
      <div class="action-content">
        <h3>Acción Pedagógica Sugerida</h3>
        <p>{{ pedagogicalAction.recommendation }}</p>
      </div>
      <button class="btn btn-secondary">Ver Refuerzo</button>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  flex: 1;
  padding: 2.5rem;
  background: linear-gradient(135deg, #f5faf9 0%, #f0fdf4 100%);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Cabecera */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  background: linear-gradient(135deg, var(--white) 0%, #f8fdfb 100%);
  padding: 2.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left h1 {
  margin: 0 0 0.75rem;
  font-size: 2rem;
  color: var(--green-950);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  color: var(--gray-500);
  font-size: 0.95rem;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.badge-label {
  padding: 0.65rem 1.25rem;
  background: linear-gradient(135deg, #ecfdf5, #dbeafe);
  color: #065f46;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid #86efac;
}

/* Tarjetas de Métricas */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: linear-gradient(135deg, var(--white) 0%, #f9fffe 100%);
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--green-500), var(--green-400));
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: var(--green-300);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.metric-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--green-600), var(--green-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  letter-spacing: -1px;
}

.metric-subtext {
  font-size: 0.9rem;
  color: var(--gray-500);
  font-weight: 500;
}

.badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-success {
  background-color: #ecfdf5;
  color: #065f46;
}

.badge-danger {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-info {
  background-color: #e0f2fe;
  color: #0c4a6e;
}

/* Gráficos */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-card,
.distribution-card {
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-card h2,
.distribution-card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--green-950);
}

.chart-card p,
.distribution-card p {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: var(--gray-500);
}

.chart-tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-600);
  background-color: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.tab-btn:hover {
  background-color: #f0fdf4;
  border-color: #86efac;
}

.tab-btn.active {
  background-color: var(--green-600);
  color: var(--white);
  border-color: var(--green-600);
}

.chart-placeholder,
.distribution-placeholder {
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-50);
  border: 1px dashed var(--gray-300);
  border-radius: var(--radius-md);
  color: var(--gray-500);
  font-size: 0.9rem;
  font-style: italic;
}

/* Acción Pedagógica */
.pedagogical-action {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: #fff5f0;
  border: 1px solid #fecaca;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  font-weight: 700;
  color: #991b1b;
}

.action-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #991b1b;
  line-height: 1.5;
}

/* Botones */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--green-600), var(--green-500));
  color: var(--white);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--green-700), var(--green-600));
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--white);
  color: var(--gray-700);
  border: 1.5px solid var(--gray-300);
  font-weight: 600;
}

.btn-secondary:hover {
  background-color: var(--gray-50);
  border-color: var(--green-400);
  color: var(--green-700);
}

/* Responsivo */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
  }

  .header-right {
    width: 100%;
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
    gap: 1rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding: 1rem;
  }

  .pedagogical-action {
    flex-direction: column;
    text-align: center;
  }

  .btn {
    width: 100%;
  }
}
</style>
