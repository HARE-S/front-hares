import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ComparisonView from '@/views/comparison/ComparisonView.vue';
import { ForbiddenError } from '@/services/api';

const { mockRole } = vi.hoisted(() => ({ mockRole: { current: 'admin' } }));

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { role: mockRole.current, sections: [] } }
  })
}));

vi.mock('@/services/directoryService', () => ({
  getCenters: vi.fn(),
  getCenterSections: vi.fn()
}));

vi.mock('@/services/comparisonService', () => ({
  getGroupComparison: vi.fn()
}));

vi.mock('@/services/sectionsService', () => ({
  getGroupProgress: vi.fn()
}));

import { getCenters, getCenterSections } from '@/services/directoryService';
import { getGroupComparison } from '@/services/comparisonService';
import { getGroupProgress } from '@/services/sectionsService';

const CENTERS = [
  { id: 'c-1', name: 'Peñascal Norte', sections_count: 3 },
  { id: 'c-2', name: 'Peñascal Sur', sections_count: 1 }
];

const SECTIONS = [
  { id: 's-1', name: '1º ESO A', center_id: 'c-1', students_count: 24 },
  { id: 's-2', name: '1º ESO B', center_id: 'c-1', students_count: 3 },
  { id: 's-3', name: '1º ESO C', center_id: 'c-1', students_count: 0 }
];

const GROUPS = [
  {
    id: 's-1',
    name: '1º ESO A',
    center_name: 'Peñascal Norte',
    has_data: true,
    students_count: 24,
    results_count: 48,
    mean_ppm: 152.3,
    mean_accuracy: 82.4,
    is_representative: true,
    warning: null
  },
  {
    id: 's-2',
    name: '1º ESO B',
    center_name: 'Peñascal Norte',
    has_data: true,
    students_count: 3,
    results_count: 6,
    mean_ppm: 118.9,
    mean_accuracy: 71.2,
    is_representative: false,
    warning: 'Grupo poco representativo: menos de 5 alumnos con resultados'
  },
  {
    id: 's-3',
    name: '1º ESO C',
    center_name: 'Peñascal Norte',
    has_data: false,
    students_count: 0,
    results_count: 0,
    mean_ppm: null,
    mean_accuracy: null,
    is_representative: false,
    warning: 'Grupo sin resultados registrados'
  }
];

function mountView() {
  return mount(ComparisonView, {
    global: { stubs: { GroupComparisonChart: true } }
  });
}

async function selectSectionComparison() {
  getCenters.mockResolvedValue(CENTERS);
  getCenterSections.mockResolvedValue(SECTIONS);

  const wrapper = mountView();
  await flushPromises();

  await wrapper.get('[data-testid="center-select"]').setValue('c-1');
  await flushPromises();

  await wrapper.get('[data-testid="section-check-s-1"]').setChecked(true);
  await wrapper.get('[data-testid="section-check-s-2"]').setChecked(true);

  return wrapper;
}

