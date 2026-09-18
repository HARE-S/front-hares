import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseInput from '../BaseInput.vue';

/**
 * Tests de T-FE12-02: Componente BaseInput (FE-12).
 * Cubre el Escenario 1 (error junto al campo), Escenario 3 (valores
 * preservados) y Escenario 5 (aviso sospechoso sin bloqueo).
 */

function mountInput(props = {}, options = {}) {
  return mount(BaseInput, {
    props: { label: 'Tiempo', ...props },
    ...options,
  });
}

describe('BaseInput.vue — Campo de formulario con validación (FE-12)', () => {
  it('renderiza el label y el asterisco cuando es obligatorio', () => {
    const wrapper = mountInput({ label: 'Tiempo', required: true });

    expect(wrapper.find('.field__label').text()).toContain('Tiempo');
    expect(wrapper.find('.field__asterisk').exists()).toBe(true);
  });

  it('conecta el label con el input mediante id', () => {
    const wrapper = mountInput({ label: 'Tiempo' });
    const labelFor = wrapper.find('.field__label').attributes('for');
    const inputId = wrapper.find('input').attributes('id');

    expect(labelFor).toBe(inputId);
  });

  it('muestra el error junto al campo con aria-invalid (Escenario 1)', () => {
    const wrapper = mountInput({ error: 'El tiempo no puede ser negativo.' });

    const errorEl = wrapper.find('.field__error');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toContain('El tiempo no puede ser negativo.');
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    expect(wrapper.classes()).toContain('field--error');
    expect(wrapper.find('input').classes()).toContain('input--error');
  });

  it('no muestra error ni hint cuando no hay ninguno', () => {
    const wrapper = mountInput();

    expect(wrapper.find('.field__error').exists()).toBe(false);
    expect(wrapper.find('.field__hint').exists()).toBe(false);
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('false');
  });

  it('muestra hint cuando no hay error', () => {
    const wrapper = mountInput({ hint: 'Tiempo en segundos' });

    expect(wrapper.find('.field__hint').text()).toContain('Tiempo en segundos');
    expect(wrapper.find('.field__error').exists()).toBe(false);
  });

  it('muestra el aviso sospechoso incluso con valor relleno, sin bloquear (Escenario 5)', () => {
    const wrapper = mountInput({
      modelValue: 5,
      suspicious: '5 segundos para 872 palabras parece fuera de rango. ¿Lo has escrito en minutos?',
    });

    const warn = wrapper.find('.notice--warn');
    expect(warn.exists()).toBe(true);
    // El aviso es un rol status (no alert) y el input sigue utilizable
    expect(warn.attributes('role')).toBe('status');
    expect(wrapper.find('input').element.disabled).toBe(false);
  });

  it('emite update:modelValue al teclear (Escenario 3: no se pierde lo tecleado)', async () => {
    const wrapper = mountInput({ modelValue: '' });

    await wrapper.find('input').setValue('45');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['45']);
  });

  it('emite blur al salir del campo', async () => {
    const wrapper = mountInput();

    await wrapper.find('input').trigger('blur');
    expect(wrapper.emitted('blur')).toHaveLength(1);
  });

  it('convierte valores numéricos a Number cuando type=number', async () => {
    const wrapper = mountInput({ type: 'number' });

    await wrapper.find('input').setValue('120');
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([120]);
  });

  it('respeta la prop disabled', () => {
    const wrapper = mountInput({ disabled: true });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });
});