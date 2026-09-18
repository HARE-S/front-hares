<script setup>
import { ref, computed } from 'vue';
import { Gauge, UserCheck, BookOpen, AlertTriangle, ArrowUp, ArrowRight, X, ChevronRight, BarChart3 } from 'lucide-vue-next';

const emit = defineEmits(['view-support', 'view-students', 'view-books', 'view-report']);

const showSupportModal = ref(false);
const showDetailsModal = ref(false);
const showStudentsListModal = ref(false);
const showRankingModal = ref(false);
const showBooksModal = ref(false);
const selectedStudent = ref(null);

const kpiData = ref({
  speed: {
    current: 115,
    unit: 'PPM',
    delta: '+8% vs. Corte Inicial',
    target: 125,
    percentage: 92
  },
  students: {
    evaluated: 24,
    total: 26,
    percentage: 92,
    pendingCount: 2,
    pendingPeriod: 'Corte A'
  },
  books: {
    count: 68,
    unit: 'títulos',
    delta: '+14 este mes',
    averagePerStudent: 2.6
  },
  alerts: {
    label: 'Requieren Apoyo',
    criteria: 'PPM < 85 o > 5% errores'
  }
});

const allStudents = ref([
  { id: 1, center: 'Botusbaru', section: '1CARMED1', expediente: '64019', name: 'Mateo Barrenechea', ppm: 82, errors: '8%', status: 'support' },
  { id: 2, center: 'Botusbaru', section: '1CARMED1', expediente: '56542', name: 'Paula Rodríguez López', ppm: 98, errors: '6.5%', status: 'support' },
  { id: 3, center: 'Botusbaru', section: '1CARMED1', expediente: '63934', name: 'Juan Carlos Pérez', ppm: 75, errors: '9%', status: 'support' },
  { id: 4, center: 'Botusbaru', section: '1CARMED1', expediente: '62145', name: 'Lucas Méndez Ruiz', ppm: 128, errors: '1.5%', status: 'advanced' },
  { id: 5, center: 'Botusbaru', section: '1CARMED1', expediente: '58923', name: 'Sofía Navarro Ortiz', ppm: 118, errors: '2%', status: 'normal' },
  { id: 6, center: 'Botusbaru', section: '1CARMED2', expediente: '64567', name: 'Aitana Zubizarreta', ppm: 115, errors: '3%', status: 'normal' },
  { id: 7, center: 'Botusbaru', section: '1CARMED2', expediente: '65234', name: 'Alejandro López', ppm: 105, errors: '4%', status: 'normal' },
  { id: 8, center: 'Centro 2', section: '2CARMED1', expediente: '63891', name: 'Marina González', ppm: 92, errors: '5%', status: 'normal' },
  { id: 9, center: 'Centro 2', section: '2CARMED1', expediente: '64789', name: 'Diego Martínez', ppm: 110, errors: '2.5%', status: 'normal' },
  { id: 10, center: 'Centro 2', section: '2CARMED1', expediente: '61234', name: 'Elena Ruiz', ppm: 80, errors: '10%', status: 'support' }
]);

const studentsNeedingSupport = ref([
  { id: 1, center: 'Botusbaru', section: '1CARMED1', expediente: '64019', name: 'Mateo Barrenechea', ppm: 82, errors: '8%' },
  { id: 2, center: 'Botusbaru', section: '1CARMED1', expediente: '56542', name: 'Paula Rodríguez López', ppm: 98, errors: '6.5%' },
  { id: 3, center: 'Botusbaru', section: '1CARMED1', expediente: '63934', name: 'Juan Carlos Pérez', ppm: 75, errors: '9%' },
  { id: 10, center: 'Centro 2', section: '2CARMED1', expediente: '61234', name: 'Elena Ruiz', ppm: 80, errors: '10%' }
]);

