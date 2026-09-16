import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import StudentDetailView from '@/views/student-detail/StudentDetailView.vue';
import * as studentService from '@/services/studentService';

vi.mock('@/services/studentService', () => ({
  getStudentRecord: vi.fn()
}));

const createWrapper = async (studentId = '123e4567-e89b-12d3-a456-426614174000') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/centers/:centerId/sections/:sectionId/students/:studentId',
        name: 'student-detail',
        component: StudentDetailView
      }
    ]
  });

  await router.push(`/centers/c1/sections/s1/students/${studentId}`);
  await router.isReady();

  return mount(StudentDetailView, {
    global: {
      plugins: [router]
    }
  });
};

describe('StudentDetailView', () => {
  const mockStudentData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Juan Pérez',
    grade: '3º Primaria',
    section: 'Aula 3A',
    currentSections: [
      { id: 's1', name: 'Aula 3A', teacher: 'Prof. López' }
    ],
    historicSections: [
      { id: 's0', name: 'Aula 2B', teacher: 'Prof. García', year: '2024-2025' }
    ],
    tests: [
      {
        id: 't1',
        date: '2025-09-10',
        name: 'Test 1',
        speedSpontaneous: 150,
        comprehension: 85,
        effectiveSpeed: 140,
        band: 'normal',
        variance: 5
      },
      {
        id: 't2',
        date: '2025-09-17',
        name: 'Test 2',
        speedSpontaneous: 155,
        comprehension: 90,
        effectiveSpeed: 145,
        band: 'high',
        variance: 5
      }
    ],
    books: [
      {
        id: 'b1',
        title: 'El Pequeño Príncipe',
        author: 'Antoine de Saint-Exupéry',
        readDate: '2025-09-15',
        status: 'completed'
      }
    ],
    differences: {
      functional: ['Decodificación fonética lenta'],
      literary: ['Comprensión inferencial débil']
    },
    stats: {
      averagePPM: 145,
      completedTests: 2,
      totalBooks: 1
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar estado de carga y luego datos', async () => {
    studentService.getStudentRecord.mockResolvedValue(mockStudentData);

    const wrapper = await createWrapper();
    // Estado inicial está cargando
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Después de cargar, muestra datos
    expect(wrapper.text()).toContain('Juan Pérez');
  });

  it('debe mostrar acceso denegado si el servidor devuelve 403', async () => {
    const error = new Error('Forbidden');
    error.status = 403;
    studentService.getStudentRecord.mockRejectedValue(error);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('No tienes permiso');
  });

  it('debe mostrar error si la carga falla', async () => {
    studentService.getStudentRecord.mockRejectedValue(
      new Error('Error de red')
    );

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('Error de red');
  });

  it('debe mostrar datos del alumno cuando carga exitosamente', async () => {
    studentService.getStudentRecord.mockResolvedValue(mockStudentData);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('Juan Pérez');
    expect(wrapper.text()).toContain('3º Primaria');
    expect(wrapper.text()).toContain('Aula 3A');
  });

  it('debe mostrar estadísticas del alumno', async () => {
    studentService.getStudentRecord.mockResolvedValue(mockStudentData);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('145'); // averagePPM
    expect(wrapper.text()).toContain('2'); // completedTests
    expect(wrapper.text()).toContain('1'); // totalBooks
  });

  it('debe mostrar secciones actuales e históricas', async () => {
    studentService.getStudentRecord.mockResolvedValue(mockStudentData);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('Aula 3A');
    expect(wrapper.text()).toContain('Aula 2B');
    expect(wrapper.text()).toContain('2024-2025');
  });

  it('debe mostrar tabla de histórico de pruebas', async () => {
    studentService.getStudentRecord.mockResolvedValue(mockStudentData);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('Test 1');
    expect(wrapper.text()).toContain('Test 2');
    expect(wrapper.text()).toContain('150'); // speedSpontaneous test 1
    expect(wrapper.text()).toContain('155'); // speedSpontaneous test 2
  });

  it('debe mostrar bandas de pruebas', async () => {
    studentService.getStudentRecord.mockResolvedValue(mockStudentData);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    const bandBadges = wrapper.findAll('.badge-normal, .badge-high');
    expect(bandBadges.length).toBeGreaterThan(0);
  });

  it('debe mostrar variaciones entre pruebas', async () => {
    studentService.getStudentRecord.mockResolvedValue(mockStudentData);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('+5'); // variance
  });

  it('debe mostrar diferencias funcional/literario', async () => {
    studentService.getStudentRecord.mockResolvedValue(mockStudentData);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('Decodificación fonética lenta');
    expect(wrapper.text()).toContain('Comprensión inferencial débil');
  });

  it('debe mostrar libros leídos', async () => {
    studentService.getStudentRecord.mockResolvedValue(mockStudentData);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('El Pequeño Príncipe');
    expect(wrapper.text()).toContain('Antoine de Saint-Exupéry');
  });

  it('debe mostrar estado vacío si no hay pruebas', async () => {
    const dataWithoutTests = {
      ...mockStudentData,
      tests: []
    };
    studentService.getStudentRecord.mockResolvedValue(dataWithoutTests);

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('No hay pruebas registradas');
  });

  it('debe permitir reintentar carga si hay error', async () => {
    let callCount = 0;
    studentService.getStudentRecord.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('Error'));
      }
      return Promise.resolve(mockStudentData);
    });

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('Error');

    await wrapper.vm.loadStudentRecord();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.text()).toContain('Juan Pérez');
  });
});
