import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AppShell from '@/layout/AppShell.vue';
import { useCourse } from '@/composables/useCourse';

// Mock de vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  }),
  useRoute: () => ({
    path: '/dashboard',
    query: {}
  })
}));

// Mock de useAuth
vi.mock('@@/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { name: 'Docente Prueba', email: 'docente@penascal.com', role: 'teacher' } },
    logout: vi.fn(),
    isAuthenticated: { value: true },
    isPending: { value: false },
    load: vi.fn()
  })
}));

describe('TopBar Global con Selector de Cursos (AppShell.vue)', () => {
  beforeEach(() => {
    localStorage.clear();
    const { selectedCourse } = useCourse();
    selectedCourse.value = '2024-25';
  });

  it('renderiza la barra superior global (.stitch-topbar) de forma persistente', () => {
    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          AppSidebar: true,
          RegisterResultModal: true,
          'router-view': true
        }
      }
    });

    const topbar = wrapper.find('.stitch-topbar');
    expect(topbar.exists()).toBe(true);
    expect(wrapper.find('.topbar-brand-chip').text()).toContain('Fundación Peñascal');
  });

  it('muestra el botón del selector de curso con el curso activo por defecto', () => {
    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          AppSidebar: true,
          RegisterResultModal: true,
          'router-view': true
        }
      }
    });

    const courseBtn = wrapper.find('.course-selector-btn');
    expect(courseBtn.exists()).toBe(true);
    expect(courseBtn.text()).toContain('Curso 2024-25');
  });

  it('abre el menú desplegable al hacer clic en el botón de curso y permite seleccionar otro curso', async () => {
    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          AppSidebar: true,
          RegisterResultModal: true,
          'router-view': true
        }
      }
    });

    expect(wrapper.find('.course-dropdown-menu').exists()).toBe(false);

    // Abrir dropdown
    await wrapper.find('.course-selector-btn').trigger('click');
    expect(wrapper.find('.course-dropdown-menu').exists()).toBe(true);

    const options = wrapper.findAll('.course-dropdown-option');
    expect(options.length).toBeGreaterThanOrEqual(3);

    // Seleccionar 'Curso 2023-24'
    const targetOption = options.find(opt => opt.text().includes('2023-24'));
    expect(targetOption).toBeDefined();
    await targetOption.trigger('click');

    // Dropdown se cierra y el curso seleccionado cambia
    expect(wrapper.find('.course-dropdown-menu').exists()).toBe(false);
    expect(wrapper.find('.course-selector-btn').text()).toContain('Curso 2023-24');

    const { selectedCourse } = useCourse();
    expect(selectedCourse.value).toBe('2023-24');
  });
});
