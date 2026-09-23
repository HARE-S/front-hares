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
  data: {
    type: Array,
    default: () => [
      { date: 'Sep 1', ppm: 120, vef: 85 },
      { date: 'Sep 8', ppm: 135, vef: 88 },
      { date: 'Sep 15', ppm: 155, vef: 92 },
      { date: 'Sep 22', ppm: 168, vef: 95 }
    ]
  }
});

const chartData = computed(() => {
  const dataPoints = props.data && props.data.length > 0 ? props.data : [
    { date: 'Sin datos', ppm: 0, vef: 0 }
  ];

  return {
    labels: dataPoints.map(d => d.date || 'Sin fecha'),
    datasets: [
      {
        label: 'PPM (Palabras por minuto)',
        data: dataPoints.map(d => Number(d.ppm) || 0),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'transparent',
        borderWidth: 3,
        fill: false,
        tension: 0,
        pointRadius: 8,
        pointHoverRadius: 10,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        yAxisID: 'y'
      },
      {
        label: 'VEF (Velocidad efectiva de lectura)',
        data: dataPoints.map(d => Number(d.vef) || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderDash: [8, 4],
        fill: false,
        tension: 0,
        pointRadius: 8,
        pointHoverRadius: 10,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        yAxisID: 'y1'
      }
    ]
  };
});

const options = {
  responsive: true,
  maintainAspectRatio: true,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { size: 12, weight: 500 },
        padding: 15,
        usePointStyle: true,
        boxWidth: 12
      }
    },
    title: {
      display: true,
      text: `Evolución de lectura: ${props.studentName}`,
      font: { size: 14, weight: 'bold' },
      padding: { bottom: 20 }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 1,
      displayColors: true,
      callbacks: {
        label: function(context) {
          return context.dataset.label + ': ' + Math.round(context.parsed.y);
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      min: 0,
      ticks: {
        font: { size: 11 },
        color: 'rgb(34, 197, 94)'
      },
      grid: {
        color: 'rgba(200, 200, 200, 0.1)'
      },
      title: {
        display: true,
        text: 'PPM',
        font: { size: 12, weight: 'bold' },
        color: 'rgb(34, 197, 94)'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      min: 0,
      grid: {
        drawOnChartArea: false
      },
      ticks: {
        font: { size: 11 },
        color: 'rgb(59, 130, 246)'
      },
      title: {
        display: true,
        text: 'VEF',
        font: { size: 12, weight: 'bold' },
        color: 'rgb(59, 130, 246)'
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
  <div class="evolution-chart">
    <Line :data="chartData" :options="options" />
  </div>
</template>

<style scoped>
.evolution-chart {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}
</style>
