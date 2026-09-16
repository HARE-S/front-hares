import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TestList from '../components/TestList.vue';
import * as testsService from '../services/testsService';

const mockTestItems = [
  {
    id: 'test-1',
    code: '1AF',
    name: 'La vaca lechera',
    words: 150,
    course: 1,
    test_letter: 'A',
    type: 'F',
    disabled_at: null
  },
  {
    id: 'test-2',
    code: '2BL',
    name: 'El flautista de Hamelín',
    words: 220,
    course: 2,
    test_letter: 'B',
    type: 'L',
    disabled_at: null
  }
];

describe('Componente TestList.vue (Listado y Filtros de Pruebas — FE-15 y FE-16)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('FE-16 Escenario 1: Renderiza el listado de pruebas con paginador y total de elementos', async () => {
    vi.spyOn(testsService, 'getTests').mockResolvedValue({
      items: mockTestItems,
      total: 34,
      page: 1,
      pages: 4,
      limit: 10
    });

    const wrapper = mount(TestList);
    await wrapper.vm.$nextTick();
    await new Promise(r => setTimeout(r, 10));

    expect(wrapper.text()).toContain('La vaca lechera');
    expect(wrapper.text()).toContain('El flautista de Hamelín');
    expect(wrapper.text()).toContain('34 pruebas');
    expect(wrapper.text()).toContain('Página 1 de 4');
  });

  it('FE-16 Escenario 2 y 3: Aplica filtros combinados (curso, letra, tipo) y llama a getTests con parámetros correctos', async () => {
    const spyGetTests = vi.spyOn(testsService, 'getTests').mockResolvedValue({
      items: [mockTestItems[0]],
      total: 1,
      page: 1,
      pages: 1,
      limit: 10
    });

    const wrapper = mount(TestList);
    await wrapper.vm.$nextTick();

    // Seleccionar curso 1
    const courseSelect = wrapper.find('.filter-select');
    await courseSelect.setValue('1');

    // Seleccionar tipo F
    const typeSelect = wrapper.findAll('.filter-select').at(1);
    await typeSelect.setValue('F');

    expect(spyGetTests).toHaveBeenLastCalledWith(expect.objectContaining({
      course: 1,
      type: 'F'
    }));
  });

  it('FE-16 Escenario 5: Muestra estado vacío con opción de restablecer filtros si no hay resultados', async () => {
    vi.spyOn(testsService, 'getTests').mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pages: 1,
      limit: 10
    });

    const wrapper = mount(TestList);
    await wrapper.vm.$nextTick();
    await new Promise(r => setTimeout(r, 10));

    expect(wrapper.text()).toContain('No se encontraron pruebas');
    expect(wrapper.find('.empty-state button').text()).toContain('Restablecer filtros');
  });

  it('FE-15 Escenario 1: Emite "edit-test" al pulsar el botón de editar', async () => {
    vi.spyOn(testsService, 'getTests').mockResolvedValue({
      items: mockTestItems,
      total: 2,
      page: 1,
      pages: 1,
      limit: 10
    });

    const wrapper = mount(TestList, {
      props: { userRole: 'coordinator' }
    });
    await wrapper.vm.$nextTick();
    await new Promise(r => setTimeout(r, 10));

    const editButtons = wrapper.findAll('.btn-icon');
    await editButtons[0].trigger('click');

    expect(wrapper.emitted('edit-test')).toBeTruthy();
    expect(wrapper.emitted('edit-test')[0][0]).toEqual(mockTestItems[0]);
  });

  it('FE-15 Escenario 3: Abre modal de baja lógica con explicación pedagógica sobre el histórico', async () => {
    vi.spyOn(testsService, 'getTests').mockResolvedValue({
      items: mockTestItems,
      total: 2,
      page: 1,
      pages: 1,
      limit: 10
    });

    const wrapper = mount(TestList, {
      props: { userRole: 'coordinator' }
    });
    await wrapper.vm.$nextTick();
    await new Promise(r => setTimeout(r, 10));

    // El segundo botón de acción en la primera fila es eliminar
    const deleteBtn = wrapper.findAll('.actions-group button')[1];
    await deleteBtn.trigger('click');

    expect(wrapper.text()).toContain('Confirmar baja lógica de prueba');
    expect(wrapper.text()).toContain('El histórico de resultados de los alumnos se conservará íntegro');
  });

  it('FE-15 Escenario 4: Envía include_disabled cuando se activa el checkbox', async () => {
    const spyGetTests = vi.spyOn(testsService, 'getTests').mockResolvedValue({
      items: mockTestItems,
      total: 2,
      page: 1,
      pages: 1,
      limit: 10
    });

    const wrapper = mount(TestList);
    await wrapper.vm.$nextTick();

    const checkbox = wrapper.find('.form-checkbox');
    await checkbox.setValue(true);

    expect(spyGetTests).toHaveBeenLastCalledWith(expect.objectContaining({
      include_disabled: true
    }));
  });

  it('FE-14 Escenario 5: Oculta las acciones de editar y eliminar cuando el rol es tutor', async () => {
    vi.spyOn(testsService, 'getTests').mockResolvedValue({
      items: mockTestItems,
      total: 2,
      page: 1,
      pages: 1,
      limit: 10
    });

    const wrapper = mount(TestList, {
      props: { userRole: 'tutor' }
    });
    await wrapper.vm.$nextTick();
    await new Promise(r => setTimeout(r, 10));

    expect(wrapper.find('th.text-right').exists()).toBe(false);
    expect(wrapper.find('.actions-group').exists()).toBe(false);
  });
});
