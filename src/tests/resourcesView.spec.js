import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ResourcesView from '@/views/resources/ResourcesView.vue';

// Mock child components
vi.mock('@/views/tests-catalog/TestsCatalogView.vue', () => ({
  default: {
    name: 'TestsCatalogView',
    template: '<div class="tests-catalog-mock">Mock Tests Catalog</div>',
    methods: {
      openCreate: vi.fn()
    }
  }
}));

vi.mock('@/views/books-catalog/BooksCatalogView.vue', () => ({
  default: {
    name: 'BooksCatalogView',
    template: '<div class="books-catalog-mock">Mock Books Catalog</div>'
  }
}));

describe('Tarea 3.1 — Vista Unificada de Recursos Pedagógicos (ResourcesView.vue)', () => {
  it('renderiza la barra de navegación de recursos y por defecto muestra Pruebas de Lectura', () => {
    const wrapper = mount(ResourcesView);

    expect(wrapper.find('.resources-nav-pill').exists()).toBe(true);
    expect(wrapper.text()).toContain('Pruebas de Lectura');
    expect(wrapper.text()).toContain('Biblioteca de Libros');
    expect(wrapper.find('.tests-catalog-mock').exists()).toBe(true);
    expect(wrapper.find('.books-catalog-mock').exists()).toBe(false);
  });

  it('permite alternar entre Pruebas de Lectura y Biblioteca de Libros mediante las pestañas', async () => {
    const wrapper = mount(ResourcesView);

    const tabs = wrapper.findAll('.resources-tab-btn');
    expect(tabs.length).toBe(2);

    // Clic en "Biblioteca de Libros"
    await tabs[1].trigger('click');
    expect(wrapper.find('.books-catalog-mock').exists()).toBe(true);
    expect(wrapper.find('.tests-catalog-mock').exists()).toBe(false);
    expect(wrapper.emitted('update:subTab')).toBeTruthy();
    expect(wrapper.emitted('update:subTab')[0]).toEqual(['books']);

    // Clic de vuelta a "Pruebas de Lectura"
    await tabs[0].trigger('click');
    expect(wrapper.find('.tests-catalog-mock').exists()).toBe(true);
    expect(wrapper.find('.books-catalog-mock').exists()).toBe(false);
  });

  it('respeta initialSubTab="books" al inicializarse', () => {
    const wrapper = mount(ResourcesView, {
      props: {
        initialSubTab: 'books'
      }
    });

    expect(wrapper.find('.books-catalog-mock').exists()).toBe(true);
    expect(wrapper.find('.tests-catalog-mock').exists()).toBe(false);
  });
});
