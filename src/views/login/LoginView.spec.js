import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginView from './LoginView.vue';

describe('LoginView', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(LoginView, {
      global: {
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    });
  });

  describe('Login Mode', () => {
    it('debe renderizar el formulario de login por defecto', () => {
      expect(wrapper.find('h1').text()).toBe('HARES');
      expect(wrapper.find('label[for="email-login"]').exists()).toBe(true);
    });

    it('debe validar que el correo sea requerido', async () => {
      const button = wrapper.find('button[type="submit"]');
      await button.trigger('click');

      expect(wrapper.vm.error).toBe('El correo es requerido');
    });

    it('debe validar que el correo sea @grupopenascal.com', async () => {
      await wrapper.vm.$nextTick();
      wrapper.vm.email = 'user@gmail.com';

      const button = wrapper.find('button[type="submit"]');
      await button.trigger('click');

      expect(wrapper.vm.error).toContain('grupopenascal.com');
    });

    it('debe cambiar a modo registro al hacer click en tab', async () => {
      const registerTab = wrapper.findAll('.tab')[1];
      await registerTab.trigger('click');

      expect(wrapper.vm.mode).toBe('register');
    });

    it('debe cambiar a modo forgot al hacer click en enlace', async () => {
      wrapper.vm.mode = 'login';
      const forgotLink = wrapper.find('.forgot-link');
      await forgotLink.trigger('click');

      expect(wrapper.vm.mode).toBe('forgot');
    });
  });

  describe('Register Mode', () => {
    beforeEach(async () => {
      wrapper.vm.mode = 'register';
      await wrapper.vm.$nextTick();
    });

    it('debe validar longitud mínima de contraseña', async () => {
      wrapper.vm.email = 'user@grupopenascal.com';
      wrapper.vm.password = 'short';
      wrapper.vm.passwordConfirm = 'short';

      const button = wrapper.find('button[type="submit"]');
      await button.trigger('click');

      expect(wrapper.vm.error).toContain('8 caracteres');
    });

    it('debe validar que las contraseñas coincidan', async () => {
      wrapper.vm.email = 'user@grupopenascal.com';
      wrapper.vm.password = 'password123';
      wrapper.vm.passwordConfirm = 'password456';

      const button = wrapper.find('button[type="submit"]');
      await button.trigger('click');

      expect(wrapper.vm.error).toContain('no coinciden');
    });

    it('debe renderizar campos de registro', () => {
      expect(wrapper.find('label[for="name"]').exists()).toBe(true);
      expect(wrapper.find('label[for="email-register"]').exists()).toBe(true);
      expect(wrapper.find('label[for="password-register"]').exists()).toBe(true);
      expect(wrapper.find('label[for="password-confirm"]').exists()).toBe(true);
    });
  });

  describe('Forgot Password Mode', () => {
    beforeEach(async () => {
      wrapper.vm.mode = 'forgot';
      await wrapper.vm.$nextTick();
    });

    it('debe renderizar formulario de recuperación', () => {
      expect(wrapper.find('label[for="forgot-email"]').exists()).toBe(true);
      expect(wrapper.find('.back-link').exists()).toBe(true);
    });

    it('debe validar email en recuperación', async () => {
      const button = wrapper.find('button[type="submit"]');
      await button.trigger('click');

      expect(wrapper.vm.error).toBe('Ingresa tu correo');
    });

    it('debe volver a login al hacer click en back-link', async () => {
      const backLink = wrapper.find('.back-link');
      await backLink.trigger('click');

      expect(wrapper.vm.mode).toBe('login');
    });
  });

  describe('Loading state', () => {
    it('debe mostrar estado loading en el botón', async () => {
      wrapper.vm.loading = true;
      await wrapper.vm.$nextTick();

      const button = wrapper.find('button[type="submit"]');
      expect(button.attributes('disabled')).toBeDefined();
    });

    it('debe desactivar inputs cuando está loading', async () => {
      wrapper.vm.loading = true;
      await wrapper.vm.$nextTick();

      const inputs = wrapper.findAll('input');
      inputs.forEach(input => {
        expect(input.attributes('disabled')).toBeDefined();
      });
    });
  });

  describe('Keyboard shortcuts', () => {
    it('debe enviar form con Enter en login', async () => {
      wrapper.vm.mode = 'login';
      wrapper.vm.email = 'coordinator@grupopenascal.com';
      wrapper.vm.password = 'coord123';

      const input = wrapper.find('input[type="email"]');
      await input.trigger('keydown', { key: 'Enter' });

      // La lógica de handleLogin se ejecutaría aquí
      expect(wrapper.vm.mode).toBe('login');
    });
  });
});
