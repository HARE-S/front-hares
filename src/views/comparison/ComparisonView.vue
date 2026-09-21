<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { BarChart3, School, Layers, Info } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { getCenters, getCenterSections } from '@/services/directoryService';
import { getGroupComparison } from '@/services/comparisonService';
import { getGroupProgress } from '@/services/sectionsService';
import GroupComparisonChart from '@/components/domain/GroupComparisonChart.vue';
import StateBlock from '@/components/ui/StateBlock.vue';
import { formatPPM, formatPercent } from '@/utils/format';
import { ForbiddenError } from '@/services/api';

const { user } = useAuth();

const groupBy = ref('section');
const selectedCenterId = ref(null);
const sectionIds = ref([]);
const centerIds = ref([]);
const profileCenterId = ref(null);
const minSample = ref('');
const startDate = ref('');
const endDate = ref('');

const centers = ref([]);
const sections = ref([]);
const centersLoading = ref(false);
const sectionsLoading = ref(false);

const comparison = ref(null);
const progressMap = ref({});
const loading = ref(false);
const errorState = ref(null); // null | 'error' | 'forbidden'
const errorMessage = ref('');
const validationMessage = ref('');

/** Alcance por rol (FE-32 Escenario 6): el tutor no compara centros completos. */
const isTutor = computed(() => user.value?.role === 'tutor');

const tutorSectionIds = computed(() => {
  const secs = user.value?.sections;
  if (!Array.isArray(secs)) return new Set();
  return new Set(secs.map((s) => (typeof s === 'string' ? s : s.id)));
});

const availableGroupBys = computed(() =>
  isTutor.value ? ['section', 'profile'] : ['section', 'center', 'profile']
);

const GROUP_BY_LABELS = {
  section: 'Secciones',
  center: 'Centros',
  profile: 'Perfiles'
};

const filterableSections = computed(() => {
  if (!isTutor.value || tutorSectionIds.value.size === 0) return sections.value;
  return sections.value.filter((s) => tutorSectionIds.value.has(s.id));
});

const title = computed(() => {
  switch (groupBy.value) {
    case 'center':
      return 'Comparativa por centros';
    case 'profile':
      return 'Comparativa por perfiles';
    default:
      return 'Comparativa por secciones';
  }
});

const subtitle = computed(() => {
  if (isTutor.value) {
    return 'Compara la evolución media de tus secciones. Tu alcance son tus secciones, no los centros completos.';
  }
  return 'Compara la evolución media entre secciones, centros o perfiles (sector): PPM, comprensión y tamaño de muestra.';
});

const comparisonLabel = computed(() => {
  const key = comparison.value?.group_by;
  return GROUP_BY_LABELS[key] || GROUP_BY_LABELS.section;
});

async function loadCenters() {
  centersLoading.value = true;
  try {
    centers.value = await getCenters();
  } catch {
    centers.value = [];
  } finally {
    centersLoading.value = false;
  }
}

async function onCenterChange() {
  sectionIds.value = [];
  sections.value = [];
  if (!selectedCenterId.value) return;
  sectionsLoading.value = true;
  try {
    sections.value = await getCenterSections(selectedCenterId.value);
  } catch {
    sections.value = [];
  } finally {
    sectionsLoading.value = false;
  }
}

function toggleSection(id) {
  sectionIds.value = sectionIds.value.includes(id)
    ? sectionIds.value.filter((x) => x !== id)
    : [...sectionIds.value, id];
}

function toggleCenter(id) {
  centerIds.value = centerIds.value.includes(id)
    ? centerIds.value.filter((x) => x !== id)
    : [...centerIds.value, id];
}

function validateFilters() {
  if (groupBy.value === 'section') {
    if (!selectedCenterId.value) return 'Selecciona un centro para comparar sus secciones.';
    if (sectionIds.value.length < 2) return 'Selecciona al menos dos secciones para generar una comparativa (escenario 1).';
  }
  if (groupBy.value === 'center' && centerIds.value.length < 2) {
    return 'Selecciona al menos dos centros para generar una comparativa.';
  }
  return '';
}

