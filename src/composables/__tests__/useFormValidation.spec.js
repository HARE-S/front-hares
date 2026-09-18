import { describe, it, expect, vi } from 'vitest';
import { useFormValidation } from '../useFormValidation';
import { ApiError } from '../../services/api';
import {
  validateRequired,
  validateRange,
  validateReadingResult,
  isPlausibleReadingTime,
} from '../../utils/validation';

/**
 * Tests de T-FE12-04: Composable useFormValidation (FE-12).
 * Cubre los 5 escenarios de la historia de usuario.
 */

const WORDS_872 = 872;

function buildReadingForm() {
  const form = useFormValidation();
  form.defineField('time', {
    validators: [(v) => validateRange(v, 0, Number.MAX_SAFE_INTEGER, 'Tiempo')],
  });
  form.defineField('successes', {
    validators: [
      (v) => validateRange(v, 0, Number.MAX_SAFE_INTEGER, 'Aciertos'),
      // Es un minimapa, el rango real lo da validateReadingResult en la vista
    ],
  });
  form.defineField('mistakes', {
    validators: [(v) => validateRange(v, 0, Number.MAX_SAFE_INTEGER, 'Errores')],
  });
  return form;
}

describe('Escenario 1 — Validación antes de enviar (sin petición)', () => {
  it('no llama al handler cuando hay un campo inválido', async () => {
    const form = buildReadingForm();
    form.setValue('time', -5);
    form.setValue('successes', 10);
    form.setValue('mistakes', 2);

    const handler = vi.fn().mockResolvedValue({ ok: true });
    const result = await form.submit(handler);

    expect(handler).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, validation: true });
    expect(form.fields.time.error).not.toBeNull();
  });

  it('llama al handler con los valores cuando todo es válido', async () => {
    const form = buildReadingForm();
    form.setValue('time', 45);
    form.setValue('successes', 10);
    form.setValue('mistakes', 2);

    const handler = vi.fn().mockResolvedValue({ id: 1 });
    const result = await form.submit(handler);

    expect(handler).toHaveBeenCalledWith({ time: 45, successes: 10, mistakes: 2 });
    expect(result).toEqual({ ok: true, result: { id: 1 } });
  });
});

describe('Escenario 2 — Error del servidor junto al campo', () => {
  it('coloca el error del servidor en el campo correspondiente vía fieldMap', async () => {
    const form = buildReadingForm();
    form.setValue('time', 45);
    form.setValue('successes', 6);
    form.setValue('mistakes', 16);

    const serverError = new ApiError('La suma no puede superar 20', 400, {
      error: 'La suma no puede superar 20',
      field: 'mistakes',
    });
    const handler = vi.fn().mockRejectedValue(serverError);
    const result = await form.submit(handler, { mistakes: 'mistakes' });

    expect(result.ok).toBe(false);
    expect(result.error).toBe(serverError);
    expect(form.fields.mistakes.error).toBe('La suma no puede superar 20');
    expect(form.globalError.value).toBeNull();
  });

  it('deja un mensaje global cuando el servidor no indica campo', async () => {
    const form = buildReadingForm();
    form.setValue('time', 45);
    form.setValue('successes', 10);
    form.setValue('mistakes', 2);

    const serverError = new ApiError('No se pudo conectar con el servidor', 0, null);
    const handler = vi.fn().mockRejectedValue(serverError);
    await form.submit(handler);

    expect(form.globalError.value).toBe('No se pudo conectar con el servidor');
  });
});

describe('Escenario 3 — No se pierde lo tecleado', () => {
  it('conserva los valores del formulario tras un error del servidor', async () => {
    const form = buildReadingForm();
    form.setValue('time', 47);
    form.setValue('successes', 8);
    form.setValue('mistakes', 5);

    const serverError = new ApiError('Fallo de infraestructura', 500, {
      error: 'Fallo de infraestructura',
      field: 'time',
    });
    const handler = vi.fn().mockRejectedValue(serverError);
    await form.submit(handler);

    expect(form.fields.time.value).toBe(47);
    expect(form.fields.successes.value).toBe(8);
    expect(form.fields.mistakes.value).toBe(5);
  });

  it('setValue no borra el valor tecleado', () => {
    const form = buildReadingForm();
    form.setValue('time', 30);
    expect(form.fields.time.value).toBe(30);
  });
});

