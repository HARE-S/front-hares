<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps({
  studentName: {
    type: String,
    default: 'Alumno'
  },
  historicalData: {
    type: Array,
    default: () => [
      { date: 'Sep 1', ppm: 120 },
      { date: 'Sep 8', ppm: 135 },
      { date: 'Sep 15', ppm: 155 },
      { date: 'Sep 22', ppm: 168 }
    ]
  },
  projectionData: {
    type: Array,
    default: () => [
      { date: 'Sep 22', ppm: 168 },
      { date: 'Sep 29', ppm: 180 },
      { date: 'Oct 6', ppm: 192 },
      { date: 'Oct 13', ppm: 204 }
    ]
  },
  targetPPM: {
    type: Number,
    default: 220
  }
});

const chartData = computed(() => ({
  labels: [
    ...props.historicalData.map(d => d.date),
    ...props.projectionData.slice(1).map(d => d.date)
  ],
  datasets: [
    {
      label: 'PPM Histórico',
      data: [
        ...props.historicalData.map(d => d.ppm),
        ...Array(props.projectionData.length - 1).fill(null)
      ],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: 'rgb(34, 197, 94)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      segment: {
        borderDash: [0]
      }
    },
    {
      label: 'PPM Proyectado (predicción)',
      data: [
        ...Array(props.historicalData.length - 1).fill(null),
        ...props.projectionData.map(d => d.ppm)
      ],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    },
    {
      label: `Objetivo (${props.targetPPM} PPM)`,
      data: Array(
        props.historicalData.length + props.projectionData.length - 1
      ).fill(props.targetPPM),
      borderColor: 'rgb(168, 85, 247)',
      borderWidth: 1,
      borderDash: [3, 3],
      fill: false,
      pointRadius: 0,
      tension: 0
    }
  ]
}));

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { size: 12, weight: 500 },
        padding: 15,
        usePointStyle: true
      }
    },
    title: {
      display: true,
      text: `Proyección de lectura: ${props.studentName}`,
      font: { size: 14, weight: 'bold' },
      padding: { bottom: 20 }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 12, weight: 'bold' },
      bodyFont: { size: 11 }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      min: 100,
      max: 250,
      ticks: {
        font: { size: 11 }
      },
      grid: {
        color: 'rgba(200, 200, 200, 0.1)'
      }
    },
    x: {
      ticks: {
        font: { size: 11 }
      },
      grid: {
        display: false
      }
    }
  }
};
</script>

<template>
  <div class="projection-chart">
    <Line :data="chartData" :options="options" />
    <div class="projection-info">
      <div class="info-card">
        <span class="label">Último valor:</span>
        <span class="value">{{ historicalData[historicalData.length - 1]?.ppm }} PPM</span>
      </div>
      <div class="info-card">
        <span class="label">Proyectado (final):</span>
        <span class="value">{{ projectionData[projectionData.length - 1]?.ppm }} PPM</span>
      </div>
      <div class="info-card">
        <span class="label">Objetivo:</span>
        <span class="value">{{ targetPPM }} PPM</span>
      </div>
      <div class="info-card">
        <span class="label">Progreso estimado:</span>
        <span class="value">
          +{{ projectionData[projectionData.length - 1]?.ppm - historicalData[historicalData.length - 1]?.ppm }} PPM
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projection-chart {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.projection-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 6px;
  text-align: center;
}

.label {
  font-size: 0.75rem;
  color: var(--gray-600);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--green-950);
}
</style>
