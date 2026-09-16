import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from '../AppHeader.vue';

/**
 * Tests de AppHeader
 */

describe('AppHeader', () => {
  it('debe mostrar el título HARES', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.text()).toContain('HARES');
  });

  it('debe renderizar correctamente', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.find('.app-header').exists()).toBe(true);
  });

  it('debe tener estructura de header', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.find('.page-title').exists()).toBe(true);
  });
});
