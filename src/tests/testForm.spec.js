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

describe('Componente TestForm.vue (Formulario de Pruebas)', () => {
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

  it('muestra error de validación cuando el código está vacío', async () => {
    const wrapper = mount(TestForm);

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain("El campo 'code' (código) es obligatorio");
  });

  it('muestra error de validación cuando el número de palabras es inválido (<= 0)', async () => {
    const wrapper = mount(TestForm);

    await wrapper.find('#test-code').setValue('0IF');
    await wrapper.find('#test-name').setValue('Prueba inicial');
    await wrapper.find('#test-words').setValue('0');

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain("número de palabras");
  });

  it('autocompleta curso, letra y tipo al escribir un código reconocible', async () => {
    const wrapper = mount(TestForm);

    await wrapper.find('#test-code').setValue('1AF');

    // Esperar a que los watch reactivos se procesen
    const courseSelect = wrapper.find('#test-course');
    const letterSelect = wrapper.find('#test-letter');
    const typeSelect = wrapper.find('#test-type');

    expect(courseSelect.element.value).toBe('1');
    expect(letterSelect.element.value).toBe('A');
    expect(typeSelect.element.value).toBe('F');
  });

  it('llama a createTest y emite "test-created" cuando el formulario es válido', async () => {
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
});
