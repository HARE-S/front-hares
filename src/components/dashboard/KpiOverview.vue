<script setup>
import { computed } from 'vue';
import { Gauge, UserCheck, BookOpen, AlertTriangle, ArrowUp, ArrowRight } from 'lucide-vue-next';

const emit = defineEmits(['view-support', 'view-students', 'view-books']);

const kpiData = {
  speed: {
    current: 115,
    unit: 'PPM',
    delta: '+8% vs. Corte Inicial',
    target: 125,
    percentage: 92
  },
  students: {
    evaluated: 24,
    total: 26,
    percentage: 92,
    pendingCount: 2,
    pendingPeriod: 'Corte A'
  },
  books: {
    count: 68,
    unit: 'títulos',
    delta: '+14 este mes',
    averagePerStudent: 2.6
  },
  alerts: {
    count: 3,
    label: 'Requieren Apoyo',
    criteria: 'PPM < 85 o > 5% errores'
  }
};
</script>

<template>
  <section aria-label="Métricas Principales" class="kpi-grid">
    <!-- Card 1: Velocidad Media del Aula -->
    <div class="kpi-card flat-card">
      <div class="kpi-header">
        <span class="kpi-label">Velocidad Media del Aula</span>
        <div class="kpi-icon-box bg-emerald-light">
          <Gauge :size="18" class="text-secondary" />
        </div>
      </div>
      <div class="kpi-content">
        <div class="kpi-value-row">
          <span class="kpi-value tabular-data">{{ kpiData.speed.current }}</span>
          <span class="kpi-unit">{{ kpiData.speed.unit }}</span>
          <span class="kpi-delta badge--high font-bold">
            <ArrowUp :size="12" class="stroke-[3]" />
            {{ kpiData.speed.delta }}
          </span>
        </div>
        <!-- Barra de progreso hacia la meta -->
        <div class="progress-wrap">
          <div class="progress-labels">
            <span>Objetivo fin de curso</span>
            <span class="progress-target">{{ kpiData.speed.target }} PPM ({{ kpiData.speed.percentage }}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${kpiData.speed.percentage}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Alumnos Evaluados -->
    <div class="kpi-card flat-card">
      <div class="kpi-header">
        <span class="kpi-label">Alumnos Evaluados</span>
        <div class="kpi-icon-box bg-emerald-light">
          <UserCheck :size="18" class="text-secondary" />
        </div>
      </div>
      <div class="kpi-content">
        <div class="kpi-value-row">
          <span class="kpi-value tabular-data">{{ kpiData.students.evaluated }}</span>
          <span class="kpi-unit">/ {{ kpiData.students.total }}</span>
          <span class="kpi-delta badge--high font-bold">
            {{ kpiData.students.percentage }}% completitud
          </span>
        </div>
        <div class="kpi-footer-row">
          <span class="footer-note">{{ kpiData.students.pendingCount }} pendientes en {{ kpiData.students.pendingPeriod }}</span>
          <button class="footer-link" @click="emit('view-students')">Ver lista</button>
        </div>
      </div>
    </div>

    <!-- Card 3: Libros Leídos en Trimestre -->
    <div class="kpi-card flat-card">
      <div class="kpi-header">
        <span class="kpi-label">Libros Leídos en Trimestre</span>
        <div class="kpi-icon-box bg-emerald-light">
          <BookOpen :size="18" class="text-secondary" />
        </div>
      </div>
      <div class="kpi-content">
        <div class="kpi-value-row">
          <span class="kpi-value tabular-data">{{ kpiData.books.count }}</span>
          <span class="kpi-unit">{{ kpiData.books.unit }}</span>
          <span class="kpi-delta badge--high font-bold">
            {{ kpiData.books.delta }}
          </span>
        </div>
        <div class="kpi-footer-row">
          <span class="footer-note">Media: {{ kpiData.books.averagePerStudent }} libros / alumno</span>
          <button class="footer-link" @click="emit('view-books')">Ranking</button>
        </div>
      </div>
    </div>

    <!-- Card 4: Alerta Pedagógica -->
    <div class="kpi-card flat-card alert-card">
      <div class="kpi-header">
        <span class="kpi-label text-danger font-bold">Alerta Pedagógica</span>
        <div class="kpi-icon-box bg-danger-light">
          <AlertTriangle :size="18" class="text-danger" />
        </div>
      </div>
      <div class="kpi-content">
        <div class="kpi-value-row">
          <span class="kpi-value text-danger tabular-data">{{ kpiData.alerts.count }}</span>
          <span class="kpi-unit text-danger font-semibold">{{ kpiData.alerts.label }}</span>
        </div>
        <div class="alert-action-row">
          <span class="footer-note">{{ kpiData.alerts.criteria }}</span>
          <button class="alert-btn" @click="emit('view-support')">
            <span>Ver refuerzo</span>
            <ArrowRight :size="13" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.kpi-card {
  padding: 1.25rem 1.35rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: var(--radius-lg);
  border: 1px solid var(--outline-variant);
  background-color: var(--surface-container-lowest);
  min-height: 145px;
}

.alert-card {
  border-color: rgba(220, 38, 38, 0.25);
  background: linear-gradient(135deg, #ffffff 60%, rgba(254, 242, 242, 0.5) 100%);
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.kpi-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--on-surface-variant);
}

.kpi-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-emerald-light {
  background-color: rgba(162, 209, 186, 0.35);
}

.bg-danger-light {
  background-color: var(--error-container);
}

.text-secondary {
  color: var(--secondary);
}

.text-danger {
  color: var(--error);
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
}

.kpi-value {
  font-family: var(--font-headline);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--on-surface);
}

.kpi-unit {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--on-surface-variant);
}

.kpi-delta {
  margin-left: auto;
  font-size: 0.6875rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}

/* Barra de progreso */
.progress-wrap {
  margin-top: 0.75rem;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: var(--on-surface-variant);
  margin-bottom: 0.3rem;
}

.progress-target {
  font-weight: 600;
  color: var(--secondary);
}

.progress-track {
  width: 100%;
  height: 6px;
  background-color: var(--surface-container-high);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--secondary);
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Filas de pie de tarjeta */
.kpi-footer-row,
.alert-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.85rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--surface-container);
}

.footer-note {
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

.footer-link {
  background: transparent;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  padding: 0;
}

.footer-link:hover {
  text-decoration: underline;
}

.alert-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--error);
  background-color: rgba(255, 218, 214, 0.6);
  border: none;
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.alert-btn:hover {
  background-color: var(--error-container);
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
