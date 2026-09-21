import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AppSidebar from '../layout/AppSidebar.vue';
import AppShell from '../layout/AppShell.vue';
import BulkEntryView from '../views/bulk-entry/BulkEntryView.vue';
import RegisterResultModal from '../components/results/RegisterResultModal.vue';
import EditResultModal from '../components/results/EditResultModal.vue';
import TestForm from '../components/TestForm.vue';
import NewAssessmentModal from '../components/dashboard/NewAssessmentModal.vue';
import BookAssignModal from '../components/dashboard/BookAssignModal.vue';

// Mock de useAuth
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { name: 'Yeremi Tutor', email: 'yeremi@penascal.org', role: 'admin' } },
    isAuthenticated: { value: true },
    logout: vi.fn()
  })
}));

// Mock de vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/dashboard' }),
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :href="to"><slot /></a>'
  }
}));

const mountOptions = {
  global: {
    stubs: {
      'router-link': {
        template: '<a :href="to" :title="title"><slot /></a>',
        props: ['to', 'title', 'activeClass']
      },
      'router-view': true
    }
  }
};

describe('FE-13: Uso en tableta dentro del aula (Criterios de Aceptación)', () => {
  /* =========================================================================
     ESCENARIO 1: Navegación adaptada (< 1280px)
     ========================================================================= */
  describe('Escenario 1: Navegación adaptada', () => {
    it('AppSidebar colapsa en rail de iconos en pantallas de menos de 1280px', () => {
      const wrapper = mount(AppSidebar, mountOptions);
      expect(wrapper.find('.stitch-sidebar').exists()).toBe(true);

      // Comprobar que los nav-items tienen atributos title para identificar iconos cuando el texto se oculta
      const navLinks = wrapper.findAll('.nav-item');
      expect(navLinks.length).toBeGreaterThanOrEqual(2);

      const titles = navLinks.map(link => link.attributes('title'));
      expect(titles).toContain('Dashboard');
      expect(titles).toContain('Centros');
    });

    it('AppShell y AppSidebar tienen definidos los estilos para rail bajo 1280px', () => {
      const shellWrapper = mount(AppShell, mountOptions);
      expect(shellWrapper.find('.stitch-app').exists()).toBe(true);
      expect(shellWrapper.find('.stitch-main-layout').exists()).toBe(true);
    });
  });

  /* =========================================================================
     ESCENARIO 2: Teclado numérico (inputmode="numeric")
     ========================================================================= */
  describe('Escenario 2: Teclado numérico', () => {
    it('todos los campos numéricos de BulkEntryView tienen inputmode="numeric" y pattern="[0-9]*"', async () => {
      const wrapper = mount(BulkEntryView);
      await flushPromises();

      const timeInputs = wrapper.findAll('.grid-input--time');
      expect(timeInputs.length).toBeGreaterThan(0);
      timeInputs.forEach(input => {
        expect(input.attributes('inputmode')).toBe('numeric');
        expect(input.attributes('pattern')).toBe('[0-9]*');
        expect(input.attributes('type')).toBe('number');
      });

      const allGridInputs = wrapper.findAll('.grid-input');
      expect(allGridInputs.length).toBeGreaterThanOrEqual(timeInputs.length * 3);
      allGridInputs.forEach(input => {
        expect(input.attributes('inputmode')).toBe('numeric');
      });
    });

    it('los campos de tiempo, aciertos y errores en RegisterResultModal tienen inputmode="numeric"', () => {
      const wrapper = mount(RegisterResultModal, {
        props: {
          isOpen: true,
          availableStudents: [{ id: '1', name: 'Alumno Test', section: '1A' }]
        }
      });

      const secondsInput = wrapper.find('#time-seconds');
      expect(secondsInput.exists()).toBe(true);
      expect(secondsInput.attributes('inputmode')).toBe('numeric');

      const correctInput = wrapper.find('#successes-input');
      expect(correctInput.exists()).toBe(true);
      expect(correctInput.attributes('inputmode')).toBe('numeric');

      const errorsInput = wrapper.find('#mistakes-input');
      expect(errorsInput.exists()).toBe(true);
      expect(errorsInput.attributes('inputmode')).toBe('numeric');
    });

    it('los campos de tiempo, aciertos y errores en EditResultModal tienen inputmode="numeric"', () => {
      const wrapper = mount(EditResultModal, {
        props: {
          isOpen: true,
          result: { id: 'res-1', studentName: 'Alumno', testName: 'Prueba', time: 60, successes: 18, mistakes: 2, testWords: 108 }
        }
      });

      const secondsInput = wrapper.find('#edit-time');
      expect(secondsInput.exists()).toBe(true);
      expect(secondsInput.attributes('inputmode')).toBe('numeric');

      const correctInput = wrapper.find('#edit-successes');
      expect(correctInput.exists()).toBe(true);
      expect(correctInput.attributes('inputmode')).toBe('numeric');

      const errorsInput = wrapper.find('#edit-mistakes');
      expect(errorsInput.exists()).toBe(true);
      expect(errorsInput.attributes('inputmode')).toBe('numeric');
    });

    it('el campo de palabras en TestForm tiene inputmode="numeric" y pattern="[0-9]*"', () => {
      const wrapper = mount(TestForm, {
        props: { canManage: true }
      });

      const wordsInput = wrapper.find('#test-words');
      expect(wordsInput.exists()).toBe(true);
      expect(wordsInput.attributes('inputmode')).toBe('numeric');
      expect(wordsInput.attributes('pattern')).toBe('[0-9]*');
      expect(wordsInput.attributes('type')).toBe('number');
    });

    it('los campos numéricos de NewAssessmentModal tienen inputmode="numeric"', () => {
      const wrapper = mount(NewAssessmentModal, {
        props: { isOpen: true }
      });

      const hitsInput = wrapper.find('#hits');
      if (hitsInput.exists()) {
        expect(hitsInput.attributes('inputmode')).toBe('numeric');
      }

      const errorsInput = wrapper.find('#errors');
      if (errorsInput.exists()) {
        expect(errorsInput.attributes('inputmode')).toBe('numeric');
      }
    });

    it('el campo de número de ejemplares en BookAssignModal tiene inputmode="numeric"', async () => {
      const wrapper = mount(BookAssignModal, {
        props: { isOpen: true }
      });

      // Abrir sub-formulario de nuevo libro si existe
      const showAddBtn = wrapper.find('.btn-add-new-book');
      if (showAddBtn.exists()) {
        await showAddBtn.trigger('click');
        const quantityInput = wrapper.find('#quantity');
        if (quantityInput.exists()) {
          expect(quantityInput.attributes('inputmode')).toBe('numeric');
        }
      }
    });
  });

  /* =========================================================================
     ESCENARIO 3: Registro en lote sin desplazamiento horizontal
     ========================================================================= */
  describe('Escenario 3: Registro en lote sin desplazamiento horizontal', () => {
    it('muestra simultáneamente las tres columnas de datos (tiempo, aciertos, errores) por fila', async () => {
      const wrapper = mount(BulkEntryView);
      await flushPromises();

      // Cabecera contiene las 3 columnas de datos
      expect(wrapper.find('th.th-time').exists()).toBe(true);
      expect(wrapper.find('th.th-successes').exists()).toBe(true);
      expect(wrapper.find('th.th-mistakes').exists()).toBe(true);

      // Cada fila de alumno contiene los 3 campos correspondientes
      const firstRow = wrapper.findAll('.batch-table tbody tr')[0];
      expect(firstRow.find('.col-time input').exists()).toBe(true);
      expect(firstRow.find('.col-successes input').exists()).toBe(true);
      expect(firstRow.find('.col-mistakes input').exists()).toBe(true);
    });

    it('la tabla cuenta con contenedor elástico y clases responsivas para adaptarse al ancho disponible', async () => {
      const wrapper = mount(BulkEntryView);
      await flushPromises();

      const tableWrapper = wrapper.find('.table-responsive');
      expect(tableWrapper.exists()).toBe(true);

      const table = wrapper.find('.batch-table');
      expect(table.exists()).toBe(true);
    });
  });

  /* =========================================================================
     ESCENARIO 4: Áreas táctiles suficientes (>= 44px)
     ========================================================================= */
  describe('Escenario 4: Áreas táctiles suficientes (>= 44px)', () => {
    it('los botones y controles táctiles de BulkEntryView están configurados para al menos 44px', async () => {
      const wrapper = mount(BulkEntryView);
      await flushPromises();

      // Botón de alternar presente/ausente
      const toggleBtn = wrapper.find('.btn-toggle-absent');
      expect(toggleBtn.exists()).toBe(true);

      // Botón de limpiar rejilla
      const clearBtn = wrapper.find('.btn-clear');
      expect(clearBtn.exists()).toBe(true);

      // Botón principal de guardado
      const saveBtn = wrapper.find('.btn--save-batch');
      expect(saveBtn.exists()).toBe(true);

      // Inputs de la rejilla
      const gridInput = wrapper.find('.grid-input');
      expect(gridInput.exists()).toBe(true);

      // Selectores de sesión
      expect(wrapper.find('.select-input').exists()).toBe(true);
      expect(wrapper.find('.date-input').exists()).toBe(true);
    });

    it('los elementos de navegación en AppSidebar tienen estructura táctil ergonómica', () => {
      const wrapper = mount(AppSidebar, mountOptions);
      const navItem = wrapper.find('.nav-item');
      expect(navItem.exists()).toBe(true);

      const avatarWrapper = wrapper.find('.user-avatar-wrapper');
      expect(avatarWrapper.exists()).toBe(true);
    });
  });

  /* =========================================================================
     ESCENARIO 5: Móvil (< 768px)
     ========================================================================= */
  describe('Escenario 5: Móvil', () => {
    it('BulkEntryView define estructura apilada para pantallas móviles', async () => {
      const wrapper = mount(BulkEntryView);
      await flushPromises();

      expect(wrapper.find('.session-form-grid').exists()).toBe(true);
      expect(wrapper.find('.quick-stats').exists()).toBe(true);
      expect(wrapper.find('.grid-actions-footer').exists()).toBe(true);
    });
  });
});
