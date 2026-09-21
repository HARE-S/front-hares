<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  groups: {
    type: Array,
    default: () => []
  }
});

const PALETTE = [
  'rgb(16, 185, 129)',
  'rgb(59, 130, 246)',
  'rgb(245, 158, 11)',
  'rgb(139, 92, 246)',
  'rgb(239, 68, 68)',
  'rgb(14, 165, 233)',
  'rgb(236, 72, 153)',
  'rgb(132, 204, 22)'
];

// Grupos con datos: los que no tienen (escenario 4) NO se representan como cero.
const chartedGroups = computed(() => props.groups.filter((g) => g.has_data));

const chartData = computed(() => ({
  labels: ['PPM', 'Comprensión (%)'],
  datasets: chartedGroups.value.map((group, index) => ({
    label: group.name,
    data: [group.mean_ppm, group.mean_accuracy],
    backgroundColor: PALETTE[index % PALETTE.length],
    borderColor: PALETTE[index % PALETTE.length],
    borderWidth: 2,
    borderRadius: 4,
    maxBarThickness: 48
  }))
}));

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { size: 12, weight: 500 },
        padding: 15,
        usePointStyle: true
      }
    },
    title: {
      display: true,
      text: 'Comparativa de medias por grupo',
      font: { size: 14, weight: 'bold' },
      padding: { bottom: 20 }
    },
    tooltip: {
      callbacks: {
        title: (items) => items[0]?.dataset?.label || '',
        label: (ctx) => {
          const metric = ctx.label;
          const value = ctx.parsed.y;
          const suffix = metric === 'PPM' ? ' PPM' : '%';
          return `${metric}: ${Number.isFinite(value) ? value : '—'}${suffix}`;
        },
        afterLabel: (ctx) => {
          const group = chartedGroups.value[ctx.datasetIndex];
          if (!group) return '';
          return `${group.students_count} alumnos · ${group.results_count} pruebas`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'PPM · %',
        font: { size: 11 }
      },
      grid: { color: 'rgba(200, 200, 200, 0.15)' },
      ticks: { font: { size: 11 } }
    },
    x: {
      title: {
        display: true,
        text: 'Métricas',
        font: { size: 11 }
      },
      grid: { display: false },
      ticks: { font: { size: 11 } }
    }
  }
};
</script>

<template>
  <div class="comparison-chart">
    <div class="canvas-wrap">
      <Bar :data="chartData" :options="options" />
    </div>
    <p v-if="chartedGroups.length === 0" class="empty-note">
      Ningún grupo tiene resultados suficientes para representarse.
    </p>
  </div>
</template>

<style scoped>
.comparison-chart {
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.canvas-wrap {
  height: 340px;
}

.empty-note {
  margin: 0;
  padding-top: 1rem;
  border-top: 1px solid var(--outline-variant);
  font-size: 0.875rem;
  color: var(--on-surface-variant);
  text-align: center;
}
</style>