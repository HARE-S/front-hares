import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import DashboardLayout from '@/layout/DashboardLayout.vue';
import AppSidebar from '@/layout/AppSidebar.vue';

// Mock user state
const mockUser = ref({ name: 'Profesor', email: 'teacher@grupopenascal.com', role: 'teacher' });

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: ref(true),
    isPending: ref(false),
    logout: vi.fn(),
    load: vi.fn()
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/dashboard', query: {} }),
  RouterLink: {
    props: ['to', 'title'],
    template: '<a :href="to" :title="title" class="nav-item"><slot /></a>'
  },
  RouterView: { template: '<div><slot /></div>' }
}));

describe('Tarea 1.2 — Aislamiento y protección del bloque de Administración', () => {
  beforeEach(() => {
    mockUser.value = { name: 'Profesor', email: 'teacher@grupopenascal.com', role: 'teacher' };
  });

  describe('En DashboardLayout.vue', () => {
    it('oculta la sección de Administración para el rol teacher pero permite importar', () => {
      mockUser.value = { name: 'Profesor', email: 'teacher@grupopenascal.com', role: 'teacher' };
      const wrapper = mount(DashboardLayout);

      expect(wrapper.text()).not.toContain('Administración');
      expect(wrapper.find('[title="Gestión de Usuarios"]').exists()).toBe(false);
      expect(wrapper.find('[title="Importar Excel / Alexia"]').exists()).toBe(true);
    });

    it('muestra la sección de Administración únicamente para roles admin o superadmin', () => {
      mockUser.value = { name: 'Admin', email: 'admin@grupopenascal.com', role: 'superadmin' };
      const wrapper = mount(DashboardLayout);

      expect(wrapper.text()).toContain('Administración');
      expect(wrapper.find('[title="Gestión de Usuarios"]').exists()).toBe(true);
      expect(wrapper.find('[title="Importar Excel / Alexia"]').exists()).toBe(true);
    });
  });

  describe('En AppSidebar.vue', () => {
    it('oculta la sección de Administración para el rol teacher pero permite importar', () => {
      mockUser.value = { name: 'Profesor', email: 'teacher@grupopenascal.com', role: 'teacher' };
      const wrapper = mount(AppSidebar);

      expect(wrapper.text()).not.toContain('Administración');
      expect(wrapper.find('[title="Gestión de Usuarios"]').exists()).toBe(false);
      expect(wrapper.find('[title="Importar Excel / Alexia"]').exists()).toBe(true);
    });

    it('muestra la sección de Administración para rol superadmin', () => {
      mockUser.value = { name: 'Admin', email: 'admin@grupopenascal.com', role: 'superadmin' };
      const wrapper = mount(AppSidebar);

      expect(wrapper.text()).toContain('Administración');
      expect(wrapper.find('[title="Gestión de Usuarios"]').exists()).toBe(true);
      expect(wrapper.find('[title="Importar Excel / Alexia"]').exists()).toBe(true);
    });
  });
});
