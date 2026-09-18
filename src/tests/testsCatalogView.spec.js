import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TestsCatalogView from '../views/tests-catalog/TestsCatalogView.vue';
import TestList from '../components/TestList.vue';
import TestForm from '../components/TestForm.vue';
import * as testsService from '../services/testsService';

describe('TestsCatalogView.vue (Vista Integral del Catálogo — FE-14, FE-15, FE-16)', () => {
  const mockTestsResponse = {
    items: [
      {
        id: '1',
        code: '1IF',
        name: 'La Vaca',
        words: 299,
        course: 1,
        test_letter: 'I',
        type: 'F',
        disabled_at: null,
        has_results: true
      },
      {
        id: '2',
        code: '1AF',
        name: 'El Patito Feo',
        words: 350,
        course: 1,
        test_letter: 'A',
        type: 'F',
        disabled_at: null,
        has_results: false
      }
    ],
    total: 2,
    page: 1,
    pages: 1,
    limit: 10
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(testsService, 'getTests').mockResolvedValue(mockTestsResponse);
  });

  it('renderiza la cabecera institucional y el listado por defecto', async () => {
    const wrapper = mount(TestsCatalogView, {
      props: { userRole: 'coordinator' }
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Catálogo de Pruebas de Lectura');
    expect(wrapper.text()).toContain('Fondo Peñascal');
    expect(wrapper.findComponent(TestList).exists()).toBe(true);
  });

  it('FE-14 Escenario 5: Muestra botón "Nueva Prueba" para coordinador y lo oculta para rol tutor', async () => {
    const wrapperCoordinator = mount(TestsCatalogView, {
      props: { userRole: 'coordinator' }
    });
    await flushPromises();
    expect(wrapperCoordinator.find('[data-testid="create-test-btn"]').exists()).toBe(true);

    const wrapperTutor = mount(TestsCatalogView, {
      props: { userRole: 'tutor' }
    });
    await flushPromises();
    expect(wrapperTutor.find('[data-testid="create-test-btn"]').exists()).toBe(false);
  });

  it('FE-14 Escenario 1: Al pulsar "Nueva Prueba" conmuta al formulario TestForm y permite volver', async () => {
    const wrapper = mount(TestsCatalogView, {
      props: { userRole: 'coordinator' }
    });
    await flushPromises();

    // Pulsa botón crear
    const createBtn = wrapper.find('[data-testid="create-test-btn"]');
    await createBtn.trigger('click');
    await flushPromises();

    // Debe mostrar TestForm y el botón para volver
    expect(wrapper.findComponent(TestForm).exists()).toBe(true);
    expect(wrapper.text()).toContain('Nueva Prueba de Lectura');
    expect(wrapper.find('.back-btn').exists()).toBe(true);

    // Pulsa volver
    await wrapper.find('.back-btn').trigger('click');
    await flushPromises();

    expect(wrapper.findComponent(TestList).exists()).toBe(true);
    expect(wrapper.findComponent(TestForm).exists()).toBe(false);
  });

  it('FE-15 Escenario 1: Al recibir evento edit-test desde TestList, abre formulario en modo edición', async () => {
    const wrapper = mount(TestsCatalogView, {
      props: { userRole: 'coordinator' }
    });
    await flushPromises();

    const testList = wrapper.findComponent(TestList);
    const testToEdit = mockTestsResponse.items[0];

    // Simula evento de edición emitido por la lista
    testList.vm.$emit('edit-test', testToEdit);
    await flushPromises();

    const form = wrapper.findComponent(TestForm);
    expect(form.exists()).toBe(true);
    expect(form.props('testToEdit')).toEqual(testToEdit);
    expect(wrapper.text()).toContain('Editar Prueba de Lectura');
  });

  it('muestra toast informativo y regresa al listado al emitir test-created', async () => {
    const wrapper = mount(TestsCatalogView, {
      props: { userRole: 'coordinator' }
    });
    await flushPromises();

    // Abre el formulario
    await wrapper.find('[data-testid="create-test-btn"]').trigger('click');
    await flushPromises();

    const form = wrapper.findComponent(TestForm);
    expect(form.exists()).toBe(true);

    // Emite creación exitosa
    const newTest = { id: '3', code: '2BL', name: 'El Príncipe Feliz' };
    form.vm.$emit('test-created', newTest);
    await flushPromises();

    // Vuelve al listado y muestra toast
    expect(wrapper.findComponent(TestList).exists()).toBe(true);
    expect(wrapper.find('.toast-banner').exists()).toBe(true);
    expect(wrapper.text()).toContain('Prueba "El Príncipe Feliz" (2BL) dada de alta correctamente.');
  });
});
