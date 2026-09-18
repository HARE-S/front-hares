import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ReportsView from '../views/reports/ReportsView.vue';
import { _resetInMemoryResults } from '../services/resultsService';

describe('FE-36, FE-37, FE-38: Informes, Exportación y Expedientes', () => {
  const mockData = [
    {
      id: 'res-1',
      studentId: '1',
      studentName: 'Lucas Méndez Ruiz',
      testId: '1IF',
      testName: 'La Vaca',
      sectionId: 'sec-1',
      testDate: '2026-09-10',
      time: 55,
      successes: 18,
      mistakes: 1,
      ppm: 118,
      vef: 106,
      band: 'En nivel'
    },
    {
      id: 'res-2',
      studentId: '1',
      studentName: 'Lucas Méndez Ruiz',
      testId: '1LF',
      testName: 'El Perro Cantor',
      sectionId: 'sec-1',
      testDate: '2026-09-15',
      time: 50,
      successes: 20,
      mistakes: 0,
      ppm: 130,
      vef: 130,
      band: 'Avanzado'
    },
    {
      id: 'res-3',
      studentId: '2',
      studentName: 'Sofía Navarro Ortiz',
      testId: '1IF',
      testName: 'La Vaca',
      sectionId: 'sec-1',
      testDate: '2026-09-10',
      time: 75,
      successes: 14,
      mistakes: 3,
      ppm: 86,
      vef: 60,
      band: 'Requiere apoyo'
    }
  ];

  beforeEach(() => {
    _resetInMemoryResults(mockData);
  });

  describe('FE-38: Informe Agregado de Grupo', () => {
    it('FE-38 Escenarios 1 y 2: Muestra medias del grupo y distribución por bandas de rendimiento', async () => {
      const wrapper = mount(ReportsView);
      await flushPromises();

      // Comprobar tarjetas de agregados
      expect(wrapper.text()).toContain('Informe Agregado de Rendimiento Lector');
      expect(wrapper.find('.metrics-summary-grid').exists()).toBe(true);
      expect(wrapper.text()).toContain('Velocidad Eficaz Media');
      expect(wrapper.text()).toContain('Alumnos Evaluados');

      // Comprobar sección de distribución por bandas (Escenario 2)
      expect(wrapper.text()).toContain('Distribución del Alumnado por Bandas de Rendimiento');
      expect(wrapper.find('.bands-progress-list').exists()).toBe(true);
      expect(wrapper.text()).toContain('Avanzado');
      expect(wrapper.text()).toContain('En nivel');
      expect(wrapper.text()).toContain('Requiere apoyo');
    });

    it('FE-38 Escenario 4: Grupo sin datos indica ausencia y no muestra medias calculadas sobre cero', async () => {
      const wrapper = mount(ReportsView);
      await flushPromises();

      // Cambiar a sección sin datos ('sec-vacia')
      const sectionSelect = wrapper.find('#group-section-select');
      await sectionSelect.setValue('sec-vacia');
      await flushPromises();

      expect(wrapper.find('.empty-report-card').exists()).toBe(true);
      expect(wrapper.text()).toContain('Sin evaluaciones registradas en esta sección');
      expect(wrapper.text()).toContain('No se computan medias sobre cero');
      expect(wrapper.find('.metrics-summary-grid').exists()).toBe(false);
    });
  });

  describe('FE-37: Informe Individual de Alumno Imprimible', () => {
    it('FE-37 Escenarios 1 y 3: Muestra datos del alumno, cabecera de centro y fecha de emisión', async () => {
      const wrapper = mount(ReportsView);
      await flushPromises();

      // Cambiar a pestaña de informe individual
      const studentTabBtn = wrapper.findAll('.tab-btn')[1];
      await studentTabBtn.trigger('click');
      await flushPromises();

      expect(wrapper.find('.student-doc-sheet').exists()).toBe(true);
      expect(wrapper.text()).toContain('Expediente Individual de Lectura');
      expect(wrapper.text()).toContain('Fundación Peñascal');
      expect(wrapper.text()).toContain('Fecha y hora:');
      expect(wrapper.text()).toContain('Lucas Méndez Ruiz');
      expect(wrapper.text()).toContain('La Vaca');
      expect(wrapper.text()).toContain('El Perro Cantor');

      // Botón de imprimir en A4 visible
      expect(wrapper.find('.btn-action-print').exists()).toBe(true);
    });
  });

  describe('FE-36: Exportación a Hoja de Cálculo', () => {
    it('FE-36 Escenarios 2 y 4: Muestra el recuento de registros y deshabilita si no hay datos', async () => {
      const wrapper = mount(ReportsView);
      await flushPromises();

      // Cambiar a pestaña de exportación
      const exportTabBtn = wrapper.findAll('.tab-btn')[2];
      await exportTabBtn.trigger('click');
      await flushPromises();

      expect(wrapper.find('.export-card').exists()).toBe(true);
      expect(wrapper.text()).toContain('Descarga de Datos en Hoja de Cálculo');

      // Contador de registros para sec-1
      expect(wrapper.find('.counter-number').text()).toBe('3');
      const downloadBtn = wrapper.find('.btn--download');
      expect(downloadBtn.attributes('disabled')).toBeUndefined();

      // Cambiar a sección sin datos
      const sectionSelect = wrapper.find('#exp-section');
      await sectionSelect.setValue('sec-vacia');
      await flushPromises();

      // Contador pasa a 0 y el botón se deshabilita (Escenario 4)
      expect(wrapper.find('.counter-number').text()).toBe('0');
      expect(downloadBtn.attributes('disabled')).toBeDefined();
      expect(wrapper.find('.no-data-hint').exists()).toBe(true);
    });
  });
});
