import { ref, watch } from 'vue';

const selectedCourse = ref('2024-25');
const courses = ref([
  { id: '2024-25', name: 'Curso 2024-25' },
  { id: '2023-24', name: 'Curso 2023-24' },
  { id: '2022-23', name: 'Curso 2022-23' },
  { id: '2021-22', name: 'Curso 2021-22' }
]);

// Cargar curso guardado al iniciar
if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('selectedCourse');
  if (saved) {
    selectedCourse.value = saved;
  }
}

// Guardar en localStorage cuando cambia
watch(selectedCourse, (newCourse) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('selectedCourse', newCourse);
  }
});

export function useCourse() {
  return {
    selectedCourse,
    courses,
    getCurrentCourseName() {
      return courses.value.find(c => c.id === selectedCourse.value)?.name || 'Seleccionar curso';
    }
  };
}
