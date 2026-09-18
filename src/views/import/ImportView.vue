<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import StateBlock from '@/components/ui/StateBlock.vue';
import {
  uploadImport,
  confirmImport,
  downloadImportReport,
} from '@/services/importService';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-vue-next';

const { user } = useAuth();
const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'superadmin');

const activeTab = ref('import'); // 'import' | 'report'

// ——— Estado de la importación ———
const stage = ref('idle'); // 'idle' | 'preview' | 'loading' | 'confirming' | 'done'
const selectedFile = ref(null);
const fileError = ref('');
const preview = ref(null);
const uploading = ref(false);
const confirming = ref(false);
const summary = ref(null);
const error = ref(null);

const previewRows = computed(() => preview.value?.preview || []);
const previewColumns = [
  { key: 'student_id', label: 'Identificador' },
  { key: 'student_name', label: 'Nombre' },
  { key: 'sections', label: 'Secciones' },
  { key: 'center', label: 'Centro' },
];

function allowedExtensions() {
  return preview.value?.allowed_extensions || ['.csv'];
}

function maxBytes() {
  return preview.value?.max_bytes ?? 10 * 1024 * 1024;
}

const fileExtension = computed(() => {
  if (!selectedFile.value?.name) return '';
  const dot = selectedFile.value.name.lastIndexOf('.');
  return dot === -1 ? '' : selectedFile.value.name.slice(dot).toLowerCase();
});

/* ——— Escenario 4 y 5 (FE-23): validación ANTES de subir ——— */
function validateFile(file) {
  if (!file) return 'Selecciona un fichero CSV para importar.';

  if (!allowedExtensions().includes(fileExtension.value)) {
    return `Extensión no permitida. Extensiones válidas: ${allowedExtensions().join(', ')}.`;
  }

  if (file.size > maxBytes()) {
    const mb = Math.round(maxBytes() / (1024 * 1024));
    return `El fichero supera el tamaño máximo permitido (${mb} MB).`;
  }

  return '';
}

function onFileChange(event) {
  const file = event.target.files?.[0] || null;
  selectedFile.value = file;
  stage.value = 'idle';
  preview.value = null;
  summary.value = null;
  error.value = null;
  fileError.value = file ? validateFile(file) : '';
}

/* ——— Escenario 1 (FE-23): previsualización sin escribir en BD ——— */
async function handleUpload() {
  const validation = selectedFile.value ? validateFile(selectedFile.value) : 'Selecciona un fichero CSV para importar.';
  if (validation) {
    fileError.value = validation;
    return;
  }

  uploading.value = true;
  stage.value = 'loading';
  fileError.value = '';
  error.value = null;

  try {
    preview.value = await uploadImport(selectedFile.value);
    stage.value = 'preview';
  } catch (err) {
    stage.value = 'idle';
    error.value = { message: err.message, status: err.status };
  } finally {
    uploading.value = false;
  }
}

/* ——— Escenario 2 y 3 (FE-23): confirmar con progreso ——— */
async function handleConfirm() {
  if (!preview.value?.token) return;

  confirming.value = true;
  stage.value = 'confirming';
  error.value = null;

  try {
    const res = await confirmImport(preview.value.token);
    summary.value = res.summary;
    loadReport();
    stage.value = 'done';
  } catch (err) {
    error.value = { message: err.message, status: err.status };
    stage.value = 'preview';
  } finally {
    confirming.value = false;
  }
}

function resetImport() {
  stage.value = 'idle';
  selectedFile.value = null;
  preview.value = null;
  summary.value = null;
  error.value = null;
  fileError.value = '';
}

/* ——— Informe de errores (FE-24) ——— */
const reportRows = ref([]);
const reportLoading = ref(false);
const reportError = ref(null);
const page = ref(1);
const pageSize = 10;

