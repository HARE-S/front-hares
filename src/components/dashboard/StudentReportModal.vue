<script setup>
import { ref, computed } from 'vue';
import { X, Download, BarChart3 } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  student: {
    type: Object,
    default: null
  },
  studentTests: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

const studentData = computed(() => {
  if (!props.student || !props.studentTests[props.student.id]) {
    return [];
  }
  return props.studentTests[props.student.id];
});

function exportToPDF() {
  alert('Exportar a PDF - Funcionalidad a implementar');
}

function exportToExcel() {
  if (!props.student || studentData.value.length === 0) return;

  const ws_data = [
    ['Informe Individual de Mejora Lectora'],
    ['Estudiante:', props.student.name],
    ['Centro:', props.student.center],
    [],
    ['Prueba', 'Código', 'Fecha', 'PPM', 'Errores', 'Nivel']
  ];

  studentData.value.forEach(test => {
    ws_data.push([
      test.title,
      test.code,
      test.date,
      test.ppm,
      test.errors,
      test.level
    ]);
  });

  const csv = ws_data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `informe-${props.student.name.replace(/\s+/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function closeModal() {
  emit('close');
}

function computeChartPoints() {
  if (studentData.value.length === 0) return '';

  const minPPM = getMinPPM();
  const maxPPM = getMaxPPM();

  return studentData.value
    .map((test, i) => {
      const x = 50 + (i / Math.max(studentData.value.length - 1, 1)) * 500;
      const y = 250 - ((parseInt(test.ppm) - minPPM) / (maxPPM - minPPM)) * 200;
      return `${x},${y}`;
    })
    .join(' ');
}

function getMinPPM() {
  return Math.min(...studentData.value.map(t => parseInt(t.ppm)));
}

function getMaxPPM() {
  return Math.max(...studentData.value.map(t => parseInt(t.ppm)));
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-dialog" @click.stop>
      <div class="modal-header">
        <div class="header-info">
          <h2>{{ student?.name }}</h2>
          <p class="center-info">{{ student?.center }}</p>
        </div>
        <div class="export-actions">
          <button class="export-btn" @click="exportToPDF" title="Exportar a PDF">
            <Download :size="18" />
            PDF
          </button>
          <button class="export-btn" @click="exportToExcel" title="Exportar a Excel">
            <Download :size="18" />
            Excel
          </button>
          <button class="modal-close" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
      </div>

      <div class="modal-body">
        <div v-if="studentData.length === 0" class="empty-state">
          <p>No hay datos de pruebas registradas para este estudiante</p>
        </div>

        <div v-else class="report-content">
          <!-- Tabla de Pruebas -->
          <div class="table-section">
            <h3>Historial de Pruebas</h3>
            <div class="table-wrapper">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Prueba</th>
                    <th>Código</th>
                    <th>Fecha</th>
                    <th>PPM</th>
                    <th>Errores</th>
                    <th>Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="test in studentData" :key="test.id">
                    <td>{{ test.title }}</td>
                    <td class="code-cell">{{ test.code }}</td>
                    <td>{{ test.date }}</td>
                    <td class="metric-cell">{{ test.ppm }}</td>
                    <td class="metric-cell">{{ test.errors }}</td>
                    <td>
                      <span class="level-badge" :class="`level-${test.level.toLowerCase()}`">
                        {{ test.level }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-label">Promedio PPM</div>
              <div class="stat-value">{{ Math.round(studentData.reduce((sum, t) => sum + parseInt(t.ppm), 0) / studentData.length) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Pruebas</div>
              <div class="stat-value">{{ studentData.length }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Progreso</div>
              <div class="stat-value progress-badge">
                {{ studentData.length > 1 ? Math.round(((parseInt(studentData[studentData.length - 1].ppm) - parseInt(studentData[0].ppm)) / parseInt(studentData[0].ppm) * 100)) : 0 }}%
              </div>
            </div>
          </div>

          <!-- Gráfico de Evolución -->
          <div class="chart-section">
            <h3>Evolución de Velocidad (PPM)</h3>
            <div class="chart-container">
              <svg viewBox="0 0 600 300" class="evolution-chart">
                <!-- Grid -->
                <g class="grid">
                  <line x1="50" y1="250" x2="550" y2="250" />
                  <line x1="50" y1="50" x2="50" y2="250" />
                </g>

                <!-- Chart Line -->
                <polyline
                  :points="computeChartPoints()"
                  fill="none"
                  stroke="#ef4444"
                  stroke-width="3"
                />

                <!-- Points -->
                <circle
                  v-for="(point, i) in studentData"
                  :key="i"
                  :cx="50 + (i / Math.max(studentData.length - 1, 1)) * 500"
                  :cy="250 - ((parseInt(point.ppm) - getMinPPM()) / (getMaxPPM() - getMinPPM())) * 200"
                  r="4"
                  fill="#ef4444"
                />

                <!-- Labels -->
                <text x="25" y="270" font-size="12" fill="#6b7280">Pruebas</text>
                <text x="480" y="270" font-size="12" fill="#6b7280">PPM</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close" @click="closeModal">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 85vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  flex-shrink: 0;
}

.header-info h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.center-info {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.export-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: white;
  color: #10b981;
  border: 2px solid #10b981;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  background: #10b981;
  color: white;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #111827;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #9ca3af;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.table-section h3,
.chart-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.table-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.report-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.report-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.85rem;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.report-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
  color: #111827;
}

.report-table tbody tr:hover {
  background: #f9fafb;
}

.code-cell {
  font-weight: 700;
  color: #10b981;
}

.metric-cell {
  text-align: center;
  font-weight: 600;
}

.level-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 2px solid;
}

.level-avanzado {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.level-en\ nivel {
  background: #dbeafe;
  color: #1e40af;
  border-color: #bfdbfe;
}

.level-requiere\ apoyo {
  background: #fed7aa;
  color: #92400e;
  border-color: #fdba74;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #d1fae5;
  border-radius: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-value {
  margin-top: 0.5rem;
  font-size: 2rem;
  font-weight: 800;
  color: #10b981;
}

.progress-badge {
  display: inline-block;
  background: white;
  border: 2px solid #10b981;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.chart-section {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.chart-container {
  width: 100%;
  min-height: 300px;
}

.evolution-chart {
  width: 100%;
  height: 100%;
}

.grid line {
  stroke: #e5e7eb;
  stroke-width: 1;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid #f0f0f0;
  background: #f9fafb;
  flex-shrink: 0;
  justify-content: flex-end;
}

.btn-close {
  padding: 0.875rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #059669;
}
</style>