const studentTests = {
  1: [
    { id: 1, code: '1IF', title: 'La Vaca', date: '2025-01-24', ppm: 82, errors: '8%', level: 'En nivel' },
    { id: 2, code: '1AF', title: 'El Patito Feo', date: '2025-01-20', ppm: 75, errors: '10%', level: 'Requiere apoyo' },
    { id: 3, code: '1BL', title: 'El Principito', date: '2025-01-15', ppm: 85, errors: '5%', level: 'En nivel' }
  ],
  2: [
    { id: 1, code: '1IF', title: 'La Vaca', date: '2025-01-24', ppm: 98, errors: '6.5%', level: 'Avanzado' },
    { id: 2, code: '1AF', title: 'El Patito Feo', date: '2025-01-20', ppm: 100, errors: '4%', level: 'Avanzado' },
    { id: 3, code: '1BL', title: 'El Principito', date: '2025-01-15', ppm: 95, errors: '5.5%', level: 'Avanzado' }
  ],
  3: [
    { id: 1, code: '1IF', title: 'La Vaca', date: '2025-01-24', ppm: 75, errors: '12%', level: 'Requiere apoyo' },
    { id: 2, code: '1AF', title: 'El Patito Feo', date: '2025-01-20', ppm: 72, errors: '14%', level: 'Requiere apoyo' },
    { id: 3, code: '1BL', title: 'El Principito', date: '2025-01-15', ppm: 78, errors: '11%', level: 'Requiere apoyo' }
  ],
  10: [
    { id: 1, code: '1IF', title: 'La Vaca', date: '2025-01-24', ppm: 80, errors: '10%', level: 'Requiere apoyo' },
    { id: 2, code: '1AF', title: 'El Patito Feo', date: '2025-01-20', ppm: 78, errors: '11%', level: 'Requiere apoyo' },
    { id: 3, code: '1BL', title: 'El Principito', date: '2025-01-15', ppm: 82, errors: '9%', level: 'En nivel' }
  ]
};

