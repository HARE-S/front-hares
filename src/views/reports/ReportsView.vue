<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import {
  FileText,
  Printer,
  Download,
  Users,
  Calendar,
  BookOpen,
  Award,
  Layers,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter
} from 'lucide-vue-next';
import {
  exportResultsToExcel,
  getStudentReport,
  getSectionGroupReport
} from '../../services/reportsService';
import { _getInMemoryResults } from '../../services/resultsService';
import { formatDate, formatPPM, formatVef } from '../../utils/format';

const props = defineProps({
  userRole: {
    type: String,
    default: 'tutor'
  }
});

// Pestaña activa dentro de la vista de Informes: 'group' | 'student' | 'export'
const activeReportTab = ref('group');

// Listado de secciones disponibles
const sectionsList = ref([
  { id: 'sec-1', name: '1º Primaria - Aula A (Tutoría)', grade: '1º Primaria' },
  { id: 'sec-2', name: '1º Primaria - Aula B', grade: '1º Primaria' },
  { id: 'sec-3', name: '2º Primaria - Aula A', grade: '2º Primaria' },
  { id: 'sec-vacia', name: '3º Primaria - Aula A (Sin datos)', grade: '3º Primaria' }
]);

// Listado de alumnos disponibles para informe individual
const studentsList = ref([
  { id: '1', name: 'Lucas Méndez Ruiz', sectionId: 'sec-1' },
  { id: '2', name: 'Sofía Navarro Ortiz', sectionId: 'sec-1' },
  { id: '3', name: 'Mateo Barrenechea', sectionId: 'sec-1' },
  { id: '4', name: 'Aitana Zubizarreta', sectionId: 'sec-1' },
  { id: '7', name: 'Alejandro López', sectionId: 'sec-1' }
]);

// --- ESTADO INFORME DE GRUPO (FE-38) ---
const selectedGroupSectionId = ref('sec-1');
const selectedAcademicYear = ref('2024-2025');
const groupReport = ref(null);
const isLoadingGroup = ref(false);

async function loadGroupReport() {
  isLoadingGroup.value = true;
  try {
    groupReport.value = await getSectionGroupReport(
      selectedGroupSectionId.value,
      selectedAcademicYear.value
    );
  } catch (err) {
    console.warn('Error al cargar informe de grupo:', err);
    groupReport.value = null;
  } finally {
    isLoadingGroup.value = false;
  }
}

watch(selectedGroupSectionId, () => {
  loadGroupReport();
});

// --- ESTADO INFORME INDIVIDUAL (FE-37) ---
const selectedStudentId = ref('1');
const studentReport = ref(null);
const isLoadingStudent = ref(false);

async function loadStudentReport() {
  if (!selectedStudentId.value) return;
  isLoadingStudent.value = true;
  try {
    studentReport.value = await getStudentReport(selectedStudentId.value);
  } catch (err) {
    console.warn('Error al cargar informe individual:', err);
    studentReport.value = null;
  } finally {
    isLoadingStudent.value = false;
  }
}

watch(selectedStudentId, () => {
  loadStudentReport();
});

// --- ESTADO EXPORTACIÓN GENERAL (FE-36) ---
const exportSectionId = ref('sec-1');
const exportStartDate = ref('');
const exportEndDate = ref('');
const isExporting = ref(false);
const exportFeedback = ref(null);
const exportError = ref('');

// Conteo en vivo de registros filtrados para la exportación (Escenario 2 de FE-36)
const exportMatchingCount = computed(() => {
  const all = _getInMemoryResults();
  let list = [...all];
  if (exportSectionId.value) {
    list = list.filter(r => String(r.sectionId) === String(exportSectionId.value));
  }
  if (exportStartDate.value) {
    list = list.filter(r => r.testDate >= exportStartDate.value);
  }
  if (exportEndDate.value) {
    list = list.filter(r => r.testDate <= exportEndDate.value);
  }
  return list.length;
});

