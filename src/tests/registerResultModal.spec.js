import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RegisterResultModal from '../components/results/RegisterResultModal.vue';
import * as resultsService from '../services/resultsService';

describe('RegisterResultModal.vue (Registro de Prueba Individual — FE-18)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('FE-18 Escenario 1 y 2: permite registrar un resultado y muestra las tres métricas con banda', async () => {
    const mockSaved = {
      id: 'res-new',
      studentId: '1',
      studentName: 'Lucas Méndez Ruiz',
      testId: '1IF',
      testName: 'La Vaca (1IF)',
      time: 60,
      successes: 18,
      mistakes: 1,
      ppm: 100,
      vef: 90,
      band: 'En nivel',
      comprehension: 90
    };

    vi.spyOn(resultsService, 'registerSingleResult').mockResolvedValue(mockSaved);

    const wrapper = mount(RegisterResultModal, {
      props: {
        isOpen: true,
        studentId: '1',
        studentName: 'Lucas Méndez Ruiz'
      }
    });

    await flushPromises();

    // Rellenar datos
    await wrapper.find('[data-testid="time-input"]').setValue(60);
    await wrapper.find('[data-testid="successes-input"]').setValue(18);
    await wrapper.find('[data-testid="mistakes-input"]').setValue(1);

    // Comprobar previsualización instantánea antes de guardar
    expect(wrapper.find('[data-testid="preview-ppm"]').text()).toContain('PPM');
    expect(wrapper.find('[data-testid="preview-comp"]').text()).toContain('90%');
    expect(wrapper.find('[data-testid="preview-band"]').text()).toContain('Avanzado');

    // Guardar
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(resultsService.registerSingleResult).toHaveBeenCalled();
    expect(wrapper.emitted('saved')).toBeTruthy();

    // Resumen de confirmación con las tres métricas
    expect(wrapper.find('[data-testid="result-saved-summary"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="saved-ppm"]').text()).toContain('100');
    expect(wrapper.find('[data-testid="saved-comp"]').text()).toContain('90%');
    expect(wrapper.find('[data-testid="saved-vef"]').text()).toContain('90');
    expect(wrapper.find('[data-testid="saved-band"]').text()).toContain('En nivel');
  });

  it('FE-18 Escenario 3: rechaza valores inválidos de tiempo y suma superior a 20', async () => {
    const wrapper = mount(RegisterResultModal, {
      props: {
        isOpen: true,
        studentId: '1'
      }
    });
    await flushPromises();

    // 1. Tiempo 0 o negativo
    await wrapper.find('[data-testid="time-input"]').setValue(0);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('[data-testid="error-alert"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="error-alert"]').text()).toContain('El tiempo debe ser un número entero mayor a cero segundos');

    // 2. Suma de aciertos y errores > 20
    await wrapper.find('[data-testid="time-input"]').setValue(60);
    await wrapper.find('[data-testid="successes-input"]').setValue(18);
    await wrapper.find('[data-testid="mistakes-input"]').setValue(5); // 18 + 5 = 23 > 20
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('[data-testid="error-alert"]').text()).toContain('La suma de aciertos y errores no puede superar 20');
  });

  it('FE-18 Escenario 4: maneja error 409 de duplicado con mensaje comprensible', async () => {
    const conflictErr = new Error('Ya existe un registro para este alumno con la misma prueba y fecha.');
    conflictErr.status = 409;
    vi.spyOn(resultsService, 'registerSingleResult').mockRejectedValue(conflictErr);

    const wrapper = mount(RegisterResultModal, {
      props: {
        isOpen: true,
        studentId: '1'
      }
    });
    await flushPromises();

    await wrapper.find('[data-testid="time-input"]').setValue(60);
    await wrapper.find('[data-testid="successes-input"]').setValue(16);
    await wrapper.find('[data-testid="mistakes-input"]').setValue(2);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('[data-testid="error-alert"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="error-alert"]').text()).toContain('Ya existe un registro para este alumno con la misma prueba y fecha');
  });

  it('FE-18 Escenario 5: maneja error 403 de permisos sin redirigir', async () => {
    const forbiddenErr = new Error('No tienes permiso sobre la sección de este alumno para registrar resultados.');
    forbiddenErr.status = 403;
    vi.spyOn(resultsService, 'registerSingleResult').mockRejectedValue(forbiddenErr);

    const wrapper = mount(RegisterResultModal, {
      props: {
        isOpen: true,
        studentId: '99'
      }
    });
    await flushPromises();

    await wrapper.find('[data-testid="time-input"]').setValue(70);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('[data-testid="forbidden-alert"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="forbidden-alert"]').text()).toContain('Acceso denegado');
    expect(wrapper.find('[data-testid="forbidden-alert"]').text()).toContain('No tienes permiso');
  });

  it('FE-18 Escenario 6: detecta tiempo sospechoso y exige confirmación para guardar', async () => {
    const mockSaved = {
      id: 'res-fast',
      studentId: '1',
      ppm: 400,
      vef: 400,
      band: 'Avanzado',
      comprehension: 100
    };
    vi.spyOn(resultsService, 'registerSingleResult').mockResolvedValue(mockSaved);

    const wrapper = mount(RegisterResultModal, {
      props: {
        isOpen: true,
        studentId: '1'
      }
    });
    await flushPromises();

    // Tiempo inusualmente rápido: 14s para un texto de ~300 palabras (> 1000 PPM)
    await wrapper.find('[data-testid="time-input"]').setValue(14);
    await wrapper.find('[data-testid="successes-input"]').setValue(20);
    await wrapper.find('[data-testid="mistakes-input"]').setValue(0);
    await flushPromises();

    // Debe saltar la alerta de tiempo sospechoso
    expect(wrapper.find('[data-testid="suspicious-time-alert"]').exists()).toBe(true);

    // Intentar guardar sin confirmar debe bloquearse con mensaje
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('[data-testid="error-alert"]').text()).toContain('confirma que el tiempo sospechoso es correcto');
    expect(resultsService.registerSingleResult).not.toHaveBeenCalled();

    // Marcar checkbox de confirmación
    const checkbox = wrapper.find('[data-testid="confirm-suspicious-time"]');
    await checkbox.setValue(true);
    await flushPromises();

    // Guardar de nuevo
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(resultsService.registerSingleResult).toHaveBeenCalled();
  });
});