async function runComparison() {
  const invalid = validateFilters();
  validationMessage.value = invalid;
  if (invalid) return;

  loading.value = true;
  errorState.value = null;
  comparison.value = null;
  progressMap.value = {};

  try {
    const centerId =
      groupBy.value === 'section'
        ? selectedCenterId.value
        : groupBy.value === 'profile'
          ? profileCenterId.value
          : null;

    const resp = await getGroupComparison({
      groupBy: groupBy.value,
      sectionIds: groupBy.value === 'section' ? sectionIds.value : [],
      centerId: centerId || null,
      minSample: minSample.value || null,
      startDate: startDate.value || null,
      endDate: endDate.value || null
    });

    comparison.value = resp;

    if (groupBy.value === 'section') {
      await loadProgress(resp.groups);
    }
  } catch (err) {
    if (err instanceof ForbiddenError) {
      errorState.value = 'forbidden';
    } else {
      errorState.value = 'error';
      errorMessage.value = err?.message || 'No se pudo generar la comparativa.';
    }
  } finally {
    loading.value = false;
  }
}

/**
 * Progreso por recuento (FE-32 Escenario 5): cuántos alumnos MEJORAN entre
 * pruebas consecutivas y en qué porcentaje (nunca la media de diferencias).
 * Fuente: BE-31 / FE-29 (`/pair-metrics/sections/{id}/group-progress`),
 * disponible por sección.
 */
async function loadProgress(groups) {
  const withData = groups.filter((g) => g.has_data);
  for (const group of withData) {
    try {
      const resp = await getGroupProgress(group.id);
      progressMap.value[group.id] = resp?.global || null;
    } catch {
      progressMap.value[group.id] = null;
    }
  }
}

function groupStatus(group) {
  if (!group.has_data) return 'no-data';
  if (!group.is_representative) return 'not-representative';
  return 'ok';
}

function statusLabel(group) {
  switch (groupStatus(group)) {
    case 'no-data':
      return 'Sin datos';
    case 'not-representative':
      return 'Poco representativo';
    default:
      return 'Representativo';
  }
}

function progressText(group) {
  const info = progressMap.value[group.id];
  if (!info) return '—';
  if (!info.measurable) return 'Sin datos suficientes';
  const pct = info.percentage != null ? ` (${Math.round(info.percentage)}%)` : '';
  return `${info.improved} de ${info.measurable} alumnos mejoran${pct}`;
}

function resetSelections() {
  sectionIds.value = [];
  centerIds.value = [];
  comparison.value = null;
  errorState.value = null;
  validationMessage.value = '';
}

watch(groupBy, resetSelections);

onMounted(loadCenters);
</script>