describe('FE-32 — Comparativa por grupos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRole.current = 'admin';
  });

  describe('Escenario 1 y 2 — Varios grupos con tamaño de muestra', () => {
    it('representa las medias de los grupos y muestra alumnos + pruebas junto a cada media', async () => {
      const wrapper = await selectSectionComparison();

      getGroupComparison.mockResolvedValue({ group_by: 'section', min_sample: 5, groups: GROUPS });
      getGroupProgress.mockImplementation(async (id) => ({
        global:
          id === 's-1'
            ? { improved: 14, measurable: 20, percentage: 70.0 }
            : { improved: 2, measurable: 3, percentage: 66.67 }
      }));

      await wrapper.get('[data-testid="run-comparison"]').trigger('click');
      await flushPromises();

      expect(wrapper.get('[data-testid="comparison-results"]').exists()).toBe(true);
      expect(wrapper.get('[data-testid="comparison-chart"]').exists()).toBe(true);
      expect(wrapper.findAll('[data-testid="group-row"]')).toHaveLength(3);

      const meta = wrapper.get('[data-testid="min-sample-value"]');
      expect(meta.text()).toBe('5');

      const rowOne = wrapper.findAll('[data-testid="group-row"]')[0];
      expect(rowOne.get('[data-testid="group-students"]').text()).toBe('24');
      expect(rowOne.get('[data-testid="group-results"]').text()).toBe('48');
      expect(rowOne.get('[data-testid="group-ppm"]').text()).toBe('152');

      expect(getGroupComparison).toHaveBeenCalledWith({
        groupBy: 'section',
        sectionIds: ['s-1', 's-2'],
        centerId: 'c-1',
        minSample: null,
        startDate: null,
        endDate: null
      });
    });

    it('pide mínimo de dos grupos antes de generar', async () => {
      const wrapper = await selectSectionComparison();

      await wrapper.get('[data-testid="section-check-s-1"]').setChecked(false);
      await wrapper.get('[data-testid="run-comparison"]').trigger('click');
      await flushPromises();

      expect(wrapper.get('[data-testid="validation-message"]').text()).toContain('al menos dos secciones');
      expect(getGroupComparison).not.toHaveBeenCalled();
    });
  });

  describe('Escenario 3 — Grupo poco representativo', () => {
    it('marca el grupo con menos alumnos que el mínimo y acompaña su media de la advertencia', async () => {
      const wrapper = await selectSectionComparison();

      getGroupComparison.mockResolvedValue({ group_by: 'section', min_sample: 5, groups: GROUPS });
      getGroupProgress.mockResolvedValue(null);

      await wrapper.get('[data-testid="run-comparison"]').trigger('click');
      await flushPromises();

      const warning = wrapper.get('[data-testid="group-status-not-representative"]');
      expect(warning.text()).toBe('Poco representativo');
      expect(warning.attributes('title')).toContain('menos de 5 alumnos');
    });
  });

  describe('Escenario 4 — Grupo sin datos', () => {
    it('se muestra como sin datos y jamás como un cero', async () => {
      const wrapper = await selectSectionComparison();

      getGroupComparison.mockResolvedValue({ group_by: 'section', min_sample: 5, groups: GROUPS });
      getGroupProgress.mockResolvedValue(null);

      await wrapper.get('[data-testid="run-comparison"]').trigger('click');
      await flushPromises();

      const noData = wrapper.get('[data-testid="group-status-no-data"]');
      expect(noData.text()).toBe('Sin datos');

      const rowNoData = wrapper.findAll('[data-testid="group-row"]')[2];
      expect(rowNoData.get('[data-testid="group-ppm"]').text()).toBe('-');
      expect(rowNoData.get('[data-testid="group-accuracy"]').text()).toBe('-');
      expect(rowNoData.text()).not.toContain('0 PPM');
    });
  });

  describe('Escenario 5 — Progreso por recuento (alumnos que mejoran)', () => {
    it('indica cuántos alumnos mejoran y en qué porcentaje, no la media de diferencias', async () => {
      const wrapper = await selectSectionComparison();

      getGroupComparison.mockResolvedValue({ group_by: 'section', min_sample: 5, groups: GROUPS });
      getGroupProgress.mockImplementation(async () => ({
        global: { improved: 14, measurable: 20, percentage: 70.0 }
      }));

      await wrapper.get('[data-testid="run-comparison"]').trigger('click');
      await flushPromises();

      const progressCell = wrapper.findAll('[data-testid="group-row"]')[0].get('[data-testid="group-progress"]');
      expect(progressCell.text()).toContain('14 de 20 alumnos mejoran');
      expect(progressCell.text()).toContain('70%');
    });
  });

  describe('Escenario 6 — Alcance por rol', () => {
    it('un tutor no ve la comparativa entre centros y se le indica su alcance', async () => {
      mockRole.current = 'tutor';
      getCenters.mockResolvedValue(CENTERS);

      const wrapper = mountView();
      await flushPromises();

      const options = wrapper.findAll('.groupby-option');
      expect(options.map((o) => o.text().trim())).toEqual(['Secciones', 'Perfiles']);
      expect(wrapper.get('[data-testid="tutor-scope-note"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('no está disponible para tu rol');
    });

    it('un 403 del backend muestra el bloque de permiso denegado', async () => {
      const wrapper = await selectSectionComparison();

      getGroupComparison.mockRejectedValue(
        new ForbiddenError('Las comparativas entre centros solo están disponibles para el coordinador')
      );

      await wrapper.get('[data-testid="run-comparison"]').trigger('click');
      await flushPromises();

      expect(wrapper.get('[data-testid="comparison-forbidden"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="comparison-results"]').exists()).toBe(false);
    });
  });

  describe('Sin resultados', () => {
    it('muestra el estado vacío cuando no hay grupos', async () => {
      const wrapper = await selectSectionComparison();

      getGroupComparison.mockResolvedValue({ group_by: 'section', min_sample: 5, groups: [] });

      await wrapper.get('[data-testid="run-comparison"]').trigger('click');
      await flushPromises();

      expect(wrapper.get('[data-testid="comparison-empty"]').exists()).toBe(true);
    });
  });
});