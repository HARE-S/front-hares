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
        data: dataPoints.map(d => d.ppm || 0),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'VEF (Velocidad efectiva de lectura)',
        data: dataPoints.map(d => d.vef || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };
});

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
      text: `Evolución de lectura: ${props.studentName}`,
      font: { size: 14, weight: 'bold' },
      padding: { bottom: 20 }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      min: 50,
      max: 200,
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
