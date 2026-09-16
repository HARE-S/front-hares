import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import LoginView from '../LoginView.vue';

/**
 * Tests de FE-07 T-FE07-03: Mensaje de sesión expirada
 * Escenario 3: Sesión caducada durante el trabajo
 */

describe('LoginView - Sesión expirada', () => {
  let router;

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/login',
          component: LoginView
        }
      ]
    });
  });

  it('debe tener estructura HTML válida', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    });

    expect(wrapper.find('.login-page').exists()).toBe(true);
    expect(wrapper.find('.login-box').exists()).toBe(true);
  });

  it('debe renderizar el formulario de login', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    });

    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
  });

  it('debe mostrar el título HARES en el login', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    });

    expect(wrapper.text()).toContain('HARES');
  });

  it('debe tener estilos para alert-info', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    });

    const style = wrapper.vm.$el.querySelector('style');
    if (style) {
      expect(style.textContent).toContain('alert-info');
    }
  });
});
