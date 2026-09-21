<script setup>
import { ref, computed } from 'vue';
import { X, Clock, BookOpen, User, Users, CheckCircle2, AlertCircle, FileText } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  students: {
    type: Array,
    default: () => []
  },
  tests: {
    type: Array,
    default: () => []
  },
  studentTests: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'create']);

const showTestHistory = ref(false);
const selectedStudentForHistory = ref(null);
const batchMode = ref(false);
const showBatchHistory = ref(false);
const batchHistoryStudent = ref(null);

const testSelected = ref('');
const dateSelected = ref(new Date().toISOString().split('T')[0]);
const notesShared = ref('');
const sectionSelected = ref('');

const batchStudents = ref({});

const form = ref({
  studentId: '',
  testId: '',
  date: new Date().toISOString().split('T')[0],
  time: '00:00',
  hits: '',
  errors: '',
  notes: ''
});

const defaultStudents = [
  { id: 1, name: 'Lucas Méndez Ruiz', level: 'Avanzado' },
  { id: 2, name: 'Sofía Navarro Ortiz', level: 'En nivel' },
  { id: 3, name: 'Mateo Barrenechea', level: 'Requiere apoyo' },
  { id: 4, name: 'Aitana Zubizarreta', level: 'En nivel' },
  { id: 5, name: 'Sofía Navarro Ortiz', level: 'En nivel' },
  { id: 6, name: 'Aitana Zubizarreta', level: 'En nivel' },
  { id: 7, name: 'Alejandro López', level: 'Normal' },
  { id: 8, name: 'Marina González', level: 'Normal' },
  { id: 9, name: 'Diego Martínez', level: 'Normal' },
  { id: 10, name: 'Elena Ruiz', level: 'Requiere apoyo' }
];

const defaultTests = [
  { id: '1IF', code: '1IF', title: 'La Vaca', course: 1 },
  { id: '1AF', code: '1AF', title: 'El Patito Feo', course: 1 },
  { id: '2BL', code: '2BL', title: 'El Príncipe Feliz', course: 2 },
  { id: '3AF', code: '3AF', title: 'El bosque animado', course: 3 }
];

const studentList = computed(() => props.students && props.students.length > 0 ? props.students : defaultStudents);
const testList = computed(() => props.tests && props.tests.length > 0 ? props.tests : defaultTests);

const sections = computed(() => {
  const uniqueSections = new Set(studentList.value.map(s => s.section));
  return Array.from(uniqueSections).sort();
});

const filteredStudents = computed(() => {
  if (!sectionSelected.value) return [];
  return studentList.value.filter(s => s.section === sectionSelected.value);
});

const studentHasTest = (studentId, testId) => {
  return props.studentTests[studentId]?.some(t => t.code === testId || t.id === testId) || false;
};

const studentTestHistory = computed(() => {
  if (!form.value.studentId || !props.studentTests[form.value.studentId]) {
    return [];
  }
  return props.studentTests[form.value.studentId] || [];
});

const testAlreadyDone = computed(() => {
  if (!form.value.studentId || !form.value.testId) return false;
  return studentTestHistory.value.some(test => test.code === form.value.testId || test.id === form.value.testId);
});

function handleViewHistory() {
  selectedStudentForHistory.value = form.value.studentId;
  showTestHistory.value = true;
}

function handleCreate() {
  if (form.value.studentId && form.value.testId && form.value.date && form.value.time && form.value.hits !== '') {
    if (testAlreadyDone.value) {
      alert('Este estudiante ya realizó esta prueba');
      return;
    }
    emit('create', { ...form.value });
    resetForm();
  } else {
    alert('Por favor completa todos los campos requeridos');
  }
}

function validateTimeFormat(event) {
  let value = event.target.value.replace(/[^\d:]/g, '');

  if (value.length === 2 && !value.includes(':')) {
    value = value + ':';
  }

  if (value.length > 5) {
    value = value.substring(0, 5);
  }

  form.value.time = value;
}