async function handleExportFiltered() {
  exportError.value = '';
  exportFeedback.value = null;

  if (exportMatchingCount.value === 0) {
    exportError.value = 'No hay datos que exportar para los filtros seleccionados.';
    return;
  }

  isExporting.value = true;
  try {
    const res = await exportResultsToExcel({
      section_id: exportSectionId.value,
      start_date: exportStartDate.value || undefined,
      end_date: exportEndDate.value || undefined
    });
    exportFeedback.value = `Se han exportado ${res.count} registros correctamente.`;
  } catch (err) {
    exportError.value = err.message || 'Error al exportar los datos.';
  } finally {
    isExporting.value = false;
  }
}

function handlePrint() {
  if (typeof window !== 'undefined' && window.print) {
    window.print();
  }
}

onMounted(() => {
  loadGroupReport();
  loadStudentReport();
});
</script>

<template>
  <div class="view-reports">
    <!-- Barra de navegación entre tipos de informe (Oculta al imprimir) -->
    <div class="no-print report-tabs-nav">
      <div class="tabs-group">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeReportTab === 'group' }"
          @click="activeReportTab = 'group'"
        >
          <Users :size="16" />
          <span>Informe de Grupo / Aula</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeReportTab === 'student' }"
          @click="activeReportTab = 'student'"
        >
          <FileText :size="16" />
          <span>Informe Individual Alumno</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeReportTab === 'export' }"
          @click="activeReportTab = 'export'"
        >
          <Download :size="16" />
          <span>Exportación a Hoja de Cálculo</span>
        </button>
      </div>

      <!-- Botón universal de impresión -->
      <button
        v-if="activeReportTab !== 'export'"
        type="button"
        class="btn-print"
        @click="handlePrint"
      >
        <Printer :size="16" />
        <span>Imprimir en A4</span>
      </button>
    </div>

    <!-- ============================================================= -->
    <!-- 1. INFORME AGREGADO DE GRUPO (FE-38) -->
    <!-- ============================================================= -->
    <div v-if="activeReportTab === 'group'" class="report-container">
      <!-- Selector de sección y año (Oculto al imprimir) -->
      <div class="no-print controls-bar">
        <div class="control-item">
          <label for="group-section-select">Sección / Aula:</label>
          <select id="group-section-select" v-model="selectedGroupSectionId" class="form-select">
            <option v-for="sec in sectionsList" :key="sec.id" :value="sec.id">
              {{ sec.name }}
            </option>
          </select>
        </div>

        <div class="control-item">
          <label for="group-year-select">Año Académico:</label>
          <select id="group-year-select" v-model="selectedAcademicYear" class="form-select">
            <option value="2024-2025">Curso 2024-2025</option>
            <option value="2025-2026">Curso 2025-2026</option>
          </select>
        </div>

        <button
          type="button"
          class="btn-action-excel"
          :disabled="!groupReport?.hasData"
          @click="exportResultsToExcel({ section_id: selectedGroupSectionId })"
        >
          <Download :size="15" />
          <span>Descargar Excel</span>
        </button>
      </div>

      <!-- Cabecera Oficial del Informe Grupal -->
      <div class="official-doc-header">
        <div class="header-branding">
          <span class="program-title">Programa HARE-S · Fundación Peñascal</span>
          <h2>Informe Agregado de Rendimiento Lector</h2>
          <p class="doc-meta">
            <strong>Aula:</strong> {{ groupReport?.name || 'Sección' }} ·
            <strong>Año:</strong> {{ groupReport?.academicYear || '2024-2025' }} ·
            <strong>Centro:</strong> {{ groupReport?.centerName || 'Fundación Peñascal' }}
          </p>
        </div>
        <div class="print-timestamp">
          <span>Fecha de emisión:</span>
          <strong>{{ new Date().toLocaleDateString('es-ES') }}</strong>
        </div>
      </div>

      <!-- Caso: Grupo CON DATOS -->
      <div v-if="groupReport && groupReport.hasData" class="report-content">
        <!-- 4 Tarjetas de Métricas Agregadas (FE-38 Escenario 1) -->
        <div class="metrics-summary-grid">
          <div class="metric-card">
            <span class="metric-title">Velocidad Eficaz Media</span>
            <span class="metric-number text-primary">{{ formatVef(groupReport.meanVef) }}</span>
            <span class="metric-unit">palabras/minuto eficaces</span>
          </div>

          <div class="metric-card">
            <span class="metric-title">Media Palabras Por Minuto (PPM)</span>
            <span class="metric-number">{{ formatPPM(groupReport.meanPpm) }}</span>
            <span class="metric-unit">PPM brutas del grupo</span>
          </div>

          <div class="metric-card">
            <span class="metric-title">Alumnos Evaluados</span>
            <span class="metric-number">{{ groupReport.participantsCount }}</span>
            <span class="metric-unit">participantes activos</span>
          </div>

          <div class="metric-card">
            <span class="metric-title">Evaluaciones Registradas</span>
            <span class="metric-number">{{ groupReport.resultsCount }}</span>
            <span class="metric-unit">pruebas completadas</span>
          </div>
        </div>

        <!-- Distribución por Banda Pedagógica (FE-38 Escenario 2) -->
        <div class="report-section-card">
          <div class="section-card-header">
            <Award :size="18" class="text-primary" />
            <h3>Distribución del Alumnado por Bandas de Rendimiento</h3>
          </div>
          <p class="section-explanation">
            La media global no basta para valorar el aula: la distribución por tramos permite identificar cuántos alumnos están en nivel adecuado y cuántos precisan intervención pedagógica.
          </p>

          <div v-if="groupReport.distribution" class="bands-progress-list">
            <!-- Avanzado -->
            <div class="band-progress-row">
              <div class="band-meta">
                <span class="badge-band band-avanzado">Avanzado (Vef ≥ 110)</span>
                <span class="band-stats">{{ groupReport.distribution.advanced.count }} alumnos ({{ groupReport.distribution.advanced.percent }}%)</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill fill-advanced" :style="{ width: groupReport.distribution.advanced.percent + '%' }"></div>
              </div>
            </div>

            <!-- En nivel -->
            <div class="band-progress-row">
              <div class="band-meta">
                <span class="badge-band band-en-nivel">En nivel (85 ≤ Vef &lt; 110)</span>
                <span class="band-stats">{{ groupReport.distribution.normal.count }} alumnos ({{ groupReport.distribution.normal.percent }}%)</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill fill-normal" :style="{ width: groupReport.distribution.normal.percent + '%' }"></div>
              </div>
            </div>

            <!-- Requiere apoyo -->
            <div class="band-progress-row">
              <div class="band-meta">
                <span class="badge-band band-requiere-apoyo">Requiere apoyo (Vef &lt; 85)</span>
                <span class="band-stats">{{ groupReport.distribution.support.count }} alumnos ({{ groupReport.distribution.support.percent }}%)</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill fill-support" :style="{ width: groupReport.distribution.support.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progreso del Grupo (FE-38 Escenario 3) -->
        <div class="report-section-card">
          <div class="section-card-header">
            <TrendingUp :size="18" class="text-primary" />
            <h3>Progreso Lector del Grupo</h3>
          </div>
          <div class="progress-metric-box">
            <div class="progress-stat">
              <span class="progress-big">{{ groupReport.progress?.improvingPercent }}%</span>
              <span class="progress-sub">Tasa de mejora global</span>
            </div>
            <p class="progress-description">
              <strong>{{ groupReport.progress?.improvingCount }} de {{ groupReport.progress?.totalCompared }} alumnos</strong>
              evaluados en sesiones consecutivas muestran un incremento neto en su velocidad eficaz o comprensión lectora.
            </p>
          </div>
        </div>
      </div>

      <!-- Caso: Grupo SIN DATOS (FE-38 Escenario 4) -->
      <div v-else class="empty-report-card">
        <AlertCircle :size="36" class="empty-report-icon" />
        <h3>Sin evaluaciones registradas en esta sección</h3>
        <p>
          No hay datos de pruebas disponibles para calcular los indicadores del grupo.
          <strong>No se computan medias sobre cero</strong> para preservar la integridad estadística del centro.
        </p>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- 2. INFORME INDIVIDUAL IMPRIMIBLE (FE-37) -->
    <!-- ============================================================= -->
    <div v-else-if="activeReportTab === 'student'" class="report-container">
      <!-- Selector de alumno (Oculto al imprimir) -->
      <div class="no-print controls-bar">
        <div class="control-item">
          <label for="student-select">Seleccionar Alumno:</label>
          <select id="student-select" v-model="selectedStudentId" class="form-select">
            <option v-for="stu in studentsList" :key="stu.id" :value="stu.id">
              {{ stu.name }}
            </option>
          </select>
        </div>

        <button type="button" class="btn-action-print" @click="handlePrint">
          <Printer :size="15" />
          <span>Imprimir Expediente A4</span>
        </button>
      </div>

      <!-- Documento Imprimible del Alumno -->
      <div v-if="studentReport" class="student-doc-sheet">
        <!-- Cabecera Oficial (FE-37 Escenario 3) -->
        <div class="official-doc-header">
          <div class="header-branding">
            <span class="program-title">Programa de Fluidez y Comprensión Lectora · Peñascal</span>
            <h2>Expediente Individual de Lectura</h2>
            <p class="doc-meta">
              <strong>Centro:</strong> {{ studentReport.centerName }} ·
              <strong>Fecha y hora:</strong> {{ new Date(studentReport.generationDate).toLocaleString('es-ES') }}
            </p>
          </div>
        </div>

        <!-- Ficha de Datos Personales del Alumno -->
        <div class="student-info-strip">
          <div class="info-block">
            <span class="info-label">Alumno/a</span>
            <span class="info-value">{{ studentReport.studentName }}</span>
          </div>
          <div class="info-block">
            <span class="info-label">Curso</span>
            <span class="info-value">{{ studentReport.grade }}</span>
          </div>
          <div class="info-block">
            <span class="info-label">Grupo / Sección</span>
            <span class="info-value">{{ studentReport.sectionName }}</span>
          </div>
        </div>

        <!-- Historial de Pruebas con las 3 Métricas (FE-37 Escenario 1) -->
        <div class="doc-block">
          <h3 class="block-title">Historial de Evaluaciones de Lectura</h3>
          <table class="doc-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Prueba</th>
                <th style="text-align: right;">Tiempo</th>
                <th style="text-align: right;">PPM</th>
                <th style="text-align: right;">Comprensión</th>
                <th style="text-align: right;">Velocidad Eficaz</th>
                <th>Banda</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="test in studentReport.tests" :key="test.id">
                <td>{{ formatDate(test.testDate) }}</td>
                <td><strong>{{ test.testName || test.testId }}</strong></td>
                <td style="text-align: right;">{{ test.time }}s</td>
                <td style="text-align: right;">{{ formatPPM(test.ppm) }}</td>
                <td style="text-align: right;">{{ test.successes !== undefined ? test.successes + '/20' : '-' }}</td>
                <td style="text-align: right; font-weight: 700; color: #1e5e4c;">{{ formatVef(test.vef) }}</td>
                <td>
                  <span class="badge-band" :class="'band-' + (test.band || 'Sin datos').toLowerCase().replace(/\s+/g, '-')">
                    {{ test.band || 'Sin datos' }}
                  </span>
                </td>
              </tr>
              <tr v-if="studentReport.tests.length === 0">
                <td colspan="7" class="text-center">Sin evaluaciones registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Aviso de Datos Insuficientes (FE-37 Escenario 4) -->
        <div v-if="!studentReport.hasSufficientData" class="data-insufficient-note">
          <AlertCircle :size="18" />
          <span>
            El alumno cuenta con una única evaluación. <strong>Datos insuficientes para proyectar evolución histórica</strong> (se requieren al menos dos cortes).
          </span>
        </div>

        <!-- Historial de Lecturas de Libros -->
        <div class="doc-block">
          <h3 class="block-title">Seguimiento de Lecturas del Alumno</h3>
          <table class="doc-table">
            <thead>
              <tr>
                <th>Título del Libro</th>
                <th>Nivel Pedagógico</th>
                <th>Fecha de Asignación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(book, idx) in studentReport.books" :key="idx">
                <td><strong>{{ book.title }}</strong></td>
                <td>Nivel {{ book.level }}</td>
                <td>{{ formatDate(book.readDate) }}</td>
                <td>
                  <span class="status-pill" :class="book.status === 'Finalizado' ? 'status--completed' : 'status--active'">
                    {{ book.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="studentReport.books.length === 0">
                <td colspan="4" class="text-center">No hay lecturas registradas actualmente.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pie Oficial de Firma del Centro -->
        <div class="doc-signatures">
          <div class="sig-box">
            <span class="sig-role">Firma del Tutor/a</span>
            <div class="sig-line"></div>
          </div>
          <div class="sig-box">
            <span class="sig-role">Coordinación Pedagógica</span>
            <div class="sig-line"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- 3. EXPORTACIÓN A HOJA DE CÁLCULO (FE-36) -->
    <!-- ============================================================= -->
    <div v-else-if="activeReportTab === 'export'" class="report-container">
      <div class="export-card">
        <div class="export-card-header">
          <div class="export-icon-box">
            <Download :size="24" />
          </div>
          <div>
            <h2>Descarga de Datos en Hoja de Cálculo (.xlsx / .csv)</h2>
            <p>
              Exporta los datos que estás visualizando con filtros aplicados (FE-36).
              El fichero generado contiene exactamente el conjunto filtrado respetando la privacidad del alumnado.
            </p>
          </div>
        </div>

        <div v-if="exportError" class="error-banner">
          <AlertCircle :size="18" />
          <span>{{ exportError }}</span>
        </div>

        <div v-if="exportFeedback" class="success-banner">
          <CheckCircle2 :size="18" />
          <span>{{ exportFeedback }}</span>
        </div>

        <!-- Configuración de filtros para exportar -->
        <div class="export-form-grid">
          <div class="control-group">
            <label for="exp-section">Sección / Aula:</label>
            <select id="exp-section" v-model="exportSectionId" class="form-select">
              <option value="">Todas las secciones asignadas</option>
              <option v-for="sec in sectionsList" :key="sec.id" :value="sec.id">
                {{ sec.name }}
              </option>
            </select>
          </div>

          <div class="control-group">
            <label for="exp-start">Fecha desde:</label>
            <input id="exp-start" v-model="exportStartDate" type="date" class="form-input" />
          </div>

          <div class="control-group">
            <label for="exp-end">Fecha hasta:</label>
            <input id="exp-end" v-model="exportEndDate" type="date" class="form-input" />
          </div>
        </div>

        <!-- Contador y botón de descarga (Escenarios 2, 3 y 4 de FE-36) -->
        <div class="export-actions-bar">
          <div class="counter-badge">
            <span class="counter-label">Registros coincidentes:</span>
            <span class="counter-number">{{ exportMatchingCount }}</span>
          </div>

          <button
            type="button"
            class="btn btn--primary btn--download"
            :disabled="isExporting || exportMatchingCount === 0"
            @click="handleExportFiltered"
          >
            <Download :size="18" />
            <span>{{ isExporting ? 'Generando descarga...' : `Descargar Hoja (${exportMatchingCount} registros)` }}</span>
          </button>
        </div>

        <p v-if="exportMatchingCount === 0" class="no-data-hint">
          El botón de exportación se deshabilita automáticamente porque no hay registros coincidentes para exportar (FE-36 Escenario 4).
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-reports {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Pestañas superiores */
.report-tabs-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  padding-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.tabs-group {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 10px;
  padding: 0.25rem;
  gap: 0.25rem;
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: #ffffff;
  color: var(--primary, #1e5e4c);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.btn-print {
  height: 40px;
  padding: 0 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-print:hover {
  background-color: #f8fafc;
  border-color: var(--primary, #1e5e4c);
  color: var(--primary, #1e5e4c);
}

/* Barra de controles */
.controls-bar {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-item label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.form-select,
.form-input {
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  background: #ffffff;
  color: #0f172a;
  outline: none;
}

.form-select:focus,
.form-input:focus {
  border-color: var(--primary, #1e5e4c);
}

.btn-action-excel,
.btn-action-print {
  margin-left: auto;
  height: 38px;
  padding: 0 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  cursor: pointer;
}

.btn-action-excel {
  background-color: #15803d;
  color: #ffffff;
}

.btn-action-excel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action-print {
  background-color: var(--primary, #1e5e4c);
  color: #ffffff;
}

/* Cabecera Oficial de Documento */
.official-doc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--primary, #1e5e4c);
}

.program-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary, #1e5e4c);
}

.official-doc-header h2 {
  margin: 0.25rem 0 0.35rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.doc-meta {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.print-timestamp {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.8rem;
  color: #64748b;
}

/* Tarjetas de Métricas */
.metrics-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 900px) {
  .metrics-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.metric-card {
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
}

.metric-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
}

.metric-unit {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Secciones de informe */
.report-section-card {
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.section-card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.section-explanation {
  margin: 0 0 1.25rem 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

/* Barras de distribución */
.bands-progress-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.band-progress-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.band-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.band-stats {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.progress-bar-track {
  width: 100%;
  height: 12px;
  background-color: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.fill-advanced {
  background-color: #22c55e;
}

.fill-normal {
  background-color: #38bdf8;
}

.fill-support {
  background-color: #ef4444;
}

/* Progreso */
.progress-metric-box {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
}

.progress-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
}

.progress-big {
  font-size: 2rem;
  font-weight: 700;
  color: #15803d;
}

.progress-sub {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
}

.progress-description {
  margin: 0;
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.5;
}

/* Tarjeta vacía */
.empty-report-card {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #64748b;
}

.empty-report-icon {
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

/* Ficha Alumno */
.student-doc-sheet {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
}

.student-info-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.info-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  color: #64748b;
}

.info-value {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.doc-block {
  margin-bottom: 1.75rem;
}

.block-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #e2e8f0;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
}

.doc-table th {
  background-color: #f8fafc;
  padding: 0.65rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.doc-table td {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.data-insufficient-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.status-pill {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}

.status--completed {
  background-color: #dcfce7;
  color: #15803d;
}

.status--active {
  background-color: #e0f2fe;
  color: #0369a1;
}

.doc-signatures {
  display: flex;
  justify-content: space-around;
  margin-top: 3rem;
  padding-top: 1rem;
}

.sig-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
}

.sig-role {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 3.5rem;
}

.sig-line {
  width: 100%;
  border-top: 1px solid #94a3b8;
}

/* Export Card */
.export-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
}

.export-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.export-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(30, 94, 76, 0.1);
  color: var(--primary, #1e5e4c);
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-card-header h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
}

.export-card-header p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

.export-form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .export-form-grid {
    grid-template-columns: 1fr;
  }
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.control-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.export-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;
}

.counter-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.counter-label {
  font-size: 0.85rem;
  color: #64748b;
}

.counter-number {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary, #1e5e4c);
}

.btn--download {
  height: 44px;
  padding: 0 1.5rem;
}

.no-data-hint {
  margin: 0.75rem 0 0 0;
  font-size: 0.8rem;
  color: #dc2626;
}

.badge-band {
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.band-avanzado {
  background-color: #dcfce7;
  color: #15803d;
}

.band-en-nivel {
  background-color: #e0f2fe;
  color: #0369a1;
}

.band-requiere-apoyo {
  background-color: #fee2e2;
  color: #b91c1c;
}

.text-primary {
  color: var(--primary, #1e5e4c);
}

.text-center {
  text-align: center;
}

.btn {
  height: 44px;
  padding: 0 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primary {
  background-color: var(--primary, #1e5e4c);
  color: #ffffff;
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--primary-hover, #164638);
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

/* ============================================================= */
/* REGLAS DE IMPRESIÓN A4 (FE-37 Escenario 2) */
/* ============================================================= */
@media print {
  .no-print {
    display: none !important;
  }

  .view-reports {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }

  .student-doc-sheet,
  .report-container {
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  .report-section-card,
  .metric-card,
  .doc-block {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
}
</style>