const totalPages = computed(() => Math.max(1, Math.ceil(reportRows.value.length / pageSize)));
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return reportRows.value.slice(start, start + pageSize);
});

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  return lines.slice(1).map((line) => {
    const [linea, columna, motivo] = line.split(';');
    return { linea: linea || '—', columna: columna || '—', motivo: motivo || '—' };
  });
}

async function loadReport() {
  reportLoading.value = true;
  reportError.value = null;
  try {
    const res = await downloadImportReport();
    reportRows.value = parseCsv(res.text);
    page.value = 1;
  } catch (err) {
    reportError.value = { message: err.message, status: err.status };
  } finally {
    reportLoading.value = false;
  }
}

async function handleDownload() {
  try {
    const res = await downloadImportReport();
    const blob = new Blob([res.text], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    reportError.value = { message: err.message, status: err.status };
  }
}

function goToReportTab() {
  activeTab.value = 'report';
  if (reportRows.value.length === 0 && !reportError.value) loadReport();
}

onMounted(() => {
  if (activeTab.value === 'report') loadReport();
});
</script>

<template>
  <div class="import-view">
    <div class="view-header">
      <div class="view-titles">
        <h1 class="page-title">Importación del volcado de Alexia</h1>
        <p class="page-subtitle">
          Sube el fichero de alumnado, previsualízalo y confirma. Los datos proceden de Alexia y se mantienen allí.
        </p>
      </div>
    </div>

    <!-- Escenario 6 (FE-23): usuario sin permiso -->
    <StateBlock v-if="!isAdmin" state="forbidden" />

    <div v-else>
      <div class="view-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'import' }"
          @click="activeTab = 'import'"
        >
          <Upload :size="18" aria-hidden="true" />
          <span>Importar</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'report' }"
          @click="goToReportTab"
        >
          <FileText :size="18" aria-hidden="true" />
          <span>Informe de errores ({{ reportRows.length }})</span>
        </button>
      </div>

      <!-- ═════════════ TAB 1: IMPORTAR (FE-23) ═════════════ -->
      <div v-if="activeTab === 'import'" class="tab-panel">
        <div v-if="error" class="alert alert-danger" role="alert">
          <AlertTriangle :size="18" aria-hidden="true" />
          <span>{{ error.message }}</span>
        </div>

        <div v-if="summary" class="alert alert-success" role="status">
          <CheckCircle2 :size="18" aria-hidden="true" />
          <span>
            Importación completada: {{ summary.students_created }} creados,
            {{ summary.students_updated }} actualizados,
            {{ summary.errors }} errores.
          </span>
        </div>

        <!-- Paso 1: selector de fichero -->
        <section class="flat-card import-step">
          <div class="flat-card-header">
            <h2 class="step-title">1. Selecciona el fichero CSV</h2>
          </div>
          <div class="step-body">
            <label class="file-picker" :class="{ 'file-picker--error': fileError }">
              <Upload :size="22" aria-hidden="true" />
              <span class="file-picker__text">
                {{ selectedFile ? selectedFile.name : 'Pulsa para elegir el volcado de Alexia (.csv)' }}
              </span>
              <input
                type="file"
                accept=".csv"
                :disabled="uploading || confirming"
                @change="onFileChange"
              />
            </label>
            <p v-if="fileError" class="form-hint file-error">{{ fileError }}</p>
            <p v-else class="form-hint">
              Extensiones válidas: {{ allowedExtensions().join(', ') }} · Máximo {{ Math.round(maxBytes() / (1024 * 1024)) }} MB
            </p>

            <button
              v-if="selectedFile && !preview"
              type="button"
              class="btn btn-primary"
              :disabled="uploading"
              @click="handleUpload"
            >
              <Loader2 v-if="uploading" class="spinning" :size="16" aria-hidden="true" />
              <Upload v-else :size="16" aria-hidden="true" />
              <span>Previsualizar (no escribe en la base de datos)</span>
            </button>
          </div>
        </section>

        <!-- Paso 2: previsualización (Escenario 1) -->
        <section v-if="stage === 'preview' || stage === 'confirming'" class="flat-card import-step">
          <div class="flat-card-header">
            <h2 class="step-title">2. Previsualización</h2>
            <span class="badge">{{ preview?.total_rows }} filas · {{ preview?.errors }} errores</span>
          </div>
          <div class="step-body">
            <p class="form-hint">
              Se muestran las primeras filas interpretadas. <strong>Todavía no se ha escrito nada en la base de datos.</strong>
            </p>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th v-for="col in previewColumns" :key="col.key">{{ col.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in previewRows" :key="index">
                    <td>{{ row.student_id }}</td>
                    <td>{{ row.student_name }}</td>
                    <td>{{ Array.isArray(row.sections) ? row.sections.join(', ') : (row.sections || '—') }}</td>
                    <td>{{ row.center || '—' }}</td>
                  </tr>
                  <tr v-if="previewRows.length === 0">
                    <td :colspan="previewColumns.length" class="tb-empty">
                      <Inbox :size="16" aria-hidden="true" /> Sin filas para previsualizar
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="preview?.error_details?.length" class="notice notice--warn">
              <AlertTriangle :size="16" aria-hidden="true" />
              <div>
                <strong>{{ preview.errors }} fila(s) con errores detectados.</strong>
                <ul>
                  <li v-for="(detail, i) in preview.error_details" :key="i">
                    Línea {{ detail.line }}: {{ detail.reason }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="step-actions">
              <button type="button" class="btn btn-secondary" :disabled="confirming" @click="resetImport">
                Elegir otro fichero
              </button>
              <button
                type="button"
                class="btn btn-primary"
                :disabled="confirming"
                @click="handleConfirm"
              >
                <Loader2 v-if="confirming" class="spinning" :size="16" aria-hidden="true" />
                <CheckCircle2 v-else :size="16" aria-hidden="true" />
                <span>{{ confirming ? 'Importando…' : 'Confirmar importación' }}</span>
              </button>
            </div>

            <!-- Escenario 5 (FE-23): si el proceso tarda, el botón queda deshabilitado -->
            <p v-if="confirming" class="form-hint" role="status">El proceso puede tardar unos segundos. No cierres la pestaña.</p>
          </div>
        </section>
      </div>

      <!-- ═════════════ TAB 2: INFORME DE ERRORES (FE-24) ═════════════ -->
      <div v-if="activeTab === 'report'" class="tab-panel">
        <div v-if="reportError" class="alert alert-danger" role="alert">
          <AlertTriangle :size="18" aria-hidden="true" />
          <span>{{ reportError.message }}</span>
        </div>

        <StateBlock v-else-if="reportLoading" state="loading" skeleton="table" />

        <template v-else>
          <div class="notice notice--info">
            <CheckCircle2 :size="16" aria-hidden="true" />
            <span>
              Lo que era válido ya está importado. Solo hay que corregir lo señalado; no hace falta repetir el fichero completo.
            </span>
          </div>

          <section class="flat-card import-step">
            <div class="flat-card-header">
              <h2 class="step-title">Errores de la última importación</h2>
              <div class="step-actions">
                <button type="button" class="btn btn-secondary btn-sm" @click="handleDownload">
                  <Download :size="16" aria-hidden="true" />
                  <span>Descargar informe</span>
                </button>
              </div>
            </div>

            <div v-if="reportRows.length === 0" class="step-body empty-report">
              <StateBlock state="empty" title="Sin errores" message="La última importación no tuvo ninguna fila rechazada.">
                <button type="button" class="btn btn-primary btn-sm" @click="activeTab = 'import'">
                  Volver a importar
                </button>
              </StateBlock>
            </div>

            <template v-else>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th class="th-left">Línea</th>
                      <th class="th-left">Columna</th>
                      <th class="th-left">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in pagedRows" :key="i">
                      <td class="tabular-data">{{ row.linea }}</td>
                      <td>{{ row.columna }}</td>
                      <td>{{ row.motivo }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Escenario 5 (FE-24): paginación para volúmenes grandes -->
              <div v-if="totalPages > 1" class="pagination">
                <button type="button" class="btn btn-secondary btn-sm pagination__btn" :disabled="page <= 1" @click="page--">
                  <ChevronLeft :size="16" aria-hidden="true" />
                  Anterior
                </button>
                <span class="pagination__info">
                  Página {{ page }} de {{ totalPages }} · {{ reportRows.length }} errores
                </span>
                <button type="button" class="btn btn-secondary btn-sm pagination__btn" :disabled="page >= totalPages" @click="page++">
                  Siguiente
                  <ChevronRight :size="16" aria-hidden="true" />
                </button>
              </div>
            </template>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.view-titles h1 {
  margin: 0 0 0.35rem;
  color: var(--green-950, #123622);
  font-size: 1.5rem;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  color: var(--gray-600, #55625a);
  font-size: 0.9rem;
}

.view-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border: 1px solid var(--gray-300, #d5ddd6);
  border-radius: var(--radius-md, 0.5rem);
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700, #3b463f);
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: var(--green-700, #157347);
  color: #fff;
  border-color: var(--green-700, #157347);
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.import-step {
  border: 1px solid var(--gray-300, #d5ddd6);
  border-radius: var(--radius-xl, 0.75rem);
  background: #fff;
  overflow: hidden;
}

.flat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-200, #e9eeea);
  flex-wrap: wrap;
}

.step-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--green-950, #123622);
}

.step-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.file-picker {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 1rem;
  border: 1.5px dashed var(--gray-400, #b9c4bd);
  border-radius: var(--radius-md, 0.5rem);
  cursor: pointer;
  color: var(--gray-600, #55625a);
  font-size: 0.9rem;
  transition: border-color 0.15s ease;
}

.file-picker:hover {
  border-color: var(--green-700, #157347);
}

.file-picker--error {
  border-color: var(--error, #c62828);
  color: var(--error, #c62828);
}

.file-picker input[type='file'] {
  display: none;
}

.file-error {
  color: var(--error, #c62828);
  font-weight: 600;
}

.step-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.notice {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  border-radius: var(--radius-md, 0.5rem);
  font-size: 0.875rem;
  line-height: 1.5;
}

.notice--warn {
  background: var(--warning-bg, #fff8e1);
  border: 1px solid var(--warning-border, #f5c518);
  color: var(--warning-text, #7a5c00);
}

.notice--info {
  background: var(--info-bg, #e8f4ff);
  border: 1px solid var(--info-border, #90caf9);
  color: var(--info-text, #0d3c61);
}

.notice ul {
  margin: 0.4rem 0 0;
  padding-left: 1.1rem;
}

.table-container {
  background-color: #fff;
  border: 1px solid var(--gray-300, #d5ddd6);
  border-radius: var(--radius-md, 0.5rem);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table thead tr {
  background-color: var(--green-50, #f0f7f2);
  border-bottom: 1px solid rgba(189, 201, 192, 0.3);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-600, #55625a);
  font-weight: 700;
}

.data-table th,
.data-table td {
  padding: 0.85rem 1rem;
  vertical-align: middle;
  font-size: 0.875rem;
}

.data-table tbody tr {
  border-bottom: 1px solid rgba(189, 201, 192, 0.2);
}

.tb-empty {
  color: var(--gray-500, #7a857e);
  font-style: italic;
  text-align: center;
  padding: 1.5rem;
}

.th-left {
  text-align: left;
}

.empty-report {
  align-items: center;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  flex-wrap: wrap;
}

.pagination__info {
  font-size: 0.85rem;
  color: var(--gray-600, #55625a);
}

.spinning {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>