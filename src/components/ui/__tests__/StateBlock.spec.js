import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { AlertCircle, Inbox, RotateCcw, SearchX, ShieldAlert } from 'lucide-vue-next';
import StateBlock from '../StateBlock.vue';

function mountState(props = {}, options = {}) {
  return mount(StateBlock, {
    props: { state: 'empty', ...props },
    ...options,
  });
}

describe('StateBlock.vue — Estados de pantalla (FE-11)', () => {
  it('renderiza un esqueleto con la forma del contenido en estado loading (Escenario 1)', () => {
    const wrapper = mountState({ state: 'loading' });

    expect(wrapper.classes()).toContain('state--loading');
    expect(wrapper.find('.state__skeleton.skeleton').exists()).toBe(true);
    expect(wrapper.find('.skeleton-line').exists()).toBe(true);
    // No debe aparecer un texto genérico de cargando
    expect(wrapper.text()).not.toMatch(/cargando/i);
    expect(wrapper.find('.state__icon').exists()).toBe(false);
  });

  it('ofrece tres formas distintas de esqueleto (tarjeta, tabla y ficha)', () => {
    const card = mountState({ state: 'loading', skeleton: 'card' });
    const table = mountState({ state: 'loading', skeleton: 'table' });
    const detail = mountState({ state: 'loading', skeleton: 'detail' });

    expect(card.find('.state__skeleton').classes()).toContain('skeleton--card');
    expect(table.find('.state__skeleton').classes()).toContain('skeleton--table');
    expect(detail.find('.state__skeleton').classes()).toContain('skeleton--detail');
    expect(table.find('.skeleton-table-header').exists()).toBe(true);
    expect(detail.find('.skeleton-avatar').exists()).toBe(true);
  });

  it('muestra el estado vacío con mensaje y sin botón de reintentar (Escenario 2)', () => {
    const wrapper = mountState({ state: 'empty' });

    expect(wrapper.find('.state__title').text()).toBe('No hay datos');
    expect(wrapper.find('.state__text').exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('permite inyectar una acción sugerida para el estado vacío', () => {
    const wrapper = mountState(
      { state: 'empty' },
      { slots: { default: '<button class="btn btn-primary">Importar datos</button>' } }
    );

    expect(wrapper.find('.state__action button').text()).toBe('Importar datos');
  });

  it('muestra error con mensaje y emite @retry al pulsar Reintentar (Escenario 3)', async () => {
    const wrapper = mountState({ state: 'error' });

    expect(wrapper.find('.state__title').text()).toBe('No se pudieron cargar los datos');
    const retry = wrapper.find('button');
    expect(retry.text()).toContain('Reintentar');

    await retry.trigger('click');
    expect(wrapper.emitted('retry')).toHaveLength(1);
  });

  it('no muestra botón de reintentar si retryable es false', () => {
    const wrapper = mountState({ state: 'error', retryable: false });

    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('muestra acceso denegado sin botón de reintentar y sin redirigir al login (Escenario 4)', () => {
    const wrapper = mountState({ state: 'forbidden' });

    expect(wrapper.classes()).toContain('state--forbidden');
    expect(wrapper.find('.state__title').text()).toBe('No tienes permiso para acceder');
    // No hay redirección al login: el componente no emite nada ni muestra opción de login
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.text()).not.toMatch(/iniciar sesi|acceder de nuevo/i);
    expect(JSON.stringify(wrapper.emitted())).not.toMatch(/redirect/i);
  });

  it('distingue lista vacía de recurso no encontrado (Escenario 5)', () => {
    const empty = mountState({ state: 'empty' });
    const notfound = mountState({ state: 'notfound' });

    expect(empty.classes()).toContain('state--empty');
    expect(notfound.classes()).toContain('state--notfound');
    expect(empty.find('.state__title').text()).toBe('No hay datos');
    expect(notfound.find('.state__title').text()).toBe('No encontrado');
    expect(notfound.find('.state__title').text()).not.toBe(empty.find('.state__title').text());
    expect(notfound.find('.state__text').exists()).toBe(true);
  });

  it('permite sobrescribir título y mensaje desde la vista madre', () => {
    const wrapper = mountState({
      state: 'empty',
      title: 'Sin lecturas este trimestre',
      message: 'Asigna un libro para comenzar.',
    });

    expect(wrapper.find('.state__title').text()).toBe('Sin lecturas este trimestre');
    expect(wrapper.find('.state__text').text()).toBe('Asigna un libro para comenzar.');
  });

  it('usa el icono correcto para cada estado', () => {
    expect(mountState({ state: 'empty' }).findComponent(Inbox).exists()).toBe(true);
    expect(mountState({ state: 'error' }).findComponent(AlertCircle).exists()).toBe(true);
    expect(mountState({ state: 'forbidden' }).findComponent(ShieldAlert).exists()).toBe(true);
    expect(mountState({ state: 'notfound' }).findComponent(SearchX).exists()).toBe(true);
    // El botón de error incluye el icono RotateCcw
    expect(mountState({ state: 'error' }).findComponent(RotateCcw).exists()).toBe(true);
  });
});