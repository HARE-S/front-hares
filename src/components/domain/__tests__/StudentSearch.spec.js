import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import StudentSearch from '@/components/domain/StudentSearch.vue';
import * as studentService from '@/services/studentService';

vi.mock('@/services/studentService', () => ({
  getStudentRecord: vi.fn(),
  searchStudents: vi.fn()
}));

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/centers', name: 'centers', component: { template: '<div />' } },
      {
        path: '/centers/:centerId/sections/:sectionId/students/:studentId',
        name: 'student-detail',
        component: { template: '<div />' }
      }
    ]
  });
}

const searchItem = (overrides = {}) => ({
  id: 'stu-7',
  name: 'Iker Gómez Ruiz',
  external_id: 'A-007',
  sections: [{ id: 's-4', name: '3º ESO A', center: 'Centro Peñascal Sur', center_id: 'c-2' }],
  ...overrides
});

const mountSearch = async () => {
  const router = makeRouter();
  await router.push('/centers');
  await router.isReady();
  const wrapper = mount(StudentSearch, { global: { plugins: [router] } });
  return { wrapper, router };
};

async function typeAndSearch(wrapper, text, advanceMs = 300) {
  await wrapper.find('[data-testid="search-input"]').setValue(text);
  await vi.advanceTimersByTimeAsync(advanceMs);
  await flushPromises();
}

describe('StudentSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no busca con un solo carácter (Escenario 1)', async () => {
    const { wrapper } = await mountSearch();
    await typeAndSearch(wrapper, 'm');

    expect(studentService.searchStudents).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="search-panel"]').exists()).toBe(false);
  });

  it('busca a partir de dos caracteres sin exigir tres (Escenario 1)', async () => {
    studentService.searchStudents.mockResolvedValue({ items: [] });
    const { wrapper } = await mountSearch();
    await typeAndSearch(wrapper, 'ma');

    expect(studentService.searchStudents).toHaveBeenCalledTimes(1);
    expect(studentService.searchStudents).toHaveBeenCalledWith(expect.objectContaining({ q: 'ma' }));
  });

  it('controla la frecuencia: una petición al dejar de escribir (Escenario 6)', async () => {
    studentService.searchStudents.mockResolvedValue({ items: [] });
    const { wrapper } = await mountSearch();
    const input = wrapper.find('[data-testid="search-input"]');

    await input.setValue('m');
    await vi.advanceTimersByTimeAsync(100);
    await input.setValue('ma');
    await vi.advanceTimersByTimeAsync(100);
    await input.setValue('mar');
    await vi.advanceTimersByTimeAsync(100);
    await input.setValue('maria');
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(studentService.searchStudents).toHaveBeenCalledTimes(1);
    expect(studentService.searchStudents).toHaveBeenCalledWith(expect.objectContaining({ q: 'maria' }));
  });

  it('muestra centro y sección de cada resultado (Escenario 3)', async () => {
    studentService.searchStudents.mockResolvedValue({
      items: [
        searchItem({
          id: 'stu-11',
          sections: [{ id: 's-2', name: '1º ESO B', center: 'Centro Peñascal Norte', center_id: 'c-1' }]
        }),
        searchItem({
          id: 'stu-7',
          sections: [{ id: 's-4', name: '3º ESO A', center: 'Centro Peñascal Sur', center_id: 'c-2' }]
        })
      ]
    });
    const { wrapper } = await mountSearch();
    await typeAndSearch(wrapper, 'iker gomez');

    const items = wrapper.findAll('[data-testid="search-item"]');
    expect(items).toHaveLength(2);
    expect(wrapper.text()).toContain('1º ESO B');
    expect(wrapper.text()).toContain('Centro Peñascal Norte');
    expect(wrapper.text()).toContain('3º ESO A');
    expect(wrapper.text()).toContain('Centro Peñascal Sur');
  });

  it('muestra un mensaje de sin coincidencias (Escenario 5)', async () => {
    studentService.searchStudents.mockResolvedValue({ items: [], total: 0 });
    const { wrapper } = await mountSearch();
    await typeAndSearch(wrapper, 'zzzz');

    expect(wrapper.find('[data-testid="search-empty"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Sin coincidencias');
  });

  it('navega a la ficha del alumno al seleccionar un resultado', async () => {
    studentService.searchStudents.mockResolvedValue({ items: [searchItem()] });
    const { wrapper, router } = await mountSearch();
    await typeAndSearch(wrapper, 'iker');
    await flushPromises();

    await wrapper.find('[data-testid="search-item"]').trigger('mousedown');
    await flushPromises();

    expect(router.currentRoute.value.name).toBe('student-detail');
    expect(router.currentRoute.value.params).toEqual({
      centerId: 'c-2',
      sectionId: 's-4',
      studentId: 'stu-7'
    });
  });

  it('navega con teclado: flecha abajo y Enter (Escenario 4)', async () => {
    studentService.searchStudents.mockResolvedValue({
      items: [searchItem({ id: 'stu-1', name: 'María García López' }), searchItem()]
    });
    const { wrapper, router } = await mountSearch();
    await typeAndSearch(wrapper, 'iker');
    await flushPromises();

    const input = wrapper.find('[data-testid="search-input"]');
    await input.trigger('keydown', { key: 'ArrowDown' });
    await input.trigger('keydown', { key: 'Enter' });
    await flushPromises();

    expect(router.currentRoute.value.params.studentId).toBe('stu-7');
  });

  it('cierra el panel con Escape y con borrado', async () => {
    studentService.searchStudents.mockResolvedValue({ items: [searchItem()] });
    const { wrapper } = await mountSearch();
    await typeAndSearch(wrapper, 'iker');
    await flushPromises();

    expect(wrapper.find('[data-testid="search-panel"]').exists()).toBe(true);

    await wrapper.find('[data-testid="search-input"]').trigger('keydown', { key: 'Escape' });
    await flushPromises();
    expect(wrapper.find('[data-testid="search-panel"]').exists()).toBe(false);

    await typeAndSearch(wrapper, 'ma');
    await flushPromises();
    await wrapper.find('[data-testid="search-clear"]').trigger('click');
    await flushPromises();
    expect(wrapper.find('[data-testid="search-panel"]').exists()).toBe(false);
  });
});