function initBatchMode() {
  batchMode.value = true;
  studentList.value.forEach(student => {
    batchStudents.value[student.id] = {
      selected: false,
      time: '00:00',
      hits: '',
      errors: ''
    };
  });
}

function handleBatchCreate() {
  const selectedCount = Object.values(batchStudents.value).filter(s => s.selected && s.hits !== '').length;

  if (!testSelected.value) {
    alert('Selecciona una prueba');
    return;
  }

  if (selectedCount === 0) {
    alert('Selecciona al menos un estudiante y completa los aciertos');
    return;
  }

  const evaluations = [];
  Object.entries(batchStudents.value).forEach(([studentId, data]) => {
    if (data.selected && data.hits !== '') {
      evaluations.push({
        studentId: parseInt(studentId),
        testId: testSelected.value,
        date: dateSelected.value,
        time: data.time,
        hits: data.hits,
        errors: data.errors,
        notes: notesShared.value
      });
    }
  });

  console.log('Registrando evaluaciones:', evaluations);
  evaluations.forEach(ev => emit('create', ev));

  resetForm();
}

function toggleBatchMode() {
  batchMode.value = false;
  testSelected.value = '';
  batchStudents.value = {};
}

function viewBatchHistory(student) {
  batchHistoryStudent.value = student;
  showBatchHistory.value = true;
}

