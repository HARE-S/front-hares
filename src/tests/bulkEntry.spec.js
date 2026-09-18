import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import BulkEntryView from '../views/bulk-entry/BulkEntryView.vue';
import { _resetInMemoryResults, _getInMemoryResults } from '../services/resultsService';

describe('FE-20 y FE-13: Registro de Resultados en Lote y Uso en Tableta', () => {
  beforeEach(() => {
    _resetInMemoryResults([]);
  });

  it('FE-20 Escenario 1: Rejilla del grupo muestra alumnos con tres campos por fila (tiempo, aciertos, errores)', async () => {
    const wrapper = mount(BulkEntryView, {
      props: { userRole: 'tutor' }
    });
    await flushPromises();

    // Comprobar selectores de sesión
    expect(wrapper.find('#section-select').exists()).toBe(true);
    expect(wrapper.find('#test-select').exists()).toBe(true);
    expect(wrapper.find('#date-select').exists()).toBe(true);

    // Comprobar filas de alumnos
    const rows = wrapper.findAll('.batch-table tbody tr');
    expect(rows.length).toBeGreaterThan(0);

    // Cada fila tiene los 3 inputs
    const firstRow = rows[0];
    expect(firstRow.find('input[type="number"][placeholder="ej. 55"]').exists()).toBe(true);
    expect(firstRow.find('input[type="number"][placeholder="0-20"]').exists()).toBe(true);
    expect(firstRow.find('input[type="number"][placeholder="0"]').exists()).toBe(true);
  });

  it('FE-13 Escenario 2: Los campos numéricos tienen inputmode="numeric" para abrir teclado numérico en tableta', async () => {
    const wrapper = mount(BulkEntryView);
    await flushPromises();

    const numericInputs = wrapper.findAll('.grid-input');
    expect(numericInputs.length).toBeGreaterThan(0);

    numericInputs.forEach(input => {
      expect(input.attributes('inputmode')).toBe('numeric');
    });
  });

  it('FE-20 Escenario 2: Alumnos ausentes no generan resultado y NO se registran con valores a cero', async () => {
    const wrapper = mount(BulkEntryView);
    await flushPromises();

    const rows = wrapper.findAll('.batch-table tbody tr');

    // Rellenamos solo el primer alumno
    const firstTime = rows[0].find('.grid-input--time');
    await firstTime.setValue('50');

    // Los demás quedan en blanco o marcados como ausentes
    const secondAbsentBtn = rows[1].find('.btn-toggle-absent');
    await secondAbsentBtn.trigger('click');

    // Guardamos el lote
    const saveBtn = wrapper.find('.btn--save-batch');
    await saveBtn.trigger('click');
    await flushPromises();

    // Verificamos el banner de éxito
    expect(wrapper.find('.success-banner').exists()).toBe(true);
    expect(wrapper.text()).toContain('Se han guardado correctamente 1 evaluaciones');
    expect(wrapper.text()).toContain('alumnos ausentes sin registrar valores a cero');

    // Comprobamos en el store que solo se guardó 1 registro
    const saved = _getInMemoryResults();
    expect(saved).toHaveLength(1);
    expect(saved[0].studentId).toBe('1');
    expect(saved[0].time).toBe(50);
  });

  it('FE-20 Escenario 4: Fila inválida señala el error sin perder los datos de las demás filas', async () => {
    const wrapper = mount(BulkEntryView);
    await flushPromises();

    const rows = wrapper.findAll('.batch-table tbody tr');

    // Fila 1: tiempo válido
    const row1Time = rows[0].find('.grid-input--time');
    await row1Time.setValue('60');

    // Fila 2: tiempo inválido (-5)
    const row2Time = rows[1].find('.grid-input--time');
    await row2Time.setValue('-5');

    // Intentamos guardar
    const saveBtn = wrapper.find('.btn--save-batch');
    await saveBtn.trigger('click');
    await flushPromises();

    // Muestra error general y resalta la fila inválida
    expect(wrapper.find('.error-banner').exists()).toBe(true);
    expect(wrapper.find('.row-error-text').exists()).toBe(true);
    expect(wrapper.find('.row-error-text').text()).toContain('El tiempo debe ser mayor a 0');

    // Comprobamos que la fila 1 NO perdió su valor '60'
    expect(row1Time.element.value).toBe('60');
  });

  it('permite alternar el estado ausente mediante el botón de la fila', async () => {
    const wrapper = mount(BulkEntryView);
    await flushPromises();

    const firstRow = wrapper.findAll('.batch-table tbody tr')[0];
    const absentBtn = firstRow.find('.btn-toggle-absent');

    expect(absentBtn.text()).toContain('Presente');
    await absentBtn.trigger('click');
    expect(absentBtn.text()).toContain('Ausente');
    expect(firstRow.classes()).toContain('row--absent');
  });
});
