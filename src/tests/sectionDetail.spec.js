import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import SectionDetailView from '../views/section-detail/SectionDetailView.vue';
import EditResultModal from '../components/results/EditResultModal.vue';
import { _resetInMemoryResults, _getInMemoryResults } from '../services/resultsService';

describe('FE-29 y FE-19: Historial de Sección y Corrección/Anulación de Resultados', () => {
  const mockData = [
    {
      id: 'res-101',
      studentId: '1',
      studentName: 'Lucas Méndez',
      testId: '1IF',
      testName: 'La Vaca',
      sectionId: 'sec-1',
      testDate: '2026-09-18',
      time: 60,
      successes: 18,
      mistakes: 1,
      ppm: 108,
      vef: 97,
      band: 'En nivel'
    },
    {
      id: 'res-102',
      studentId: '2',
      studentName: 'Sofía Navarro',
      testId: '1IF',
      testName: 'La Vaca',
      sectionId: 'sec-1',
      testDate: '2026-09-18',
      time: 70,
      successes: 14,
      mistakes: 3,
      ppm: 93,
      vef: 65,
      band: 'Requiere apoyo'
    }
  ];

  beforeEach(() => {
    _resetInMemoryResults(mockData);
  });

  it('FE-29 Escenario 1: Muestra el histórico de resultados de los alumnos de la sección', async () => {
    const wrapper = mount(SectionDetailView, {
      props: { sectionId: 'sec-1' }
    });
    await flushPromises();

    expect(wrapper.find('h1').text()).toContain('Historial de Pruebas de Sección');
    expect(wrapper.text()).toContain('Lucas Méndez');
    expect(wrapper.text()).toContain('Sofía Navarro');
    expect(wrapper.text()).toContain('La Vaca');
  });

  it('FE-29 Escenario 2: Alternador de agrupación por prueba reúne las evaluaciones de la misma prueba', async () => {
    const wrapper = mount(SectionDetailView, {
      props: { sectionId: 'sec-1' }
    });
    await flushPromises();

    // Cambiar a vista por prueba
    const testGroupBtn = wrapper.findAll('.switch-btn')[1];
    await testGroupBtn.trigger('click');
    await flushPromises();

    // Verifica que se muestra el bloque de prueba agrupado
    expect(wrapper.find('.test-group-block').exists()).toBe(true);
    expect(wrapper.find('.group-title-box h3').text()).toBe('La Vaca');
    expect(wrapper.find('.badge-count').text()).toContain('2 evaluaciones');
  });

  it('FE-19 Escenario 1 y 2: Permite editar un resultado y recalcula sus métricas', async () => {
    const wrapper = mount(SectionDetailView, {
      props: { sectionId: 'sec-1' }
    });
    await flushPromises();

    // Pulsar botón de editar en la primera fila
    const editBtn = wrapper.find('.action-btn--edit');
    await editBtn.trigger('click');
    await flushPromises();

    // El modal se abre
    const modal = wrapper.findComponent(EditResultModal);
    expect(modal.exists()).toBe(true);
    expect(modal.props('isOpen')).toBe(true);

    // Modificar tiempo a 50s en el input del modal
    const timeInput = modal.find('#edit-time');
    await timeInput.setValue('50');

    // Guardar
    const form = modal.find('form');
    await form.trigger('submit.prevent');
    await flushPromises();

    // Comprobar toast de confirmación
    expect(wrapper.find('.toast-feedback').exists()).toBe(true);
    expect(wrapper.find('.toast-feedback').text()).toContain('recalculadas correctamente');
  });

  it('FE-19 Escenario 3: Permite anular un resultado tras confirmación de definitivo', async () => {
    const wrapper = mount(SectionDetailView, {
      props: { sectionId: 'sec-1' }
    });
    await flushPromises();

    // Abrir modal de acción
    const deleteBtn = wrapper.find('.action-btn--delete');
    await deleteBtn.trigger('click');
    await flushPromises();

    const modal = wrapper.findComponent(EditResultModal);
    expect(modal.exists()).toBe(true);

    // Pulsar "Anular" dentro del modal para abrir la confirmación
    const modalAnularBtn = modal.find('.btn--outline-danger');
    await modalAnularBtn.trigger('click');

    // Confirmar anulación definitiva
    expect(modal.find('.confirm-box').exists()).toBe(true);
    expect(modal.text()).toContain('Esta operación no se puede deshacer');

    const confirmBtn = modal.find('.btn--danger');
    await confirmBtn.trigger('click');
    await flushPromises();

    // Comprobar toast y que se redujo la lista
    expect(wrapper.find('.toast-feedback').text()).toContain('Resultado anulado definitivamente');
    const remaining = _getInMemoryResults();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('res-102');
  });
});