const studentBooksRead = ref({
  1: { booksCount: 8, books: [
    { title: 'El Principito', author: 'Antoine Saint-Exupéry', date: '2025-01-20', format: 'Libro físico' },
    { title: 'El Patito Feo', author: 'Hans Christian Andersen', date: '2025-01-18', format: 'PDF' },
    { title: 'La Vaca', author: 'Bernard Shaw', date: '2025-01-15', format: 'Audiobook' },
    { title: 'Fábulas de Esopo', author: 'Esopo', date: '2025-01-14', format: 'Libro físico' },
    { title: 'Cuentos de hadas', author: 'Brothers Grimm', date: '2025-01-13', format: 'E-book' },
    { title: 'La Cenicienta', author: 'Charles Perrault', date: '2025-01-12', format: 'PDF' },
    { title: 'El gato con botas', author: 'Charles Perrault', date: '2025-01-11', format: 'Fotocopias' },
    { title: 'Caperucita Roja', author: 'Charles Perrault', date: '2025-01-10', format: 'Libro físico' }
  ]},
  2: { booksCount: 12, books: [
    { title: 'El bosque animado', author: 'Wenceslao Fernández Flórez', date: '2025-01-22', format: 'Libro físico' },
    { title: 'Aventuras en el mar', author: 'Jules Verne', date: '2025-01-20', format: 'Libro físico' },
    { title: 'Cuentos de hadas', author: 'Brothers Grimm', date: '2025-01-18', format: 'E-book' },
    { title: 'Viaje al centro de la tierra', author: 'Jules Verne', date: '2025-01-17', format: 'Audiobook' },
    { title: 'La isla misteriosa', author: 'Jules Verne', date: '2025-01-16', format: 'PDF' },
    { title: 'Los tres mosqueteros', author: 'Alexandre Dumas', date: '2025-01-15', format: 'Libro físico' },
    { title: 'El conde de Montecristo', author: 'Alexandre Dumas', date: '2025-01-14', format: 'E-book' },
    { title: 'Ivanhoe', author: 'Walter Scott', date: '2025-01-13', format: 'Libro físico' },
    { title: 'Rob Roy', author: 'Walter Scott', date: '2025-01-12', format: 'PDF' },
    { title: 'Waverley', author: 'Walter Scott', date: '2025-01-11', format: 'Audiobook' },
    { title: 'La dama de las Camelias', author: 'Alexandre Dumas', date: '2025-01-10', format: 'Libro físico' },
    { title: 'Misterio en París', author: 'Anónimo', date: '2025-01-09', format: 'E-book' }
  ]},
  3: { booksCount: 5, books: [
    { title: 'Fábulas para niños', author: 'Esopo', date: '2025-01-21', format: 'Fotocopias' },
    { title: 'La Cenicienta', author: 'Charles Perrault', date: '2025-01-19', format: 'PDF' },
    { title: 'Caperucita Roja', author: 'Tradición Popular', date: '2025-01-18', format: 'Libro físico' },
    { title: 'Blancanieves', author: 'Brothers Grimm', date: '2025-01-17', format: 'Audiobook' },
    { title: 'La Bella y la Bestia', author: 'Gabrielle-Suzanne Barbot', date: '2025-01-16', format: 'E-book' }
  ]},
  4: { booksCount: 15, books: [
    { title: 'El Quijote', author: 'Miguel de Cervantes', date: '2025-01-25', format: 'Libro físico' },
    { title: 'La Regenta', author: 'Leopoldo Alas', date: '2025-01-23', format: 'E-book' },
    { title: 'Marianela', author: 'Benito Pérez Galdós', date: '2025-01-20', format: 'Libro físico' },
    { title: 'Doña Perfecta', author: 'Benito Pérez Galdós', date: '2025-01-19', format: 'PDF' },
    { title: 'Gloria', author: 'Benito Pérez Galdós', date: '2025-01-18', format: 'Audiobook' },
    { title: 'La de Bringas', author: 'Benito Pérez Galdós', date: '2025-01-17', format: 'Libro físico' },
    { title: 'Tormento', author: 'Benito Pérez Galdós', date: '2025-01-16', format: 'E-book' },
    { title: 'La Incógnita', author: 'Benito Pérez Galdós', date: '2025-01-15', format: 'PDF' },
    { title: 'Realidad', author: 'Benito Pérez Galdós', date: '2025-01-14', format: 'Libro físico' },
    { title: 'Nazarín', author: 'Benito Pérez Galdós', date: '2025-01-13', format: 'Audiobook' },
    { title: 'Halma', author: 'Benito Pérez Galdós', date: '2025-01-12', format: 'E-book' },
    { title: 'La familia de León Roch', author: 'Benito Pérez Galdós', date: '2025-01-11', format: 'PDF' },
    { title: 'El abuelo', author: 'Benito Pérez Galdós', date: '2025-01-10', format: 'Libro físico' },
    { title: 'Casandra', author: 'Benito Pérez Galdós', date: '2025-01-09', format: 'Audiobook' },
    { title: 'La novela en tranvía', author: 'Benito Pérez Galdós', date: '2025-01-08', format: 'E-book' }
  ]},
  5: { booksCount: 11, books: [
    { title: 'El Ingenioso Hidalgo', author: 'Miguel de Cervantes', date: '2025-01-24', format: 'Libro físico' },
    { title: 'Leyendas', author: 'Gustavo Adolfo Bécquer', date: '2025-01-21', format: 'PDF' },
    { title: 'Rimas', author: 'Gustavo Adolfo Bécquer', date: '2025-01-20', format: 'E-book' },
    { title: 'La sonata de Arpegio', author: 'Ramón Gómez de la Serna', date: '2025-01-19', format: 'Audiobook' },
    { title: 'Greguerías', author: 'Ramón Gómez de la Serna', date: '2025-01-18', format: 'Libro físico' },
    { title: 'La casa de Bernarda Alba', author: 'Federico García Lorca', date: '2025-01-17', format: 'PDF' },
    { title: 'Bodas de sangre', author: 'Federico García Lorca', date: '2025-01-16', format: 'E-book' },
    { title: 'Yerma', author: 'Federico García Lorca', date: '2025-01-15', format: 'Audiobook' },
    { title: 'Poema del Cid', author: 'Anónimo', date: '2025-01-14', format: 'Libro físico' },
    { title: 'La Celestina', author: 'Fernando de Rojas', date: '2025-01-13', format: 'PDF' },
    { title: 'La vida de Lazarillo de Tormes', author: 'Anónimo', date: '2025-01-12', format: 'E-book' }
  ]},
  6: { booksCount: 10, books: [
    { title: 'Niebla', author: 'Miguel de Unamuno', date: '2025-01-23', format: 'E-book' },
    { title: 'La tormenta', author: 'Emilia Pardo Bazán', date: '2025-01-20', format: 'Libro físico' },
    { title: 'Los Pazos de Ulloa', author: 'Emilia Pardo Bazán', date: '2025-01-19', format: 'PDF' },
    { title: 'La Tribuna', author: 'Emilia Pardo Bazán', date: '2025-01-18', format: 'Audiobook' },
    { title: 'Insolación', author: 'Emilia Pardo Bazán', date: '2025-01-17', format: 'Libro físico' },
    { title: 'Morriña', author: 'Emilia Pardo Bazán', date: '2025-01-16', format: 'E-book' },
    { title: 'La madre naturaleza', author: 'Emilia Pardo Bazán', date: '2025-01-15', format: 'PDF' },
    { title: 'Dulce dueño', author: 'Emilia Pardo Bazán', date: '2025-01-14', format: 'Audiobook' },
    { title: 'La prueba', author: 'Emilia Pardo Bazán', date: '2025-01-13', format: 'Libro físico' },
    { title: 'Belén', author: 'Emilia Pardo Bazán', date: '2025-01-12', format: 'E-book' }
  ]},
  7: { booksCount: 9, books: [
    { title: 'Realidad', author: 'Benito Pérez Galdós', date: '2025-01-22', format: 'Audiobook' },
    { title: 'La gaviota', author: 'Antón Chéjov', date: '2025-01-19', format: 'PDF' },
    { title: 'Tío Vania', author: 'Antón Chéjov', date: '2025-01-18', format: 'Libro físico' },
    { title: 'Las tres hermanas', author: 'Antón Chéjov', date: '2025-01-17', format: 'E-book' },
    { title: 'El jardín de cerezos', author: 'Antón Chéjov', date: '2025-01-16', format: 'Audiobook' },
    { title: 'Historias breves', author: 'Antón Chéjov', date: '2025-01-15', format: 'PDF' },
    { title: 'Ivanov', author: 'Antón Chéjov', date: '2025-01-14', format: 'Libro físico' },
    { title: 'El oso', author: 'Antón Chéjov', date: '2025-01-13', format: 'E-book' },
    { title: 'Los miserables', author: 'Víctor Hugo', date: '2025-01-12', format: 'Audiobook' }
  ]},
  8: { booksCount: 7, books: [
    { title: 'Bodas de sangre', author: 'Federico García Lorca', date: '2025-01-21', format: 'Libro físico' },
    { title: 'La Casa de Bernarda Alba', author: 'Federico García Lorca', date: '2025-01-20', format: 'E-book' },
    { title: 'La tormenta', author: 'Emilia Pardo Bazán', date: '2025-01-19', format: 'PDF' },
    { title: 'Realidad', author: 'Benito Pérez Galdós', date: '2025-01-18', format: 'Audiobook' },
    { title: 'Niebla', author: 'Miguel de Unamuno', date: '2025-01-17', format: 'Libro físico' },
    { title: 'El Ingenioso Hidalgo', author: 'Miguel de Cervantes', date: '2025-01-16', format: 'PDF' },
    { title: 'Leyendas', author: 'Gustavo Adolfo Bécquer', date: '2025-01-15', format: 'E-book' }
  ]},
  9: { booksCount: 13, books: [
    { title: 'Don Juan Tenorio', author: 'José Zorrilla', date: '2025-01-24', format: 'E-book' },
    { title: 'El alcalde de Zalamea', author: 'Calderón de la Barca', date: '2025-01-22', format: 'Fotocopias' },
    { title: 'La vida es sueño', author: 'Calderón de la Barca', date: '2025-01-21', format: 'Libro físico' },
    { title: 'El príncipe constante', author: 'Calderón de la Barca', date: '2025-01-20', format: 'PDF' },
    { title: 'El médico de su honra', author: 'Calderón de la Barca', date: '2025-01-19', format: 'Audiobook' },
    { title: 'A secreto agravio, secreta venganza', author: 'Calderón de la Barca', date: '2025-01-18', format: 'E-book' },
    { title: 'El mágico prodigioso', author: 'Calderón de la Barca', date: '2025-01-17', format: 'Libro físico' },
    { title: 'La devoción de la cruz', author: 'Calderón de la Barca', date: '2025-01-16', format: 'PDF' },
    { title: 'Eco y Narciso', author: 'Calderón de la Barca', date: '2025-01-15', format: 'Audiobook' },
    { title: 'Los cabellos de Absalón', author: 'Calderón de la Barca', date: '2025-01-14', format: 'E-book' },
    { title: 'El acaso y el daño de un traje', author: 'Calderón de la Barca', date: '2025-01-13', format: 'Libro físico' },
    { title: 'Las cadenas del demonio', author: 'Calderón de la Barca', date: '2025-01-12', format: 'PDF' },
    { title: 'Amar después de la muerte', author: 'Calderón de la Barca', date: '2025-01-11', format: 'Audiobook' }
  ]},
  10: { booksCount: 4, books: [
    { title: 'Cuentos cortos', author: 'Varios autores', date: '2025-01-20', format: 'PDF' },
    { title: 'Historias de miedo', author: 'Varios autores', date: '2025-01-19', format: 'Audiobook' },
    { title: 'Fábulas esenciales', author: 'Esopo', date: '2025-01-18', format: 'Libro físico' },
    { title: 'Leyendas españolas', author: 'Anónimo', date: '2025-01-17', format: 'E-book' }
  ]}
});

