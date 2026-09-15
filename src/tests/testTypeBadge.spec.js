import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TestTypeBadge from '../components/domain/TestTypeBadge.vue';

describe('Componente de dominio TestTypeBadge.vue', () => {
  it('renderiza distintivo funcional para tipo F o Funcional', () => {
    const wrapper = mount(TestTypeBadge, {
      props: { type: 'F' }
    });

    expect(wrapper.text()).toBe('Funcional');
    expect(wrapper.classes()).toContain('badge--functional');
  });

  it('renderiza distintivo literario para tipo L o Literario', () => {
    const wrapper = mount(TestTypeBadge, {
      props: { type: 'L' }
    });

    expect(wrapper.text()).toBe('Literario');
    expect(wrapper.classes()).toContain('badge--literary');
  });

  it('muestra un guión em para valores vacíos o nulos', () => {
    const wrapper = mount(TestTypeBadge, {
      props: { type: '' }
    });

    expect(wrapper.text()).toBe('—');
  });
});
