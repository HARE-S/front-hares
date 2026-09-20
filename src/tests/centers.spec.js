import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import CentersListView from '@/views/centers/CentersListView.vue';
import CenterDetailView from '@/views/centers/CenterDetailView.vue';
import SectionStudentsView from '@/views/centers/SectionStudentsView.vue';

vi.mock('@/services/directoryService', () => ({
  getCenters: vi.fn(),
  getCenterSections: vi.fn(),
  getSectionStudents: vi.fn()
}));

import {
  getCenters,
  getCenterSections,
  getSectionStudents
} from '@/services/directoryService';

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/centers', name: 'centers', component: CentersListView },
      {
        path: '/centers/:centerId',
        name: 'center-detail',
        component: CenterDetailView,
        props: true
      },
      {
        path: '/centers/:centerId/sections/:sectionId/students',
        name: 'section-students',
        component: SectionStudentsView,
        props: true
      },
      {
        path: '/centers/:centerId/sections/:sectionId/students/:studentId',
        name: 'student-detail',
        component: { template: '<div></div>' }
      }
    ]
  });
}

async function mountAt(view, location, props = {}) {
  const router = buildRouter();
  await router.push(location);
  await router.isReady();
  return mount(view, { props, global: { plugins: [router] } });
}

describe('FE-25 — Navegación por centros, secciones y alumnado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Escenario 1 y 5 — Listado de centros y solo lectura', () => {
    it('muestra los centros activos con cuántas secciones tiene cada uno', async () => {
      getCenters.mockResolvedValue([
        { id: 'c-1', name: 'Centro Norte', sections_count: 3 },
        { id: 'c-2', name: 'Centro Sur', sections_count: 1 }
      ]);

      const wrapper = await mountAt(CentersListView, '/centers');
      await flushPromises();

      expect(wrapper.text()).toContain('Centro Norte');
      expect(wrapper.text()).toContain('Centro Sur');
      const counts = wrapper.findAll('[data-testid="center-row"]');
      expect(counts).toHaveLength(2);
      expect(wrapper.text()).toContain('3');
      expect(wrapper.text()).toContain('1');
    });

    it('escenario 5: indica que los datos proceden de Alexia y no ofrece crear/editar', async () => {
      getCenters.mockResolvedValue([{ id: 'c-1', name: 'Centro Norte', sections_count: 3 }]);

      const wrapper = await mountAt(CentersListView, '/centers');
      await flushPromises();

      expect(wrapper.text()).toContain('proceden de Alexia');
      expect(wrapper.text()).toContain('solo lectura');
      expect(wrapper.find('button').exists()).toBe(false);
    });

    it('escenario 4: el listado refleja solo el ámbito que devuelve el backend (sin centro ajeno)', async () => {
      getCenters.mockResolvedValue([
        { id: 'c-1', name: 'Centro Norte', sections_count: 2 }
      ]);

      const wrapper = await mountAt(CentersListView, '/centers');
      await flushPromises();

      expect(wrapper.text()).toContain('Centro Norte');
      expect(wrapper.text()).not.toContain('Centro Sur');
      expect(wrapper.findAll('[data-testid="center-row"]')).toHaveLength(1);
    });

    it('muestra error y permite reintentar', async () => {
      getCenters
        .mockRejectedValueOnce(new Error('No se pudo conectar'))
        .mockResolvedValueOnce([{ id: 'c-1', name: 'Centro Norte', sections_count: 3 }]);

      const wrapper = await mountAt(CentersListView, '/centers');
      await flushPromises();

      expect(wrapper.text()).toContain('No se pudo conectar');

      await wrapper.findAll('button').find((b) => b.text().includes('Reintentar')).trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Centro Norte');
    });
  });

  describe('Escenario 2 — Secciones de un centro', () => {
    it('muestra las secciones del centro con el número de alumnos', async () => {
      getCenters.mockResolvedValue([{ id: 'c-1', name: 'Centro Norte', sections_count: 3 }]);
      getCenterSections.mockResolvedValue([
        { id: 's-1', name: '1º ESO A', center_id: 'c-1', students_count: 2 },
        { id: 's-2', name: '1º ESO B', center_id: 'c-1', students_count: 0 }
      ]);

      const wrapper = await mountAt(CenterDetailView, '/centers/c-1', { centerId: 'c-1' });
      await flushPromises();

      expect(wrapper.text()).toContain('1º ESO A');
      expect(wrapper.text()).toContain('1º ESO B');
      expect(wrapper.find('[data-testid="breadcrumb-center"]').text()).toContain('Centro Norte');
      const counts = wrapper.findAll('[data-testid="students-count"]');
      expect(counts[0].text()).toBe('2');
      expect(counts[1].text()).toBe('0');
    });

    it('escenario 4: un tutor solo ve las secciones asignadas que devuelve el backend', async () => {
      getCenters.mockResolvedValue([{ id: 'c-1', name: 'Centro Norte', sections_count: 1 }]);
      getCenterSections.mockResolvedValue([
        { id: 's-2', name: '1º ESO B', center_id: 'c-1', students_count: 3 }
      ]);

      const wrapper = await mountAt(CenterDetailView, '/centers/c-1', { centerId: 'c-1' });
      await flushPromises();

      expect(wrapper.text()).toContain('1º ESO B');
      expect(wrapper.text()).not.toContain('1º ESO A');
    });
  });

  describe('Escenarios 3, 4 y 6 — Alumnado de una sección', () => {
    it('escenario 3: lista el alumnado y cada nombre enlaza a su ficha', async () => {
      getCenters.mockResolvedValue([{ id: 'c-1', name: 'Centro Norte', sections_count: 3 }]);
      getCenterSections.mockResolvedValue([
        { id: 's-1', name: '1º ESO A', center_id: 'c-1', students_count: 2 }
      ]);
      getSectionStudents.mockResolvedValue([
        { id: 'stu-1', name: 'Aitor Ortiz', external_id: 'AIT-001' },
        { id: 'stu-2', name: 'Leire Blanco', external_id: 'LEI-002' }
      ]);

      const wrapper = await mountAt(SectionStudentsView, '/centers/c-1/sections/s-1/students', {
        centerId: 'c-1',
        sectionId: 's-1'
      });
      await flushPromises();

      expect(wrapper.text()).toContain('Aitor Ortiz');
      expect(wrapper.text()).toContain('Leire Blanco');
      const link = wrapper.find('[data-testid="student-link"]');
      expect(link.attributes('href')).toContain('/centers/c-1/sections/s-1/students/stu-1');
    });

    it('escenario 6: una sección vacía explica la posible importación pendiente', async () => {
      getCenters.mockResolvedValue([{ id: 'c-1', name: 'Centro Norte', sections_count: 3 }]);
      getCenterSections.mockResolvedValue([
        { id: 's-3', name: '1º ESO C', center_id: 'c-1', students_count: 0 }
      ]);
      getSectionStudents.mockResolvedValue([]);

      const wrapper = await mountAt(SectionStudentsView, '/centers/c-1/sections/s-3/students', {
        centerId: 'c-1',
        sectionId: 's-3'
      });
      await flushPromises();

      expect(wrapper.find('[data-testid="empty-section"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('no tiene alumnado matriculado');
      expect(wrapper.text()).toContain('volcado de Alexia');
    });

    it('escenario 4: acceso denegado a una sección ajena muestra el error', async () => {
      getCenters.mockResolvedValue([{ id: 'c-1', name: 'Centro Norte', sections_count: 1 }]);
      getCenterSections.mockResolvedValue([]);
      getSectionStudents.mockRejectedValue(new Error('Acceso denegado'));

      const wrapper = await mountAt(SectionStudentsView, '/centers/c-1/sections/s-9/students', {
        centerId: 'c-1',
        sectionId: 's-9'
      });
      await flushPromises();

      expect(wrapper.text()).toContain('Acceso denegado');
      expect(wrapper.findAll('button').some((b) => b.text().includes('Reintentar'))).toBe(true);
    });
  });
});