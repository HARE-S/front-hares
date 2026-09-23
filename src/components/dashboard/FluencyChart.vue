<script setup>
import { ref, computed, watch } from 'vue';
import { Sparkles } from 'lucide-vue-next';

const props = defineProps({
  course: {
    type: String,
    default: '2024-25'
  },
  realFluency: {
    type: Object,
    default: null
  }
});

const periodMode = ref('trimestral'); // 'trimestral' | 'anual'
const currentCourse = ref(props.course);

watch(() => props.course, (newCourse) => {
  currentCourse.value = newCourse;
  console.log('📈 FluencyChart: Curso cambió a', newCourse);
});

const courseDataMap = {
  '2024-25': { current: 115, badge: '115 PPM ★', diagnostic: '88%' },
  '2023-24': { current: 108, badge: '108 PPM ★', diagnostic: '85%' },
  '2022-23': { current: 102, badge: '102 PPM ★', diagnostic: '82%' },
  '2021-22': { current: 98, badge: '98 PPM ★', diagnostic: '80%' }
};

const currentData = computed(() => props.realFluency || courseDataMap[currentCourse.value] || courseDataMap['2024-25']);
</script>

<template>
  <div class="chart-card flat-card">
    <div class="chart-header">
      <div>
        <h2 class="chart-title">Progreso de Fluidez Lectora (PPM)</h2>
        <p class="chart-subtitle">Comparativa longitudinal: Media Aula 3A frente a Baremo Estándar HARE-S</p>
      </div>
      <div class="period-segmented">
        <button
          class="seg-btn"
          :class="{ active: periodMode === 'trimestral' }"
          @click="periodMode = 'trimestral'"
        >
          Trimestral
        </button>
        <button
          class="seg-btn"
          :class="{ active: periodMode === 'anual' }"
          @click="periodMode = 'anual'"
        >
          Anual
        </button>
      </div>
    </div>

    <!-- Leyenda y Baremos -->
    <div class="chart-legend-row">
      <div class="legend-item">
        <span class="legend-dot bg-secondary"></span>
        <span class="legend-text font-bold">Media Aula 3A</span>
      </div>
      <div class="legend-item">
        <span class="legend-dashed"></span>
        <span class="legend-text">Baremo Estándar (Fundación Peñascal)</span>
      </div>
      <div class="target-tag">
        Meta Final de Curso: <strong>125 PPM</strong>
      </div>
    </div>

    <!-- Canvas del Gráfico SVG con Gradiente y Travesías -->
    <div class="chart-viewport">
      <!-- Líneas de cuadrícula y cotas de PPM -->
      <div class="grid-layer">
        <div class="grid-line"><span class="grid-label">140 PPM</span></div>
        <div class="grid-line"><span class="grid-label">120 PPM</span></div>
        <div class="grid-line"><span class="grid-label">100 PPM</span></div>
        <div class="grid-line"><span class="grid-label">80 PPM</span></div>
        <div class="grid-baseline"></div>
      </div>

      <!-- Curvas y Área SVG Vectorial Nítida -->
      <svg class="svg-stage" viewBox="0 0 400 180" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fluencyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#006c49" stop-opacity="0.28" />
            <stop offset="100%" stop-color="#006c49" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Línea discontinua de Baremo Estándar -->
        <path
          d="M 30 145 L 145 115 L 260 90 L 375 60"
          fill="none"
          stroke="#717974"
          stroke-width="2"
          stroke-dasharray="4 4"
        />

        <!-- Relleno del área poligonal con degradado esmeralda -->
        <polygon
          fill="url(#fluencyGradient)"
          points="30,125 145,80 260,65 375,40 375,175 30,175"
        />

        <!-- Tramo real medido (Septiembre a Enero) -->
        <path
          d="M 30 125 L 145 80"
          fill="none"
          stroke="#006c49"
          stroke-width="3.5"
          stroke-linecap="round"
        />

        <!-- Tramo proyectado estimado (Enero a Junio) -->
        <path
          d="M 145 80 L 260 65 L 375 40"
          fill="none"
          stroke="#006c49"
          stroke-width="3"
          stroke-dasharray="5 3"
          stroke-linecap="round"
        />

        <!-- Puntos clave del recorrido -->
        <circle cx="30" cy="125" r="5" fill="#006c49" stroke="#ffffff" stroke-width="2" />
        <!-- Punto activo Enero (Corte A) -->
        <circle cx="145" cy="80" r="7.5" fill="#6ffbbe" stroke="#00271b" stroke-width="3" />
        <circle cx="260" cy="65" r="5" fill="#006c49" stroke="#ffffff" stroke-width="2" />
        <circle cx="375" cy="40" r="6.5" fill="#0f3e2e" stroke="#6ffbbe" stroke-width="2" />
      </svg>

      <!-- Etiquetas flotantes superpuestas (HTML para nitidez tipográfica) -->
      <div class="callouts-layer">
        <!-- Septiembre -->
        <div class="callout-point pos-sept">
          <div class="callout-badge">98 PPM</div>
          <span class="callout-date">Sept (Inicial)</span>
        </div>
        <!-- Enero (Activo) -->
        <div class="callout-point pos-ene">
          <div class="callout-badge-active">{{ currentData.badge }}</div>
          <span class="callout-date text-secondary font-bold">Enero (Corte A)</span>
        </div>
        <!-- Abril -->
        <div class="callout-point pos-abr">
          <div class="callout-badge-est">120 PPM est.</div>
          <span class="callout-date">Abril (Corte B)</span>
        </div>
        <!-- Junio -->
        <div class="callout-point pos-jun">
          <div class="callout-badge-target">128 PPM meta</div>
          <span class="callout-date">Junio (Corte C)</span>
        </div>
      </div>
    </div>

    <!-- Caja de Diagnóstico Pedagógico Contextual -->
    <div class="diagnostic-callout insight-callout">
      <Sparkles :size="20" class="text-secondary flex-shrink-0" />
      <p class="diagnostic-text">
        <strong>Diagnóstico pedagógico:</strong> El <span class="highlight-val">{{ currentData.diagnostic }} del alumnado</span> ha mejorado su ritmo de decodificación y prosodia, situándose 13 PPM por encima del baremo autonómico de corte de invierno.
      </p>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--outline-variant);
  gap: 1rem;
  flex-wrap: wrap;
}

