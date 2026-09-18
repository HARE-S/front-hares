import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import KpiOverview from '../components/dashboard/KpiOverview.vue';
import FluencyChart from '../components/dashboard/FluencyChart.vue';
import LevelsDistribution from '../components/dashboard/LevelsDistribution.vue';
import RecentAssessmentsTable from '../components/dashboard/RecentAssessmentsTable.vue';
import DashboardView from '../views/dashboard/DashboardView.vue';

describe('Dashboard Docente de Fluidez Lectora (Stitch Design System)', () => {
  describe('KpiOverview.vue', () => {
    it('renderiza las 4 métricas KPI clave con sus valores exactos', () => {
      const wrapper = mount(KpiOverview);
      const text = wrapper.text();

      expect(text).toContain('Velocidad Media del Aula');
      expect(text).toContain('100');
      expect(text).toContain('PPM');
      expect(text).toContain('+8% vs. Corte Inicial');

      expect(text).toContain('Alumnos Evaluados');
      expect(text).toContain('10');
      expect(text).toContain('/ 12');

      expect(text).toContain('Libros Leídos');
      expect(text).toContain('94');
      expect(text).toContain('títulos');

      expect(text).toContain('Requieren Apoyo');
      expect(text).toContain('4');
    });

    it('emite el evento "view-support" al pulsar en el botón de refuerzo de la alerta', async () => {
      const wrapper = mount(KpiOverview);
      const reinforceBtn = wrapper.find('.alert-btn');
      expect(reinforceBtn.exists()).toBe(true);

      await reinforceBtn.trigger('click');
      expect(wrapper.emitted('view-support')).toBeTruthy();
      expect(wrapper.emitted('view-support').length).toBe(1);
    });
  });

  describe('FluencyChart.vue', () => {
    it('renderiza el lienzo SVG interactivo, leyenda y el baremo de meta de curso', () => {
      const wrapper = mount(FluencyChart);
      expect(wrapper.find('svg').exists()).toBe(true);
      expect(wrapper.text()).toContain('Progreso de Fluidez Lectora (PPM)');
      expect(wrapper.text()).toContain('Media Aula 3A');
      expect(wrapper.text()).toContain('Baremo Estándar (Fundación Peñascal)');
      expect(wrapper.text()).toContain('Meta Final de Curso: 125 PPM');
    });

    it('permite alternar entre la vista Trimestral y Anual', async () => {
      const wrapper = mount(FluencyChart);
      const buttons = wrapper.findAll('.period-segmented .seg-btn');
      expect(buttons.length).toBe(2);

      const annualBtn = buttons[1];
      expect(annualBtn.text()).toBe('Anual');

      await annualBtn.trigger('click');
      expect(annualBtn.classes()).toContain('active');
    });

    it('muestra el diagnóstico pedagógico longitudinal automatizado', () => {
      const wrapper = mount(FluencyChart);
      expect(wrapper.text()).toContain('Diagnóstico pedagógico:');
      expect(wrapper.text()).toContain('13 PPM');
    });
  });

  describe('LevelsDistribution.vue', () => {
    it('renderiza los 4 niveles de distribución y calcula un total de 26 alumnos', () => {
      const wrapper = mount(LevelsDistribution);
      expect(wrapper.text()).toContain('Distribución de Niveles');
      expect(wrapper.text()).toContain('26 alumnos');

      // Nivel Avanzado
      expect(wrapper.text()).toContain('Nivel Avanzado (>125 PPM)');
      expect(wrapper.text()).toContain('7 alum.');
      expect(wrapper.text()).toContain('(27%)');

      // En Nivel Óptimo
      expect(wrapper.text()).toContain('En Nivel Óptimo (105-125 PPM)');
      expect(wrapper.text()).toContain('14 alum.');
      expect(wrapper.text()).toContain('(54%)');

      // En Desarrollo
      expect(wrapper.text()).toContain('En Desarrollo (85-104 PPM)');
      expect(wrapper.text()).toContain('2 alum.');
      expect(wrapper.text()).toContain('(8%)');

      // Necesita Intervención
      expect(wrapper.text()).toContain('Necesita Intervención (<85 PPM)');
      expect(wrapper.text()).toContain('3 alum.');
      expect(wrapper.text()).toContain('(11%)');
    });

    it('emite el evento "open-intervention" al pulsar la acción pedagógica sugerida', async () => {
      const wrapper = mount(LevelsDistribution);
      const actionBtn = wrapper.find('.action-link');
      expect(actionBtn.exists()).toBe(true);

      await actionBtn.trigger('click');
      expect(wrapper.emitted('open-intervention')).toBeTruthy();
    });
  });

  describe('RecentAssessmentsTable.vue', () => {
    it('renderiza el listado inicial con 6 evaluaciones y paginador del Corte A', () => {
      const wrapper = mount(RecentAssessmentsTable);
      const rows = wrapper.findAll('.table-row');
      expect(rows.length).toBe(6);
      expect(wrapper.text()).toContain('Mostrando 6 de 6 evaluaciones registradas en el Corte A');
    });

    it('filtra en tiempo real por el nombre del alumno o código de prueba', async () => {
      const wrapper = mount(RecentAssessmentsTable);
      const searchInput = wrapper.find('.search-input');

      await searchInput.setValue('Lucas');
      expect(wrapper.findAll('.table-row').length).toBe(1);
      expect(wrapper.text()).toContain('Lucas Méndez Ruiz');
      expect(wrapper.text()).not.toContain('Mateo Barrenechea');

      await searchInput.setValue('3BL');
      expect(wrapper.findAll('.table-row').length).toBe(1);
      expect(wrapper.text()).toContain('Mateo Barrenechea');
    });

    it('filtra por tipo de prueba seleccionado', async () => {
      const wrapper = mount(RecentAssessmentsTable);
      const select = wrapper.find('.filter-select');

      await select.setValue('Pseudopalabras');
      const rows = wrapper.findAll('.table-row');
      expect(rows.length).toBe(1);
      expect(wrapper.text()).toContain('Iker Goikoetxea');
    });

    it('emite "export" al pulsar el botón de descarga', async () => {
      const wrapper = mount(RecentAssessmentsTable);
      const downloadBtn = wrapper.find('.download-btn');

      await downloadBtn.trigger('click');
      expect(wrapper.emitted('export')).toBeTruthy();
      expect(wrapper.emitted('export')[0][0].length).toBe(6);
    });

    it('emite "play-audio" y "view-detail" en las acciones de fila', async () => {
      const wrapper = mount(RecentAssessmentsTable);
      const audioBtn = wrapper.find('.btn-audio');
      const detailBtn = wrapper.find('.btn-detail');

      await audioBtn.trigger('click');
      expect(wrapper.emitted('play-audio')).toBeTruthy();

      await detailBtn.trigger('click');
      expect(wrapper.emitted('view-detail')).toBeTruthy();
    });
  });

  describe('DashboardView.vue', () => {
    it('ensambla correctamente la cabecera, KPIs, analítica dividida y la tabla', () => {
      const wrapper = mount(DashboardView);
      expect(wrapper.find('h1.page-title').text()).toBe('Panel de Rendimiento Lector');
      expect(wrapper.text()).toContain('Baremo Oficial 2024');
      expect(wrapper.findComponent(KpiOverview).exists()).toBe(true);
      expect(wrapper.findComponent(FluencyChart).exists()).toBe(true);
      expect(wrapper.findComponent(LevelsDistribution).exists()).toBe(true);
      expect(wrapper.findComponent(RecentAssessmentsTable).exists()).toBe(true);
    });

    it('emite "new-assessment" al hacer clic en el botón principal "+ Nueva Evaluación en Directo"', async () => {
      const wrapper = mount(DashboardView);
      const primaryBtn = wrapper.find('.btn-dashboard--primary');
      expect(primaryBtn.exists()).toBe(true);

      await primaryBtn.trigger('click');
      expect(wrapper.emitted('new-assessment')).toBeTruthy();
    });

    it('muestra mensajes de feedback reactivos al interactuar con las acciones del dashboard', async () => {
      const wrapper = mount(DashboardView);
      const assignBtn = wrapper.findAll('.btn-dashboard--secondary')[0];

      await assignBtn.trigger('click');
      expect(wrapper.find('.feedback-banner').exists()).toBe(true);
      expect(wrapper.text()).toContain('Módulo de asignación de libros');
    });
  });
});