describe('Escenario 4 — Rangos numéricos en cliente', () => {
  it('detecta los tres campos negativos a la vez con validate()', () => {
    const form = buildReadingForm();
    form.setValue('time', -1);
    form.setValue('successes', -2);
    form.setValue('mistakes', -3);

    const { valid, errors } = form.validate();

    expect(valid).toBe(false);
    expect(errors.time).not.toBeNull();
    expect(errors.successes).not.toBeNull();
    expect(errors.mistakes).not.toBeNull();
  });

  it('apoya el límite de 20 con la regla compuesta de la historia', () => {
    const form = useFormValidation();
    form.defineField('successes', { validators: [(v) => validateRange(v, 0, 20, 'Aciertos')] });
    form.defineField('mistakes', { validators: [(v) => validateRange(v, 0, 20, 'Errores')] });
    form.defineField('sum', {
      validators: [
        (v) =>
          validateReadingResult({
            time: 30,
            successes: form.fields.successes.value,
            mistakes: form.fields.mistakes.value,
          }).sum || null,
      ],
    });

    form.setValue('successes', 15);
    form.setValue('mistakes', 6);

    const { valid, errors } = form.validate();
    expect(valid).toBe(false);
    expect(errors.sum).toContain('20');
  });
});

describe('Escenario 5 — Aviso sospechoso sin bloquear', () => {
  function buildSuspiciousForm() {
    const form = useFormValidation();
    form.defineField('time', {
      validators: [(v) => validateRange(v, 0, Number.MAX_SAFE_INTEGER, 'Tiempo')],
      suspicious: (sec) =>
        isPlausibleReadingTime(sec, WORDS_872)
          ? '5 segundos para 872 palabras parece fuera de rango.'
          : null,
    });
    return form;
  }

  it('marca el aviso al salir del campo sin impedir la validación', () => {
    const form = buildSuspiciousForm();
    form.setValue('time', 5);

    const errorOnBlur = form.blurField('time');

    // Avísos visible (no bloqueante)
    expect(form.fields.time.suspiciousText).toContain('fuera de rango');
    expect(form.fields.time.touched).toBe(true);
    // No hay error de validación: 5 >= 0 es un valor "técnicamente válido"
    expect(errorOnBlur).toBeNull();
  });

  it('el formulario puede enviarse pese al aviso (no bloquea)', async () => {
    const form = buildSuspiciousForm();
    form.setValue('time', 5);
    form.blurField('time');

    const handler = vi.fn().mockResolvedValue({ ok: true });
    const result = await form.submit(handler);

    expect(result.ok).toBe(true);
    expect(handler).toHaveBeenCalled();
  });

  it('no marca aviso para tiempos razonables', () => {
    const form = buildSuspiciousForm();
    form.setValue('time', 120);

    form.blurField('time');
    expect(form.fields.time.suspiciousText).toBeNull();
  });

  it('borra el aviso al volver a teclear (se re-evalúa en el siguiente blur)', () => {
    const form = buildSuspiciousForm();
    form.setValue('time', 5);
    form.blurField('time');
    expect(form.fields.time.suspiciousText).not.toBeNull();

    form.setValue('time', 120);
    expect(form.fields.time.suspiciousText).toBeNull();
  });
});

describe('reset y clearErrors', () => {
  it('reset devuelve los valores iniciales y limpia estados', () => {
    const form = buildReadingForm();
    form.setValue('time', 99);
    form.setValue('successes', 1);
    form.setValue('mistakes', 1);
    form.blurField('time');

    form.reset();

    expect(form.fields.time.value).toBe('');
    expect(form.fields.successes.value).toBe('');
    expect(form.fields.time.touched).toBe(false);
    expect(form.fields.time.error).toBeNull();
  });

  it('clearErrors limpia errores sin tocar valores', () => {
    const form = buildReadingForm();
    form.setValue('time', -3);
    form.validate();

    expect(form.fields.time.error).not.toBeNull();
    form.clearErrors();

    expect(form.fields.time.error).toBeNull();
    expect(form.fields.time.value).toBe(-3);
  });
});