function resetForm() {
  form.value = {
    studentId: '',
    testId: '',
    date: new Date().toISOString().split('T')[0],
    time: '00:00',
    hits: '',
    errors: '',
    notes: ''
  };
  showTestHistory.value = false;
  selectedStudentForHistory.value = null;
  emit('close');
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="resetForm">
    <div class="modal-content" @click.stop>
      <template v-if="!showTestHistory && !batchMode">
        <div class="modal-header">
          <div class="mode-switcher">
            <button type="button" class="mode-btn active" disabled>
              <User :size="16" />
              Evaluación Individual
            </button>
            <button type="button" class="mode-btn" @click="initBatchMode">
              <Users :size="16" />
              Evaluación Grupal
            </button>
          </div>
          <button class="modal-close" @click="resetForm">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <!-- Student Selection -->
          <div class="form-group">
            <label for="student">
              <User :size="16" />
              Estudiante
            </label>
            <div class="student-selector">
              <select v-model="form.studentId" id="student" class="form-input">
                <option value="">-- Selecciona un estudiante --</option>
                <option v-for="student in studentList" :key="student.id" :value="student.id">
                  {{ student.name }} ({{ student.level }})
                </option>
              </select>
              <button
                v-if="form.studentId"
                type="button"
                class="history-btn"
                @click="handleViewHistory"
              >
                Ver historial
              </button>
            </div>
          </div>

          <!-- Test Selection with Warning -->
          <div class="form-group">
            <label for="test">
              <BookOpen :size="16" />
              Prueba de Lectura
            </label>
            <select v-model="form.testId" id="test" class="form-input">
              <option value="">-- Selecciona una prueba --</option>
              <option v-for="test in testList" :key="test.id" :value="test.id" :disabled="form.studentId && studentTestHistory.some(t => t.code === test.code)">
                {{ test.code }} - {{ test.title }} ({{ test.course }}º)
                <span v-if="form.studentId && studentTestHistory.some(t => t.code === test.code)"> - Ya realizada</span>
              </option>
            </select>
            <div v-if="testAlreadyDone" class="warning-box">
              <AlertCircle :size="16" />
              <span>Este estudiante ya realizó esta prueba</span>
            </div>
          </div>

          <!-- Date -->
          <div class="form-group">
            <label for="date">
              <Clock :size="16" />
              Fecha de Evaluación
            </label>
            <input v-model="form.date" type="date" id="date" class="form-input" />
          </div>

          <!-- Time -->
          <div class="form-group">
            <label for="time">Tiempo (mm:ss)</label>
            <input
              v-model="form.time"
              type="text"
              id="time"
              placeholder="02:30"
              maxlength="5"
              class="form-input"
              @input="validateTimeFormat"
            />
            <small class="hint-text">Formato: 02:30 (2 minutos 30 segundos)</small>
          </div>

          <!-- Hits -->
          <div class="form-group">
            <label for="hits">Aciertos</label>
            <input
              v-model.number="form.hits"
              type="number"
              inputmode="numeric"
              pattern="[0-9]*"
              id="hits"
              placeholder="Ej: 45"
              min="0"
              class="form-input"
            />
          </div>

          <!-- Errors -->
          <div class="form-group">
            <label for="errors">Errores (opcional)</label>
            <input
              v-model.number="form.errors"
              type="number"
              inputmode="numeric"
              pattern="[0-9]*"
              id="errors"
              placeholder="Ej: 3"
              min="0"
              class="form-input"
            />
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="resetForm">Cancelar</button>
          <button
            class="btn-primary"
            @click="handleCreate"
            :disabled="!form.studentId || !form.testId || testAlreadyDone || form.hits === ''"
          >
            Registrar Evaluación
          </button>
        </div>
      </template>

      <template v-else-if="showBatchHistory && batchHistoryStudent">
        <div class="modal-header">
          <button type="button" class="back-btn" @click="showBatchHistory = false; batchHistoryStudent = null">
            ← Atrás
          </button>
          <h2>Historial de Pruebas - {{ batchHistoryStudent.name }}</h2>
          <button type="button" class="modal-close" @click="showBatchHistory = false; batchHistoryStudent = null">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="!props.studentTests[batchHistoryStudent.id] || props.studentTests[batchHistoryStudent.id].length === 0" class="empty-state">
            <FileText :size="32" />
            <p>Este estudiante aún no ha realizado ninguna prueba</p>
          </div>

          <div v-else class="tests-history">
            <div v-for="test in props.studentTests[batchHistoryStudent.id]" :key="test.id" class="test-item">
              <div class="test-header">
                <h4>{{ test.code }} - {{ test.title }}</h4>
                <span class="test-date">{{ test.date }}</span>
              </div>
              <div class="test-details">
                <div class="detail-row">
                  <span class="label">PPM:</span>
                  <span class="value">{{ test.ppm }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Errores:</span>
                  <span class="value">{{ test.errors }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Nivel:</span>
                  <span class="level-badge" :class="`level-${test.level.toLowerCase()}`">{{ test.level }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-close" @click="showBatchHistory = false">Cerrar</button>
        </div>
      </template>

      <template v-else-if="batchMode">
        <div class="modal-header">
          <div class="mode-switcher">
            <button type="button" class="mode-btn" @click="toggleBatchMode">
              <User :size="16" />
              Evaluación Individual
            </button>
            <button type="button" class="mode-btn active" disabled>
              <Users :size="16" />
              Evaluación Grupal
            </button>
          </div>
          <button type="button" class="modal-close" @click="resetForm">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body batch-body">
          <!-- Config Row -->
          <div class="batch-config compact">
            <div class="config-field">
              <label>Prueba *</label>
              <select v-model="testSelected" class="form-input">
                <option value="">-- Selecciona una prueba --</option>
                <option v-for="test in testList" :key="test.id" :value="test.id">
                  {{ test.code }} - {{ test.title }}
                </option>
              </select>
            </div>

            <div class="config-field">
              <label>Fecha *</label>
              <input v-model="dateSelected" type="date" class="form-input" />
            </div>
          </div>

          <!-- Students Grid -->
          <div v-if="testSelected" class="batch-students-grid">
            <div class="grid-header">
              <div class="select-all">
                <input
                  type="checkbox"
                  id="selectAll"
                  @change="(e) => Object.values(batchStudents).forEach(s => s.selected = e.target.checked)"
                />
                <label for="selectAll">Seleccionar todos</label>
              </div>
              <div class="count-badge">{{ Object.values(batchStudents).filter(s => s.selected && s.hits !== '').length }} seleccionados</div>
            </div>

            <div class="students-cards">
              <div v-for="student in studentList" :key="student.id" :class="['student-card', { 'card-disabled': studentHasTest(student.id, testSelected) }]">
                <div class="card-header">
                  <input
                    :id="`student-${student.id}`"
                    v-model="batchStudents[student.id].selected"
                    type="checkbox"
                    :disabled="studentHasTest(student.id, testSelected)"
                  />
                  <label :for="`student-${student.id}`" class="student-name">{{ student.name }}</label>
                  <button
                    type="button"
                    class="history-icon-btn"
                    @click="viewBatchHistory(student)"
                    title="Ver historial"
                  >
                    <FileText :size="18" />
                  </button>
                  <span v-if="studentHasTest(student.id, testSelected)" class="badge-done">Ya realizada</span>
                </div>

                <div class="card-inputs">
                  <div class="input-group">
                    <label>Tiempo</label>
                    <input
                      v-model="batchStudents[student.id].time"
                      type="text"
                      placeholder="mm:ss"
                      maxlength="5"
                      class="batch-input small"
                      :disabled="studentHasTest(student.id, testSelected)"
                      @input="validateTimeFormat"
                    />
                  </div>

                  <div class="input-group">
                    <label>Aciertos</label>
                    <input
                      v-model.number="batchStudents[student.id].hits"
                      type="number"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      min="0"
                      class="batch-input small"
                      :disabled="studentHasTest(student.id, testSelected)"
                    />
                  </div>

                  <div class="input-group">
                    <label>Errores</label>
                    <input
                      v-model.number="batchStudents[student.id].errors"
                      type="number"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      min="0"
                      class="batch-input small"
                      :disabled="studentHasTest(student.id, testSelected)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-config">
            <p>Selecciona una prueba para comenzar</p>
          </div>

          <!-- Placeholder para table que será reemplazado -->
          <div class="batch-table-wrapper" style="display: none;">
            <table class="batch-table">
              <thead>
                <tr>
                  <th style="width: 40px">
                    <input
                      type="checkbox"
                      @change="(e) => Object.values(batchStudents).forEach(s => s.selected = e.target.checked)"
                    />
                  </th>
                  <th>Estudiante</th>
                  <th>Tiempo</th>
                  <th>Aciertos *</th>
                  <th>Errores</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in studentList" :key="student.id">
                  <td>
                    <input v-model="batchStudents[student.id].selected" type="checkbox" />
                  </td>
                  <td class="student-cell">{{ student.name }}</td>
                  <td>
                    <input
                      v-model="batchStudents[student.id].time"
                      type="text"
                      placeholder="00:00"
                      maxlength="5"
                      class="batch-input"
                      @input="validateTimeFormat"
                    />
                  </td>
                  <td>
                    <input
                      v-model.number="batchStudents[student.id].hits"
                      type="number"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      placeholder="45"
                      min="0"
                      class="batch-input"
                    />
                  </td>
                  <td>
                    <input
                      v-model.number="batchStudents[student.id].errors"
                      type="number"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      placeholder="3"
                      min="0"
                      class="batch-input"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="toggleBatchMode">Cancelar</button>
          <button class="btn-primary" @click="handleBatchCreate">
            Registrar {{ Object.values(batchStudents).filter(s => s.selected && s.hits !== '').length }} Evaluación(es)
          </button>
        </div>
      </template>

      <template v-else>
        <div class="modal-header">
          <button type="button" class="back-btn" @click="showTestHistory = false">
            ← Atrás
          </button>
          <h2>Historial de Pruebas</h2>
          <button type="button" class="modal-close" @click="resetForm">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="studentTestHistory.length === 0" class="empty-state">
            <BookOpen :size="32" />
            <p>Este estudiante aún no ha realizado ninguna prueba</p>
          </div>

          <div v-else class="tests-history">
            <div v-for="test in studentTestHistory" :key="test.id" class="test-item">
              <div class="test-header">
                <h4>{{ test.code }} - {{ test.title }}</h4>
                <span class="test-date">{{ test.date }}</span>
              </div>
              <div class="test-details">
                <div class="detail-row">
                  <span class="label">PPM:</span>
                  <span class="value">{{ test.ppm }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Errores:</span>
                  <span class="value">{{ test.errors }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Nivel:</span>
                  <span class="level-badge" :class="`level-${test.level.toLowerCase()}`">{{ test.level }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-close" @click="showTestHistory = false">Cerrar</button>
        </div>
      </template>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  min-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  resize: both;
  overflow: hidden;
}

[class*="batch-"] .modal-content {
  max-width: 90vw;
  min-width: 600px;
  max-height: 85vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
}

.btn-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-close {
  padding: 0.75rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #059669;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #111827;
  font-weight: 700;
  padding: 0;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #6b7280;
}

.student-selector {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.student-selector .form-input {
  flex: 1;
}

.history-btn {
  padding: 0.75rem 1rem;
  background: #f0fdf4;
  color: #10b981;
  border: 2px solid #10b981;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.history-btn:hover {
  background: #10b981;
  color: white;
}

.warning-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border-left: 4px solid #dc2626;
  border-radius: 4px;
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.hint-text {
  display: block;
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty-state svg {
  color: #d1d5db;
}

.tests-history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.test-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.2s;
}

.test-item:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.test-header h4 {
  margin: 0;
  color: #111827;
  font-size: 0.95rem;
}

.test-date {
  font-size: 0.85rem;
  color: #9ca3af;
}

.test-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.detail-row .label {
  color: #9ca3af;
  font-weight: 600;
}

.detail-row .value {
  color: #111827;
  font-weight: 600;
}

.level-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.level-avanzado {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.level-en\ nivel {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.level-requiere\ apoyo {
  background: #fed7aa;
  color: #92400e;
  border: 1px solid #fdba74;
}

.mode-switcher {
  display: flex;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.4rem;
  border-radius: 8px;
  flex: 1;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  padding: 0.6rem 1rem;
  background: transparent;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.mode-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.mode-btn.active {
  background: white;
  color: #10b981;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: default;
}

.mode-btn:disabled {
  cursor: not-allowed;
}

.batch-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.batch-config {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 8px;
  border: 1px solid #d1fae5;
}

.batch-config.compact {
  grid-template-columns: 1fr 0.8fr;
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-field label {
  font-weight: 700;
  font-size: 0.85rem;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.empty-config {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #9ca3af;
  font-size: 1rem;
}

.batch-students-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 2px solid #e5e7eb;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.select-all input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.select-all label {
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  user-select: none;
}

.count-badge {
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
}

.students-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}

.student-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  transition: all 0.2s ease;
}

.student-card:hover:not(.card-disabled) {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.student-card.card-disabled {
  background: #f9fafb;
  border-color: #d1d5db;
  opacity: 0.6;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.card-header input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
}

.card-header input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.student-name {
  font-weight: 700;
  color: #111827;
  cursor: pointer;
  user-select: none;
  flex: 1;
  font-size: 0.9rem;
}

.badge-done {
  background: #fecaca;
  color: #991b1b;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.history-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  color: #9ca3af;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
}

.history-icon-btn:hover {
  background: #f0fdf4;
  color: #10b981;
}

.card-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.batch-input {
  width: 100%;
  padding: 0.625rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  text-align: center;
  transition: all 0.2s;
}

.batch-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  background: #f0fdf4;
}

.batch-input.small {
  font-size: 0.85rem;
}
</style>
