import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import StudentDetailView from '@/views/student-detail/StudentDetailView.vue';
import * as studentService from '@/services/studentService';

vi.mock('@/services/studentService', () => ({
  getStudentRecord: vi.fn()
}));

const STUDENT_ID = '123e4567-e89b-12d3-a456-426614174000';

function richRecord() {
  return {
    id: STUDENT_ID,
    external_id: 'A-001',
    name: 'María García López',
    birth_date: '2013-04-12',
    age: 13,
    gender: null,
    academic_status: null,
    sector: null,
    disabled_at: null,
    sections: {
      current: [
        { id: 's-1', center_id: 'c-1', external_id: null, name: '1º ESO A', academic_year: '2025-2026', disabled_at: null, origin: 'alexia', enrollment_date: '2025-09-05' }
      ],
      historical: [
        { id: 's-6-2024', center_id: 'c-1', external_id: null, name: '6º Primaria', academic_year: '2024-2025', disabled_at: '2025-06-20', origin: 'alexia', enrollment_date: '2024-09-03' }
      ]
    },
    current_sections: [
      { id: 's-1', center_id: 'c-1', external_id: null, name: '1º ESO A', academic_year: '2025-2026', disabled_at: null, origin: 'alexia', enrollment_date: '2025-09-05' }
    ],
    historical_sections: [
      { id: 's-6-2024', center_id: 'c-1', external_id: null, name: '6º Primaria', academic_year: '2024-2025', disabled_at: '2025-06-20', origin: 'alexia', enrollment_date: '2024-09-03' }
    ],
    results: [
      { id: 'r-1', student_id: STUDENT_ID, section_id: 's-1', test_id: 't-1', test_date: '2025-09-10', time: 40, successes: 85, mistakes: 15, test_code: 'RFB-1', test_name: 'Batería RFB-1', test_words: 100, words: 100, ppm: 150, comprehension: 85, accuracy: 85, vef: 127.5 },
      { id: 'r-2', student_id: STUDENT_ID, section_id: 's-1', test_id: 't-1', test_date: '2025-09-17', time: 43, successes: 92, mistakes: 8, test_code: 'RFB-1', test_name: 'Batería RFB-1', test_words: 100, words: 100, ppm: 139.5, comprehension: 92, accuracy: 92, vef: 128.3 },
      { id: 'r-3', student_id: STUDENT_ID, section_id: 's-1', test_id: 't-2', test_date: '2025-09-24', time: 55, successes: 58, mistakes: 42, test_code: 'RFB-2', test_name: 'Batería RFB-2', test_words: 110, words: 110, ppm: 120, comprehension: 58, accuracy: 58, vef: 69.6 },
      { id: 'r-4', student_id: STUDENT_ID, section_id: 's-1', test_id: 't-2', test_date: '2025-10-02', time: 45, successes: 70, mistakes: 30, test_code: 'RFB-2', test_name: 'Batería RFB-2', test_words: 120, words: 120, ppm: 160, comprehension: 70, accuracy: 70, vef: 112 }
    ],
    readings: [
      { id: 'rd-1', student_id: STUDENT_ID, book_id: 'b-1', book_title: 'El Principito', title: 'El Principito', book_level: 'B1', level: 'B1', start_date: '2025-09-08', end_date: '2025-09-22', status: 'finalizada' },
      { id: 'rd-2', student_id: STUDENT_ID, book_id: 'b-2', book_title: 'La vuelta al mundo en 80 días', title: 'La vuelta al mundo en 80 días', book_level: 'B1', level: 'B1', start_date: '2025-10-01', end_date: null, status: 'en curso' }
    ],
    total_results: 4,
    total_readings: 2
  };
}

function freshImportRecord() {
  return {
    id: STUDENT_ID,
    external_id: 'A-002',
    name: 'Lucía Fernández Ortiz',
    birth_date: null,
    age: null,
    gender: null,
    academic_status: null,
    sector: null,
    disabled_at: null,
    sections: {
      current: [
        { id: 's-1', center_id: 'c-1', external_id: null, name: '1º ESO A', academic_year: '2025-2026', disabled_at: null, origin: 'alexia', enrollment_date: '2025-09-05' }
      ],
      historical: []
    },
    current_sections: [
      { id: 's-1', center_id: 'c-1', external_id: null, name: '1º ESO A', academic_year: '2025-2026', disabled_at: null, origin: 'alexia', enrollment_date: '2025-09-05' }
    ],
    historical_sections: [],
    results: [],
    readings: [],
    total_results: 0,
    total_readings: 0
  };
}

const createWrapper = async (studentId = STUDENT_ID) => {
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
      plugins: [router],
      stubs: {
        EvolutionChart: { template: '<div data-testid="evolution-chart" />' }
      }
    }
  });
};