<template>
  <div class="comparison-view">
    <header class="header">
      <nav class="breadcrumb" aria-label="Migas de pan">
        <span>Alumnado</span>
        <span class="sep">/</span>
        <span class="crumb current">Comparativa por grupos</span>
      </nav>
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </header>

    <div v-if="isTutor" class="banner banner--tutor" role="note">
      <Info :size="16" aria-hidden="true" />
      <span data-testid="tutor-scope-note">
        Tu alcance son tus secciones: la comparativa entre centros completos no está disponible para tu rol (FE-32 Escenario 6).
      </span>
    </div>

    <section class="selector card" aria-label="Selector de comparativa">
      <fieldset class="groupby-field">
        <legend>Agrupar por</legend>
        <div class="groupby-options">
          <label
            v-for="option in availableGroupBys"
            :key="option"
            class="groupby-option"
          >
            <input
              type="radio"
              name="groupBy"
              :value="option"
              v-model="groupBy"
              data-testid="groupby-option"
            />
            <component
              :is="option === 'center' ? School : option === 'profile' ? Layers : BarChart3"
              :size="16"
              aria-hidden="true"
            />
            <span>{{ GROUP_BY_LABELS[option] }}</span>
          </label>
        </div>
      </fieldset>

      <!-- Modo secciones -->
      <div v-if="groupBy === 'section'" class="panel" data-testid="section-panel">
        <div class="field">
          <label class="label" for="center-select">Centro</label>
          <select
            id="center-select"
            v-model="selectedCenterId"
            class="input"
            data-testid="center-select"
            @change="onCenterChange"
          >
            <option value="" disabled>Selecciona un centro</option>
            <option v-for="center in centers" :key="center.id" :value="center.id">
              {{ center.name }}
            </option>
          </select>
        </div>

        <div v-if="selectedCenterId" class="field">
          <span class="label">Secciones a comparar (mínimo 2)</span>
          <div v-if="sectionsLoading" class="muted">Cargando secciones...</div>
          <div v-else-if="filterableSections.length === 0" class="muted">
            No hay secciones disponibles.
          </div>
          <div v-else class="checkbox-grid">
            <label
              v-for="section in filterableSections"
              :key="section.id"
              class="checkbox-option"
            >
              <input
                type="checkbox"
                :checked="sectionIds.includes(section.id)"
                :data-testid="`section-check-${section.id}`"
                @change="toggleSection(section.id)"
              />
              <span>{{ section.name }}</span>
            </label>
          </div>
          <p v-if="isTutor" class="muted">
            Solo puedes comparar las secciones asignadas a tu usuario.
          </p>
        </div>
      </div>

      <!-- Modo centros -->
      <div v-else-if="groupBy === 'center'" class="panel" data-testid="center-panel">
        <div class="field">
          <span class="label">Centros a comparar (mínimo 2)</span>
          <div v-if="centersLoading" class="muted">Cargando centros...</div>
          <div v-else class="checkbox-grid">
            <label v-for="center in centers" :key="center.id" class="checkbox-option">
              <input
                type="checkbox"
                :checked="centerIds.includes(center.id)"
                :data-testid="`center-check-${center.id}`"
                @change="toggleCenter(center.id)"
              />
              <span>{{ center.name }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Modo perfiles -->
      <div v-else class="panel" data-testid="profile-panel">
        <p class="muted">
          Se comparan los perfiles por sector (Funcional / Literario / Sin perfil) del alumnado con resultados.
        </p>
        <div class="field">
          <label class="label" for="profile-center-select">Acotar a un centro (opcional)</label>
          <select
            id="profile-center-select"
            v-model="profileCenterId"
            class="input"
            data-testid="profile-center-select"
          >
            <option :value="null">Todos los centros</option>
            <option v-for="center in centers" :key="center.id" :value="center.id">
              {{ center.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Opciones de la consulta -->
      <div class="options-row">
        <div class="field">
          <label class="label" for="min-sample">Mínimo de alumnos (representatividad)</label>
          <input
            id="min-sample"
            v-model="minSample"
            type="number"
            min="1"
            class="input input--sm"
            data-testid="min-sample-input"
          />
        </div>
        <div class="field">
          <label class="label" for="start-date">Desde</label>
          <input
            id="start-date"
            v-model="startDate"
            type="date"
            class="input input--sm"
            data-testid="start-date-input"
          />
        </div>
        <div class="field">
          <label class="label" for="end-date">Hasta</label>
          <input
            id="end-date"
            v-model="endDate"
            type="date"
            class="input input--sm"
            data-testid="end-date-input"
          />
        </div>
        <button type="button" class="btn btn-primary" data-testid="run-comparison" @click="runComparison">
          <BarChart3 :size="16" aria-hidden="true" />
          Generar comparativa
        </button>
      </div>

      <p v-if="validationMessage" class="form-error" data-testid="validation-message" role="alert">
        {{ validationMessage }}
      </p>
    </section>

    <!-- Estados -->
    <StateBlock v-if="loading" state="loading" skeleton="card" data-testid="comparison-loading" />

    <StateBlock
      v-else-if="errorState === 'forbidden'"
      state="forbidden"
      data-testid="comparison-forbidden"
    />

    <StateBlock
      v-else-if="errorState === 'error'"
      state="error"
      :message="errorMessage || 'No se pudo generar la comparativa.'"
      data-testid="comparison-error"
      @retry="runComparison"
    />

    <StateBlock
      v-else-if="comparison && comparison.groups.length === 0"
      state="empty"
      title="No hay grupos que comparar"
      message="No existe ningún grupo con los criterios seleccionados."
      data-testid="comparison-empty"
    />

    <!-- Resultados -->
    <div v-else-if="comparison" class="results" data-testid="comparison-results">
      <p class="meta">
        Comparando por <strong>{{ comparisonLabel }}</strong> · Mínimo de alumnos para una media representativa:
        <strong data-testid="min-sample-value">{{ comparison.min_sample }}</strong>.
      </p>

      <GroupComparisonChart :groups="comparison.groups" data-testid="comparison-chart" />

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Media PPM</th>
              <th>Comprensión (%)</th>
              <th>Alumnos</th>
              <th>Pruebas</th>
              <th v-if="groupBy === 'section'">Progreso</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="group in comparison.groups"
              :key="group.id"
              data-testid="group-row"
            >
              <td>
                <span class="group-name">{{ group.name }}</span>
                <span v-if="group.center_name" class="group-center">{{ group.center_name }}</span>
              </td>
              <td data-testid="group-ppm">{{ group.has_data ? formatPPM(group.mean_ppm) : '-' }}</td>
              <td data-testid="group-accuracy">{{ group.has_data ? formatPercent(group.mean_accuracy) : '-' }}</td>
              <td data-testid="group-students">{{ group.students_count }}</td>
              <td data-testid="group-results">{{ group.results_count }}</td>
              <td v-if="groupBy === 'section'" data-testid="group-progress">
                {{ progressText(group) }}
              </td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'badge--no-data': groupStatus(group) === 'no-data',
                    'badge--warning': groupStatus(group) === 'not-representative',
                    'badge--ok': groupStatus(group) === 'ok'
                  }"
                  :data-testid="`group-status-${groupStatus(group)}`"
                  :title="group.warning || statusLabel(group)"
                >
                  {{ statusLabel(group) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="groupBy !== 'section'" class="source-note">
        El progreso por recuento (alumnos que mejoran) solo está disponible comparando secciones.
      </p>
    </div>
  </div>
</template>

<style scoped>
.comparison-view {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.header h1 {
  margin: 0;
  color: var(--on-surface);
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: var(--on-surface-variant);
  font-size: 0.95rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--on-surface-variant);
}

.breadcrumb .sep {
  color: var(--outline);
}

.crumb.current {
  color: var(--secondary);
  font-weight: 600;
}

.banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.banner--tutor {
  background-color: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  color: var(--on-surface-variant);
}

.card {
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.selecter {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.groupby-field {
  border: none;
  margin: 0;
  padding: 0;
}

.groupby-field legend {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.groupby-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.groupby-option {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--on-surface);
  background-color: var(--surface-container-low);
}

.groupby-option:has(input:checked) {
  background-color: var(--primary-container);
  border-color: var(--secondary);
  font-weight: 600;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-top: 0.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field .label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--on-surface);
}

.input {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--outline);
  border-radius: var(--radius-md);
  background-color: var(--surface-container-lowest);
  color: var(--on-surface);
  font-size: 0.9rem;
}

.input--sm {
  max-width: 140px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.5rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
}

.muted {
  margin: 0;
  font-size: 0.85rem;
  color: var(--on-surface-variant);
}

.options-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid var(--outline-variant);
}

.options-row .btn {
  margin-left: auto;
}

.form-error {
  margin: 0;
  color: var(--danger-text);
  font-size: 0.875rem;
  font-weight: 500;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.meta {
  margin: 0;
  font-size: 0.875rem;
  color: var(--on-surface-variant);
}

.meta strong {
  color: var(--on-surface);
}

.table-wrapper {
  background-color: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th, td {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--outline-variant);
}

th {
  background-color: var(--surface-container-low);
  font-weight: 600;
  color: var(--on-surface);
  font-size: 0.78rem;
  text-transform: uppercase;
}

tr:last-child td {
  border-bottom: none;
}

.group-name {
  display: block;
  font-weight: 600;
  color: var(--on-surface);
}

.group-center {
  display: block;
  font-size: 0.78rem;
  color: var(--on-surface-variant);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge--ok {
  background-color: var(--primary-container);
  color: var(--secondary);
}

.badge--warning {
  background-color: rgba(245, 158, 11, 0.18);
  color: #92400e;
}

.badge--no-data {
  background-color: var(--surface-container-high);
  color: var(--on-surface-variant);
}

.source-note {
  margin: 0;
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  font-style: italic;
}
</style>