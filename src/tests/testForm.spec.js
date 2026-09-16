import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deduceLevelAndTypeFromCode } from '../services/testsService';
import { mount } from '@vue/test-utils';
import TestForm from '../components/TestForm.vue';
import * as testsService from '../services/testsService';

describe('Servicio de deducción pedagógica (testsService)', () => {
  it('deduce curso, letra y tipo correctamente para códigos válidos', () => {
    // 0IF -> Curso 0, Letra I, Tipo F
    const res1 = deduceLevelAndTypeFromCode('0IF');
    expect(res1.course).toBe(0);
    expect(res1.testLetter).toBe('I');
    expect(res1.testType).toBe('F');

    // 1AL -> Curso 1, Letra A, Tipo L
    const res2 = deduceLevelAndTypeFromCode('1AL');
    expect(res2.course).toBe(1);
    expect(res2.testLetter).toBe('A');
    expect(res2.testType).toBe('L');

    // 2BF -> Curso 2, Letra B, Tipo F
    const res3 = deduceLevelAndTypeFromCode('2BF');
    expect(res3.course).toBe(2);
    expect(res3.testLetter).toBe('B');
    expect(res3.testType).toBe('F');
  });

  it('gestiona códigos vacíos o nulos sin error', () => {
    expect(deduceLevelAndTypeFromCode('')).toEqual({ course: null, testLetter: null, testType: null });
    expect(deduceLevelAndTypeFromCode(null)).toEqual({ course: null, testLetter: null, testType: null });
    expect(deduceLevelAndTypeFromCode(undefined)).toEqual({ course: null, testLetter: null, testType: null });
  });
});

describe('Componente TestForm.vue (Formulario de Pruebas — FE-14 y FE-15)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza todos los campos requeridos por el backend', () => {
    const wrapper = mount(TestForm);

    expect(wrapper.find('#test-code').exists()).toBe(true);
    expect(wrapper.find('#test-name').exists()).toBe(true);
    expect(wrapper.find('#test-words').exists()).toBe(true);
    expect(wrapper.find('#test-course').exists()).toBe(true);
    expect(wrapper.find('#test-letter').exists()).toBe(true);
    expect(wrapper.find('#test-type').exists()).toBe(true);
  });

  it('FE-14 Escenario 2: Restringe letra a I, A, B, C, D, E y tipo a F, L (vocabulario cerrado)', () => {
    const wrapper = mount(TestForm);

    const letterOptions = wrapper.findAll('#test-letter option').map(o => o.attributes('value'));
    expect(letterOptions).toContain('I');
    expect(letterOptions).toContain('A');
    expect(letterOptions).toContain('B');
    expect(letterOptions).toContain('C');
    expect(letterOptions).toContain('D');
    expect(letterOptions).toContain('E');

    const typeOptions = wrapper.findAll('#test-type option').map(o => o.attributes('value'));
    expect(typeOptions).toContain('F');
    expect(typeOptions).toContain('L');
  });

  it('FE-14 Escenario 4: Muestra error de validación cuando el código o las palabras son inválidos', async () => {
    const wrapper = mount(TestForm);

    // Código vacío
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain("El campo 'code' (código) es obligatorio");

    // Palabras <= 0
    await wrapper.find('#test-code').setValue('0IF');
    await wrapper.find('#test-name').setValue('Prueba inicial');
    await wrapper.find('#test-words').setValue('0');
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain("número de palabras");
  });

  it('FE-14 Escenario 3: Maneja código duplicado con 409 mostrando mensaje no técnico', async () => {
    const conflictErr = new Error('Ese código ya existe en el catálogo.');
    conflictErr.status = 409;
    vi.spyOn(testsService, 'createTest').mockRejectedValue(conflictErr);

    const wrapper = mount(TestForm);
    await wrapper.find('#test-code').setValue('1AF');
    await wrapper.find('#test-name').setValue('La vaca');
    await wrapper.find('#test-words').setValue('150');

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Ese código ya existe en el catálogo');
  });

  it('FE-14 Escenario 5: No muestra botón de guardar para el rol tutor (solo lectura)', () => {
    const wrapper = mount(TestForm, {
      props: {
        userRole: 'tutor'
      }
    });

    expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('solo lectura');
  });

  it('autocompleta curso, letra y tipo al escribir un código reconocible', async () => {
    const wrapper = mount(TestForm);

    await wrapper.find('#test-code').setValue('1AF');

    const courseSelect = wrapper.find('#test-course');
    const letterSelect = wrapper.find('#test-letter');
    const typeSelect = wrapper.find('#test-type');

    expect(courseSelect.element.value).toBe('1');
    expect(letterSelect.element.value).toBe('A');
    expect(typeSelect.element.value).toBe('F');
  });

  it('llama a createTest y emite "test-created" cuando el formulario de alta es válido', async () => {
    const mockCreated = {
      id: '01a09f17-f564-79b2-9095-00320b92fa66',
      code: '2BF',
      name: 'Cometas y meteoritos',
      words: 316,
      course: 2,
      test_letter: 'B',
      type: 'F'
    };

    const spyCreate = vi.spyOn(testsService, 'createTest').mockResolvedValue(mockCreated);

    const wrapper = mount(TestForm);

    await wrapper.find('#test-code').setValue('2BF');
    await wrapper.find('#test-name').setValue('Cometas y meteoritos');
    await wrapper.find('#test-words').setValue('316');

    await wrapper.find('form').trigger('submit.prevent');

    expect(spyCreate).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('test-created')).toBeTruthy();
    expect(wrapper.emitted('test-created')[0][0]).toEqual(mockCreated);
  });

  it('FE-15 Escenario 1: Modo edición precarga valores y emite "test-updated" llamando a updateTest', async () => {
    const existingTest = {
      id: 'test-uuid-1',
      code: '3CF',
      name: 'El río Amazonas',
      words: 240,
      course: 3,
      test_letter: 'C',
      type: 'F',
      has_results: false
    };

    const spyUpdate = vi.spyOn(testsService, 'updateTest').mockResolvedValue({
      ...existingTest,
      name: 'El río Amazonas (Revisado)'
    });

    const wrapper = mount(TestForm, {
      props: {
        testToEdit: existingTest
      }
    });

    expect(wrapper.find('#test-code').element.value).toBe('3CF');
    expect(wrapper.find('#test-name').element.value).toBe('El río Amazonas');
    expect(wrapper.find('#test-words').element.value).toBe('240');

    // Modificar nombre
    await wrapper.find('#test-name').setValue('El río Amazonas (Revisado)');
    await wrapper.find('form').trigger('submit.prevent');

    expect(spyUpdate).toHaveBeenCalledWith('test-uuid-1', expect.objectContaining({
      name: 'El río Amazonas (Revisado)'
    }));
    expect(wrapper.emitted('test-updated')).toBeTruthy();
  });

  it('FE-15 Escenario 2: Bloquea el campo código si la prueba ya tiene resultados', () => {
    const testWithResults = {
      id: 'test-uuid-2',
      code: '4DF',
      name: 'La electricidad',
      words: 280,
      course: 4,
      test_letter: 'D',
      type: 'F',
      has_results: true
    };

    const wrapper = mount(TestForm, {
      props: {
        testToEdit: testWithResults
      }
    });

    const codeInput = wrapper.find('#test-code');
    expect(codeInput.attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('El código no puede modificarse porque hay resultados asociados');
  });
});