function handleViewSupport() {
  showSupportModal.value = true;
  showDetailsModal.value = false;
  selectedStudent.value = null;
  emit('view-support');
}

function closeSupportModal() {
  showSupportModal.value = false;
  showDetailsModal.value = false;
  selectedStudent.value = null;
}

function handleViewDetails(student) {
  selectedStudent.value = student;
  showDetailsModal.value = true;
}

function handleViewStudentsList() {
  showStudentsListModal.value = true;
  selectedStudent.value = null;
}

function closeStudentsListModal() {
  showStudentsListModal.value = false;
  selectedStudent.value = null;
}

function handleViewRanking() {
  showRankingModal.value = true;
  selectedStudent.value = null;
}

function closeRankingModal() {
  showRankingModal.value = false;
  showBooksModal.value = false;
  selectedStudent.value = null;
}

function handleViewBooks(student) {
  selectedStudent.value = student;
  showBooksModal.value = true;
}

function viewStudentReport(student) {
  emit('view-report', student);
  closeRankingModal();
}

function getLevelColor(level) {
  switch(level) {
    case 'Avanzado': return '#10b981';
    case 'En nivel': return '#6b7280';
    case 'Requiere apoyo': return '#f59e0b';
    default: return '#9ca3af';
  }
}

function getRankingList() {
  return allStudents.value
    .map(student => ({
      ...student,
      booksCount: studentBooksRead.value[student.id]?.booksCount || 0
    }))
    .sort((a, b) => b.booksCount - a.booksCount);
}