describe('StudentDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar estado de carga y luego los datos (Escenario 1)', async () => {
    studentService.getStudentRecord.mockResolvedValue(richRecord());

    const wrapper = await createWrapper();
    expect(wrapper.find('.state--loading').exists()).toBe(true);

    await flushPromises();

    expect(wrapper.find('[data-testid="student-name"]').text()).toContain('María García López');
  });

  it('debe mostrar acceso denegado sin filtrar el nombre (Escenario 6)', async () => {
    const error = new Error('Forbidden');
    error.status = 403;
    studentService.getStudentRecord.mockRejectedValue(error);

    const wrapper = await createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain('No tienes permiso');
    expect(wrapper.text()).not.toContain('María García López');
  });

  it('debe distinguir alumno inexistente (404)', async () => {
    const error = new Error('Not found');
    error.status = 404;
    studentService.getStudentRecord.mockRejectedValue(error);

    const wrapper = await createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain('No encontrado');
  });

  it('debe mostrar error y permitir reintentar', async () => {
    let callCount = 0;
    studentService.getStudentRecord.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('Error de red'));
      }
      return Promise.resolve(richRecord());
    });

    const wrapper = await createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain('Error de red');

    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    expect(wrapper.find('[data-testid="student-name"]').text()).toContain('María García López');
  });

  it('debe mostrar datos personales, edad, expediente y sección actual', async () => {
    studentService.getStudentRecord.mockResolvedValue(richRecord());

    const wrapper = await createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain('María García López');
    expect(wrapper.text()).toContain('13 años');
    expect(wrapper.text()).toContain('A-001');
    expect(wrapper.text()).toContain('1º ESO A');
  });

  it('debe mostrar el resumen de métricas', async () => {
    studentService.getStudentRecord.mockResolvedValue(richRecord());

    const wrapper = await createWrapper();
    await flushPromises();

    // medias: ppm (150+139.5+120+160)/4 = 141.625 -> 142 ; vef -> 109
    expect(wrapper.text()).toContain('142');
    expect(wrapper.text()).toContain('109');
    expect(wrapper.text()).toContain('Pruebas');
    expect(wrapper.text()).toContain('Lecturas');
  });

  it('debe distinguir secciones actuales e históricas (Escenario 4)', async () => {
    studentService.getStudentRecord.mockResolvedValue(richRecord());

    const wrapper = await createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain('1º ESO A');
    expect(wrapper.text()).toContain('6º Primaria');
    expect(wrapper.text()).toContain('2024-2025');
    expect(wrapper.text()).toContain('Actuales');
    expect(wrapper.text()).toContain('Anteriores');
  });

  it('debe mostrar el histórico con las tres métricas y su banda (Escenario 3)', async () => {
    studentService.getStudentRecord.mockResolvedValue(richRecord());

    const wrapper = await createWrapper();
    await flushPromises();

    expect(wrapper.findAll('[data-testid="result-row"]')).toHaveLength(4);
    expect(wrapper.text()).toContain('Batería RFB-1');
    expect(wrapper.text()).toContain('Batería RFB-2');
    expect(wrapper.text()).toContain('150'); // ppm espontánea r-1
    expect(wrapper.text()).toContain('85%'); // comprensión r-1
    expect(wrapper.text()).toContain('127.5'); // vef r-1

    const badges = wrapper.findAll('.badge-alta, .badge-normal, .badge-baja');
    expect(badges.length).toBe(4);
    expect(wrapper.findAll('.badge-alta').length).toBeGreaterThan(0);
    expect(wrapper.findAll('.badge-normal').length).toBeGreaterThan(0);
  });

  it('debe mostrar el bloque de lecturas con su estado', async () => {
    studentService.getStudentRecord.mockResolvedValue(richRecord());

    const wrapper = await createWrapper();
    await flushPromises();

    expect(wrapper.findAll('[data-testid="reading-row"]')).toHaveLength(2);
    expect(wrapper.text()).toContain('El Principito');
    expect(wrapper.text()).toContain('La vuelta al mundo en 80 días');
    expect(wrapper.text()).toContain('Finalizada');
    expect(wrapper.text()).toContain('En curso');
  });

  it('debe mostrar el gráfico de evolución cuando hay resultados', async () => {
    studentService.getStudentRecord.mockResolvedValue(richRecord());

    const wrapper = await createWrapper();
    await flushPromises();

    expect(wrapper.find('[data-testid="evolution-chart"]').exists()).toBe(true);
  });

  it('debe explicar los apartados vacíos sin mostrar error (Escenario 5)', async () => {
    studentService.getStudentRecord.mockResolvedValue(freshImportRecord());

    const wrapper = await createWrapper();
    await flushPromises();

    expect(wrapper.find('[data-testid="student-name"]').text()).toContain('Lucía Fernández Ortiz');
    expect(wrapper.text()).toContain('Sin secciones anteriores.');
    expect(wrapper.text()).toContain('Sin resultados suficientes');
    expect(wrapper.text()).toContain('Sin pruebas registradas');
    expect(wrapper.text()).toContain('Sin lecturas asignadas');
    expect(wrapper.text()).not.toContain('No se pudieron cargar');
  });
});