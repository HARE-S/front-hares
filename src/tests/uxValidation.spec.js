import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import AppSidebar from '@/layout/AppSidebar.vue';
import DashboardView from '@/views/dashboard/DashboardView.vue';
import ResourcesView from '@/views/resources/ResourcesView.vue';

const mockUser = ref({ name: 'Carmen Docente', email: 'carmen@grupopenascal.com', role: 'teacher' });

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: ref(true),
    isPending: ref(false),
    logout: vi.fn(),
    load: vi.fn().mockResolvedValue()
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/dashboard', query: {} })
}));

const globalMountOptions = {
  global: {
    stubs: {
      'router-link': {
        props: ['to', 'title'],
        template: '<a :href="to" :title="title"><slot /></a>'
      },
      'router-view': true
    }
  }
};

vi.mock('@/services/directoryService', () => ({
  getCenters: vi.fn().mockResolvedValue([]),
  getCenterSections: vi.fn().mockResolvedValue([]),
  getSectionStudents: vi.fn().mockResolvedValue([])
}));

vi.mock('@/services/resultsService', () => ({
  getSectionResults: vi.fn().mockResolvedValue([]),
  getAvailableCourses: vi.fn().mockReturnValue(['2024-25', '2023-24'])
}));

describe('Validación de UX: Importación accesible para Admins y Docentes', () => {
  beforeEach(() => {
    mockUser.value = { name: 'Carmen Docente', email: 'carmen@grupopenascal.com', role: 'teacher' };
  });

  describe('1. Experiencia de Usuario en Perfil Docente (teacher / tutor)', () => {
    it('muestra los accesos principales de aula incluyendo Importar Excel', () => {
      mockUser.value = { name: 'Carmen Docente', email: 'carmen@grupopenascal.com', role: 'teacher' };
      const wrapper = mount(AppSidebar, globalMountOptions);

      const navItems = wrapper.findAll('.nav-item');
      expect(navItems).toHaveLength(5);

      const labels = navItems.map(item => item.find('.nav-label').text());
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Alumnado');
      expect(labels).toContain('Registro en Aula');
      expect(labels).toContain('Recursos');
      expect(labels).toContain('Importar Excel');
    });

    it('oculta la gestión de usuarios (sin sección Administración)', () => {
      mockUser.value = { name: 'Carmen Docente', email: 'carmen@grupopenascal.com', role: 'teacher' };
      const wrapper = mount(AppSidebar, globalMountOptions);

      expect(wrapper.text()).not.toContain('Administración');
      expect(wrapper.find('[title="Gestión de Usuarios"]').exists()).toBe(false);
      expect(wrapper.find('[title="Importar Excel / Alexia"]').exists()).toBe(true);
    });

    it('la cabecera de DashboardView ofrece Nueva Evaluación y botón rápido de Importar Excel', () => {
      const wrapper = mount(DashboardView, globalMountOptions);

      const actionButtons = wrapper.findAll('.action-buttons-group button');
      expect(actionButtons).toHaveLength(2);
      expect(actionButtons[0].text()).toContain('Importar Excel');
      expect(actionButtons[1].text()).toContain('Nueva Evaluación en Directo');
    });

    it('ResourcesView presenta un switcher unificado y limpio para alternar pruebas y libros', () => {
      const wrapper = mount(ResourcesView, globalMountOptions);

      const tabs = wrapper.findAll('.resources-tab-btn');
      expect(tabs).toHaveLength(2);
      expect(tabs[0].text()).toContain('Pruebas de Lectura');
      expect(tabs[1].text()).toContain('Biblioteca de Libros');
    });
  });

  describe('2. Experiencia de Usuario en Perfil Administrador (admin / superadmin)', () => {
    it('muestra la sección de Administración para Gestión de Usuarios y acceso a Importación', () => {
      mockUser.value = { name: 'Admin HARE', email: 'admin@grupopenascal.com', role: 'superadmin' };
      const wrapper = mount(AppSidebar, globalMountOptions);

      expect(wrapper.text()).toContain('Administración');

      const userAdminLink = wrapper.find('[title="Gestión de Usuarios"]');
      expect(userAdminLink.exists()).toBe(true);
      expect(userAdminLink.attributes('href')).toBe('/admin/users');

      const importLink = wrapper.find('[title="Importar Excel / Alexia"]');
      expect(importLink.exists()).toBe(true);
      expect(importLink.attributes('href')).toBe('/import');

      // Total de 6 ítems (5 comunes + 1 administrativo: Usuarios)
      const navItems = wrapper.findAll('.nav-item');
      expect(navItems).toHaveLength(6);
    });
  });
});