function addBooksToStudent(studentId, books) {
  const today = new Date().toISOString().split('T')[0];

  if (!studentBooksRead.value[studentId]) {
    studentBooksRead.value[studentId] = { booksCount: 0, books: [] };
  }

  const newBooks = books.map(book => ({
    title: book.title,
    author: book.author,
    date: today,
    format: book.format || 'Libro físico'
  }));

  studentBooksRead.value[studentId].books.push(...newBooks);
  studentBooksRead.value[studentId].booksCount += newBooks.length;

  console.log('Libros agregados a estudiante', studentId, ':', studentBooksRead.value[studentId]);
}

const avgSpeedPPM = computed(() => {
  const totalPPM = allStudents.value.reduce((sum, student) => sum + student.ppm, 0);
  return Math.round(totalPPM / allStudents.value.length);
});

const totalBooksRead = computed(() => {
  return Object.values(studentBooksRead.value).reduce((sum, data) => sum + data.booksCount, 0);
});

const evaluatedStudents = computed(() => allStudents.value.length);
const totalStudents = computed(() => allStudents.value.length + 2); // 2 pendientes

const speedPercentage = computed(() => {
  const target = 125;
  return Math.round((avgSpeedPPM.value / target) * 100);
});

const completionPercentage = computed(() => {
  return Math.round((evaluatedStudents.value / totalStudents.value) * 100);
});

const avgBooksPerStudent = computed(() => {
  return (totalBooksRead.value / evaluatedStudents.value).toFixed(1);
});

function getAllBooksFromStudents() {
  const booksMap = new Map();
  Object.values(studentBooksRead.value).forEach(student => {
    student.books.forEach(book => {
      const key = `${book.title}|${book.author}`;
      if (!booksMap.has(key)) {
        booksMap.set(key, {
          id: booksMap.size + 1,
          title: book.title,
          author: book.author,
          format: book.format || 'Libro físico'
        });
      }
    });
  });
  return Array.from(booksMap.values());
}

defineExpose({
  addBooksToStudent,
  allStudents,
  getAllBooksFromStudents,
  studentTests
});
</script>