.chart-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.01em;
}

.chart-subtitle {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  margin-top: 0.15rem;
}

/* Control segmentado */
.period-segmented {
  display: inline-flex;
  background-color: var(--surface-container-low);
  padding: 0.2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--outline-variant);
}

.seg-btn {
  background: transparent;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.seg-btn.active {
  background-color: var(--surface-container-lowest);
  color: var(--on-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Leyenda */
.chart-legend-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 0.8rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.bg-secondary {
  background-color: var(--secondary);
}

.legend-dashed {
  width: 16px;
  height: 2px;
  border-bottom: 2px dashed var(--outline);
}

.legend-text {
  color: var(--on-surface);
}

.target-tag {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--on-surface-variant);
  background-color: var(--surface-container-low);
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--outline-variant);
}

.target-tag strong {
  color: var(--on-surface);
}

/* Viewport del gráfico */
.chart-viewport {
  position: relative;
  height: 240px;
  margin-top: 1.5rem;
}

.grid-layer {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.grid-line {
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  display: flex;
  justify-content: flex-end;
  padding-right: 0.5rem;
}

.grid-label {
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--outline);
  transform: translateY(-50%);
}

.grid-baseline {
  border-bottom: 1.5px solid var(--outline-variant);
}

.svg-stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Etiquetas flotantes */
.callouts-layer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 2rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  pointer-events: none;
  z-index: 10;
}

.callout-point {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pos-sept {
  transform: translateY(12px);
}

.pos-ene {
  transform: translateY(-38px);
}

.pos-abr {
  transform: translateY(-56px);
}

.pos-jun {
  transform: translateY(-84px);
}

.callout-badge {
  background-color: var(--surface-container-lowest);
  color: var(--on-surface);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--outline-variant);
  box-shadow: var(--shadow-sm);
  margin-bottom: 0.25rem;
}

.callout-badge-active {
  background-color: var(--primary-container);
  color: var(--secondary-fixed);
  font-size: 0.725rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--secondary);
  box-shadow: 0 4px 6px -1px rgba(0, 39, 27, 0.2);
  margin-bottom: 0.25rem;
}

.callout-badge-est {
  background-color: var(--surface-container-lowest);
  color: var(--on-surface);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  border: 1px dashed rgba(0, 108, 73, 0.5);
  box-shadow: var(--shadow-sm);
  margin-bottom: 0.25rem;
}

.callout-badge-target {
  background-color: var(--secondary);
  color: var(--on-secondary);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  margin-bottom: 0.25rem;
}

.callout-date {
  font-size: 0.6875rem;
  color: var(--on-surface-variant);
  font-weight: 500;
}

.text-secondary {
  color: var(--secondary);
}

/* Diagnóstico */
.diagnostic-callout {
  margin-top: 1.5rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  background-color: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.diagnostic-text {
  font-size: 0.825rem;
  color: var(--on-surface);
  line-height: 1.45;
}

.highlight-val {
  font-weight: 700;
  color: var(--secondary);
}
</style>
