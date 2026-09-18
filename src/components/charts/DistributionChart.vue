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
  sectionName: {
    type: String,
    default: 'Sección'
  },
  data: {
    type: Array,
    default: () => [
      { band: 'Requiere apoyo', count: 5, percentage: 25 },
      { band: 'En nivel', count: 10, percentage: 50 },
      { band: 'Avanzado', count: 5, percentage: 25 }
    ]
  }
});

const chartData = computed(() => ({
  labels: props.data.map(d => d.band),
  datasets: [
    {
      label: 'Cantidad de alumnos',
      data: props.data.map(d => d.count),
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',   // Rojo para "Requiere apoyo"
        'rgba(251, 191, 36, 0.7)',  // Amarillo para "En nivel"
        'rgba(34, 197, 94, 0.7)'    // Verde para "Avanzado"
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(251, 191, 36)',
        'rgb(34, 197, 94)'
      ],
      borderWidth: 2,
      borderRadius: 4
    }
  ]
}));

const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: { size: 12, weight: 500 },
        padding: 15
      }
    },
    title: {
      display: true,
      text: `Distribución de bandas: ${props.sectionName}`,
      font: { size: 14, weight: 'bold' },
      padding: { bottom: 20 }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        font: { size: 11 }
      },
      grid: {
        color: 'rgba(200, 200, 200, 0.1)'
      }
    },
    y: {
      ticks: {
        font: { size: 12, weight: 500 }
      },
      grid: {
        display: false
      }
    }
  }
};
</script>

<template>
  <div class="distribution-chart">
    <Bar :data="chartData" :options="options" />
    <div class="chart-legend">
      <div v-for="item in data" :key="item.band" class="legend-item">
        <span class="badge" :class="getBandClass(item.band)">{{ item.band }}</span>
        <span class="count">{{ item.count }} alumnos ({{ item.percentage }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
function getBandClass(band) {
  return {
    'band-support': band === 'Requiere apoyo',
    'band-level': band === 'En nivel',
    'band-advanced': band === 'Avanzado'
  };
}
</script>

<style scoped>
.distribution-chart {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  color: white;
  min-width: 150px;
  text-align: center;
}

.band-support {
  background-color: rgb(239, 68, 68);
}

.band-level {
  background-color: rgb(251, 191, 36);
  color: var(--gray-950);
}

.band-advanced {
  background-color: rgb(34, 197, 94);
}

.count {
  color: var(--gray-600);
  font-size: 0.875rem;
}
</style>
