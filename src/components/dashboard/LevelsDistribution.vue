<template>
  <div class="distribution-card">
    <div class="distribution-header">
      <div class="pb-3 border-b border-outline-variant/20">
        <h2 class="distribution-title">Distribución de Niveles</h2>
        <p class="distribution-subtitle">Clasificación según baremo de fluidez ({{ totalStudents }} alumnos)</p>
      </div>

      <!-- Bento list of distribution bars -->
      <div class="distribution-list">
        <!-- Nivel 1: Nivel Avanzado -->
        <div class="level-item" data-level="avanzado">
          <div class="level-info">
            <span class="level-name">
              <span class="level-dot dot-avanzado"></span>
              <span>Nivel Avanzado (&gt;125 PPM)</span>
            </span>
            <span class="level-stat">
              {{ levels.avanzado.count }} alum.
              <span class="level-pct">({{ levels.avanzado.pct }}%)</span>
            </span>
          </div>
          <div class="progress-track">
            <div class="progress-bar bar-avanzado" :style="{ width: levels.avanzado.pct + '%' }"></div>
          </div>
        </div>

        <!-- Nivel 2: En Nivel Óptimo -->
        <div class="level-item" data-level="optimo">
          <div class="level-info">
            <span class="level-name">
              <span class="level-dot dot-optimo"></span>
              <span>En Nivel Óptimo (105-125 PPM)</span>
            </span>
            <span class="level-stat">
              {{ levels.optimo.count }} alum.
              <span class="level-pct">({{ levels.optimo.pct }}%)</span>
            </span>
          </div>
          <div class="progress-track">
            <div class="progress-bar bar-optimo" :style="{ width: levels.optimo.pct + '%' }"></div>
          </div>
        </div>

        <!-- Nivel 3: En Desarrollo -->
        <div class="level-item" data-level="desarrollo">
          <div class="level-info">
            <span class="level-name">
              <span class="level-dot dot-desarrollo"></span>
              <span>En Desarrollo (85-104 PPM)</span>
            </span>
            <span class="level-stat">
              {{ levels.desarrollo.count }} alum.
              <span class="level-pct">({{ levels.desarrollo.pct }}%)</span>
            </span>
          </div>
          <div class="progress-track">
            <div class="progress-bar bar-desarrollo" :style="{ width: levels.desarrollo.pct + '%' }"></div>
          </div>
        </div>

        <!-- Nivel 4: Necesita Intervención -->
        <div class="level-item alert-level" data-level="intervencion">
          <div class="level-info">
            <span class="level-name text-error">
              <span class="level-dot dot-error"></span>
              <span>Necesita Intervención (&lt;85 PPM)</span>
            </span>
            <span class="level-stat text-error">
              {{ levels.intervencion.count }} alum.
              <span class="level-pct">({{ levels.intervencion.pct }}%)</span>
            </span>
          </div>
          <div class="progress-track">
            <div class="progress-bar bar-error" :style="{ width: levels.intervencion.pct + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Suggested Action Box -->
    <div class="action-box">
      <span class="action-tag">Acción Pedagógica Sugerida</span>
      <p class="action-desc">
        Revisar las grabaciones de decodificación fonética para los 3 alumnos con PPM inferior a 85 en la prueba 3BL y 3CF.
      </p>
      <button 
        type="button" 
        class="action-link"
        @click="$emit('open-intervention')"
      >
        <span>Abrir protocolo de lectura asistida</span>
        <svg class="action-chevron" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

defineEmits(['open-intervention']);

const levels = reactive({
  avanzado: { count: 7, pct: 27 },
  optimo: { count: 14, pct: 54 },
  desarrollo: { count: 2, pct: 8 },
  intervencion: { count: 3, pct: 11 }
});

const totalStudents = computed(() => {
  return levels.avanzado.count + levels.optimo.count + levels.desarrollo.count + levels.intervencion.count;
});
</script>

<style scoped>
.distribution-card {
  background: var(--color-surface-container-lowest, #ffffff);
  border-radius: var(--radius-xl, 0.75rem);
  padding: 1.5rem;
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.border-b {
  border-bottom: 1px solid rgba(189, 201, 192, 0.3);
  padding-bottom: 0.75rem;
}

.distribution-title {
  font-family: var(--font-family-display, 'Plus Jakarta Sans', sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-on-surface, #191c1b);
  margin: 0;
}

.distribution-subtitle {
  font-size: 0.875rem;
  color: var(--color-on-surface-variant, #3f4943);
  margin: 0.25rem 0 0 0;
}

.distribution-list {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.level-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-name {
  font-size: 0.875rem;
  color: var(--color-on-surface, #191c1b);
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 500;
}

.level-stat {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-on-surface, #191c1b);
  font-variant-numeric: tabular-nums;
}

.level-pct {
  color: var(--color-on-surface-variant, #3f4943);
  font-weight: 400;
}

.level-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  display: inline-block;
}

.dot-avanzado {
  background-color: var(--color-primary-fixed-dim, #6ffbbe);
}

.dot-optimo {
  background-color: var(--color-secondary, #006c49);
}

.dot-desarrollo {
  background-color: #f59e0b;
}

.dot-error {
  background-color: var(--color-error, #ba1a1a);
}

.progress-track {
  width: 100%;
  background-color: var(--color-surface-container-high, #e2e9e2);
  height: 0.625rem;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.4s ease-out;
}

.bar-avanzado {
  background-color: var(--color-primary-fixed-dim, #6ffbbe);
}

.bar-optimo {
  background-color: var(--color-secondary, #006c49);
}

.bar-desarrollo {
  background-color: #f59e0b;
}

.bar-error {
  background-color: var(--color-error, #ba1a1a);
}

.text-error {
  color: var(--color-error, #ba1a1a) !important;
  font-weight: 600;
}

/* Action Box */
.action-box {
  margin-top: 1.5rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-lg, 0.5rem);
  background-color: var(--color-surface-container-low, #f2f5f2);
  border: 1px solid rgba(189, 201, 192, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-tag {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-on-surface, #191c1b);
}

.action-desc {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--color-on-surface-variant, #3f4943);
  margin: 0;
}

.action-link {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-secondary, #006c49);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  transition: opacity 0.15s ease;
}

.action-link:hover {
  text-decoration: underline;
  opacity: 0.9;
}

.action-chevron {
  transition: transform 0.15s ease;
}

.action-link:hover .action-chevron {
  transform: translateX(2px);
}
</style>