<template>
  <section aria-label="Métricas Principales" class="kpi-grid">
    <!-- Card 1: Velocidad Media del Aula -->
    <div class="kpi-card flat-card">
      <div class="kpi-header">
        <span class="kpi-label">Velocidad Media del Aula</span>
        <div class="kpi-icon-box">
          <Gauge :size="18" class="icon-secondary" />
        </div>
      </div>
      <div class="kpi-content">
        <div class="kpi-value-row">
          <span class="kpi-value">{{ avgSpeedPPM }}</span>
          <span class="kpi-unit">{{ kpiData.speed.unit }}</span>
          <span class="kpi-delta">
            <ArrowUp :size="12" />
            {{ kpiData.speed.delta }}
          </span>
        </div>
        <div class="progress-wrap">
          <div class="progress-labels">
            <span>Objetivo fin de curso</span>
            <span class="progress-target">{{ kpiData.speed.target }} PPM ({{ speedPercentage }}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${speedPercentage}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Alumnos Evaluados -->
    <div class="kpi-card flat-card">
      <div class="kpi-header">
        <span class="kpi-label">Alumnos Evaluados</span>
        <div class="kpi-icon-box">
          <UserCheck :size="18" class="icon-secondary" />
        </div>
      </div>
      <div class="kpi-content">
        <div class="kpi-value-row">
          <span class="kpi-value">{{ evaluatedStudents }}</span>
          <span class="kpi-unit">/ {{ totalStudents }}</span>
          <span class="kpi-delta">
            <ArrowUp :size="12" />
            {{ completionPercentage }}% completitud
          </span>
        </div>
        <div class="info-row">
          <span>{{ totalStudents - evaluatedStudents }} pendientes en {{ kpiData.students.pendingPeriod }}</span>
          <button class="link-btn" @click="handleViewStudentsList">Ver lista</button>
        </div>
      </div>
    </div>

    <!-- Card 3: Libros Leídos en Año -->
    <div class="kpi-card flat-card">
      <div class="kpi-header">
        <span class="kpi-label">Libros Leídos en Año</span>
        <div class="kpi-icon-box">
          <BookOpen :size="18" class="icon-secondary" />
        </div>
      </div>
      <div class="kpi-content">
        <div class="kpi-value-row">
          <span class="kpi-value">{{ totalBooksRead }}</span>
          <span class="kpi-unit">{{ kpiData.books.unit }}</span>
          <span class="kpi-delta">
            <ArrowUp :size="12" />
            {{ kpiData.books.delta }}
          </span>
        </div>
        <div class="info-row">
          <span>Media: {{ avgBooksPerStudent }} libros / alumno</span>
          <button class="link-btn" @click="handleViewRanking">Ranking</button>
        </div>
      </div>
    </div>

    <!-- Card 4: Alerta Pedagógica -->
    <div class="kpi-card flat-card alert-card">
      <div class="kpi-header">
        <span class="kpi-label alert-label">{{ kpiData.alerts.label }}</span>
        <div class="kpi-icon-box alert-icon-box">
          <AlertTriangle :size="18" class="icon-alert" />
        </div>
      </div>
      <div class="kpi-content">
        <div class="alert-value">{{ studentsNeedingSupport.length }}</div>
        <div class="alert-info">
          <span class="criteria">{{ kpiData.alerts.criteria }}</span>
          <button class="support-btn" @click="handleViewSupport">
            Ver refuerzo
            <ArrowRight :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: Lista de todos los alumnos evaluados -->
    <div v-if="showStudentsListModal" class="modal-overlay" @click="closeStudentsListModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h2>Alumnos Evaluados</h2>
          <button type="button" class="close-btn" @click="closeStudentsListModal">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div class="students-table-wrapper">
            <table class="students-table">
              <thead>
                <tr>
                  <th>Centro</th>
                  <th>Nombre y Apellidos</th>
                  <th>PPM</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in allStudents" :key="student.id">
                  <td class="center-cell">{{ student.center }}</td>
                  <td class="name-cell">{{ student.name }}</td>
                  <td class="metric-cell">{{ student.ppm }}</td>
                  <td class="action-cell">
                    <span class="status-badge" :class="'status-' + student.status">
                      {{ student.status === 'support' ? 'Requiere apoyo' : student.status === 'advanced' ? 'Avanzado' : 'Normal' }}
                    </span>
                    <button type="button" class="report-btn" @click="viewStudentReport(student)" title="Ver informe">
                      <BarChart3 :size="18" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-close" @click="closeStudentsListModal">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL: Ranking de libros leídos -->
    <div v-if="showRankingModal" class="modal-overlay" @click="closeRankingModal">
      <div class="modal-dialog" @click.stop>
        <template v-if="!showBooksModal">
          <div class="modal-header">
            <h2>Ranking de Libros Leídos (Año)</h2>
            <button type="button" class="close-btn" @click="closeRankingModal">
              <X :size="20" />
            </button>
          </div>

          <div class="modal-body">
            <div class="ranking-list">
              <div v-for="(student, index) in getRankingList()" :key="student.id" class="ranking-card-wrapper">
                <div class="ranking-card" @click="handleViewBooks(student)">
                  <div class="ranking-position">{{ index + 1 }}</div>
                  <div class="ranking-info">
                    <div class="student-name">{{ student.name }}</div>
                    <div class="student-center">{{ student.center }}</div>
                  </div>
                  <div class="books-count">
                    <span class="count">{{ student.booksCount }}</span>
                    <span class="label">libros</span>
                  </div>
                  <ChevronRight :size="18" class="chevron" />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-close" @click="closeRankingModal">Cerrar</button>
          </div>
        </template>

        <template v-else-if="selectedStudent">
          <div class="modal-header books-header">
            <button type="button" class="back-btn" @click="showBooksModal = false">
              ← Atrás
            </button>
            <h2>Libros de {{ selectedStudent.name }}</h2>
            <button type="button" class="close-btn" @click="closeRankingModal">
              <X :size="20" />
            </button>
          </div>

          <div class="modal-body">
            <div class="books-section">
              <div class="books-header">
                <span>Total de libros leídos: <strong>{{ studentBooksRead[selectedStudent.id]?.booksCount || 0 }}</strong></span>
              </div>
              <div class="books-grid">
                <div v-for="book in studentBooksRead[selectedStudent.id]?.books" :key="book.title" class="book-card">
                  <div class="book-info">
                    <div class="book-title">{{ book.title }}</div>
                    <div class="book-author">{{ book.author }}</div>
                    <div class="book-meta">
                      <span class="format-badge">{{ book.format }}</span>
                      <span class="date">{{ book.date }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-close" @click="closeRankingModal">Cerrar</button>
          </div>
        </template>
      </div>
    </div>

    <!-- MODAL: Estudiantes que requieren refuerzo -->
    <div v-if="showSupportModal" class="modal-overlay" @click="closeSupportModal">
      <div class="modal-dialog" @click.stop>
        <template v-if="!showDetailsModal">
          <div class="modal-header">
            <h2>Estudiantes que Requieren Refuerzo</h2>
            <button type="button" class="close-btn" @click="closeSupportModal">
              <X :size="20" />
            </button>
          </div>

          <div class="modal-body">
            <div class="students-table-wrapper">
              <table class="students-table">
                <thead>
                  <tr>
                    <th>Centro</th>
                    <th>Nombre y Apellidos</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in studentsNeedingSupport" :key="student.id">
                    <td class="center-cell">{{ student.center }}</td>
                    <td class="name-cell">{{ student.name }}</td>
                    <td class="action-cell">
                      <button class="detail-btn" @click="handleViewDetails(student)">
                        Ver detalles
                        <ChevronRight :size="16" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-close" @click="closeSupportModal">Cerrar</button>
          </div>
        </template>

        <template v-else-if="selectedStudent">
          <div class="modal-header">
            <button type="button" class="back-btn" @click="showDetailsModal = false">
              ← Atrás
            </button>
            <h2>Detalles de {{ selectedStudent.name }}</h2>
            <button type="button" class="close-btn" @click="closeSupportModal">
              <X :size="20" />
            </button>
          </div>

          <div class="modal-body">
            <div class="student-header">
              <div class="student-info-card">
                <div class="info-item">
                  <span class="label">Centro:</span>
                  <span class="value">{{ selectedStudent.center }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Sección:</span>
                  <span class="value">{{ selectedStudent.section }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Nº Expediente:</span>
                  <span class="value">{{ selectedStudent.expediente }}</span>
                </div>
              </div>
            </div>

            <div class="tests-section">
              <h3>Historial de Pruebas</h3>
              <div class="tests-table-wrapper">
                <table class="tests-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Título de Prueba</th>
                      <th>Fecha</th>
                      <th>PPM</th>
                      <th>Errores</th>
                      <th>Nivel</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="test in studentTests[selectedStudent.id]" :key="test.id">
                      <td class="code-cell">{{ test.code }}</td>
                      <td>{{ test.title }}</td>
                      <td>{{ test.date }}</td>
                      <td class="metric-cell">{{ test.ppm }}</td>
                      <td class="metric-cell">{{ test.errors }}</td>
                      <td>
                        <span class="level-badge" :style="{ borderColor: getLevelColor(test.level) }">
                          {{ test.level }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-close" @click="closeSupportModal">Cerrar</button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin: 0;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.75rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.kpi-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alert-label {
  color: #dc2626;
}

.kpi-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ecfdf5;
}

.alert-icon-box {
  background-color: #fee2e2;
}

.icon-secondary {
  color: #10b981;
}

.icon-alert {
  color: #dc2626;
}

.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.kpi-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.kpi-unit {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.kpi-delta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #ecfdf5;
  color: #10b981;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6b7280;
}

.progress-target {
  font-weight: 600;
  color: #10b981;
}

.progress-track {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 0.85rem;
}

.link-btn {
  background: none;
  border: none;
  color: #10b981;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.link-btn:hover {
  color: #059669;
}

.alert-card {
  border-color: #fee2e2;
  background: #fffbfb;
}

.alert-value {
  font-size: 3rem;
  font-weight: 900;
  color: #dc2626;
  line-height: 1;
}

.alert-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.criteria {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.support-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.support-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* MODAL STYLES */
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
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  flex-shrink: 0;
}

.modal-header.books-header {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-bottom-color: #d1fae5;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  flex: 1;
  text-align: center;
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

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #111827;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.students-table-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.students-table thead {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-bottom: 2px solid #d1fae5;
}

.students-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 800;
  font-size: 0.85rem;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.students-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.95rem;
  color: #111827;
}

.students-table tbody tr {
  transition: all 0.2s ease;
}

.students-table tbody tr:hover {
  background: #f0fdf4;
  box-shadow: inset 0 0 0 1px #d1fae5;
}

.center-cell {
  font-weight: 600;
  color: #059669;
}

.name-cell {
  font-weight: 600;
  color: #111827;
}

.action-cell {
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.625rem 1.125rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.detail-btn:hover {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.detail-btn:active {
  transform: translateY(0);
}

.report-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.report-btn:hover {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  transform: translateY(-1px);
}

.report-btn:active {
  transform: translateY(0);
}

.student-header {
  margin-bottom: 2rem;
}

.student-info-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.tests-section {
  margin-top: 2rem;
}

.tests-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.tests-table-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.tests-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.tests-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.tests-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.9rem;
  color: #374151;
}

.tests-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
  color: #111827;
}

.tests-table tbody tr:hover {
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
  background: white;
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

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #ecfdf5;
  color: #10b981;
  border: 1px solid #d1fae5;
}

.status-support {
  background: #fffbeb;
  color: #f59e0b;
  border-color: #fde68a;
}

.status-advanced {
  background: #ecfdf5;
  color: #10b981;
  border-color: #d1fae5;
}

.status-normal {
  background: #ecfdf5;
  color: #10b981;
  border-color: #d1fae5;
}

.metric-cell {
  text-align: center;
  font-weight: 600;
}

/* Ranking styles */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ranking-card-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.ranking-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.report-btn:hover {
  border-color: #10b981;
  background: #f0fdf4;
  transform: scale(1.1);
}

.ranking-card:hover {
  background: #f0fdf4;
  border-color: #d1fae5;
  transform: translateX(4px);
}

.ranking-position {
  font-size: 1.5rem;
  font-weight: 800;
  color: #10b981;
  min-width: 40px;
  text-align: center;
}

.ranking-info {
  flex: 1;
}

.student-name {
  font-weight: 700;
  color: #111827;
  font-size: 0.95rem;
}

.student-center {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.books-count {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-right: 1rem;
}

.books-count .count {
  font-size: 1.75rem;
  font-weight: 800;
  color: #10b981;
}

.books-count .label {
  font-size: 0.85rem;
  color: #6b7280;
}

.ranking-card .chevron {
  color: #d1d5db;
  transition: color 0.2s;
}

.ranking-card:hover .chevron {
  color: #10b981;
}

/* Books display */
.books-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.books-header {
  padding: 1rem;
  background: #ecfdf5;
  border-radius: 8px;
  border-left: 4px solid #10b981;
  font-weight: 600;
  color: #059669;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.book-card {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.book-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.book-title {
  font-weight: 700;
  color: #111827;
  font-size: 0.95rem;
}

.book-author {
  font-size: 0.85rem;
  color: #6b7280;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.format-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  background: #e5e7eb;
  color: #374151;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.book-meta .date {
  font-size: 0.8rem;
  color: #9ca3af;
}
</style>
