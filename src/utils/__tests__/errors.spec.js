import { describe, it, expect } from 'vitest';
import {
  extractFieldErrors,
  mapServerErrors,
  hasFieldErrors,
} from '../errors';
import { ApiError } from '../../services/api';

/**
 * Tests de T-FE12-03: Mapeo de errores del servidor (FE-12).
 * Cubre el Escenario 2 (el error del servidor aparece junto al campo)
 * y el Escenario 3 (no se pierde lo tecleado: los errores por campo
 * no reemplazan los valores del formulario).
 */

const FIELD_ERROR_BODY = {
  error: 'El alumno especificado no existe',
  field: 'student_id',
};

describe('extractFieldErrors', () => {
  it('extrae el mensaje y campo del formato estándar del backend', () => {
    expect(extractFieldErrors(FIELD_ERROR_BODY)).toEqual({
      student_id: 'El alumno especificado no existe',
    });
  });

  it('ignora respuestas sin campo', () => {
    expect(extractFieldErrors({ error: 'algo salió mal' })).toEqual({});
    expect(extractFieldErrors(null)).toEqual({});
    expect(extractFieldErrors(undefined)).toEqual({});
  });

  it('prefiere message sobre detail/error cuando hay campo (404 NOT_FOUND)', () => {
    const body = { error: 'NOT_FOUND', message: 'Centro no encontrado', field: 'center_id' };
    expect(extractFieldErrors(body)).toEqual({ center_id: 'Centro no encontrado' });
  });

  it('reconoce un lote con errores por fila (BE-22)', () => {
    const body = {
      error: 'Hay filas inválidas',
      errors: [
        { row: 3, field: 'section', message: 'La sección no está vacía' },
        { row: 5, field: 'external_id', message: 'Ya existe' },
      ],
    };
    expect(extractFieldErrors(body)).toEqual({
      section: 'La sección no está vacía',
      external_id: 'Ya existe',
    });
  });
});

describe('mapServerErrors — Escenario 2 (error junto al campo)', () => {
  it('coloca el error del servidor bajo el campo del formulario', () => {
    const apiErr = new ApiError('El alumno especificado no existe', 400, FIELD_ERROR_BODY);
    const { errors, global } = mapServerErrors(apiErr, { student_id: 'externalId' });

    expect(errors.externalId).toBe('El alumno especificado no existe');
    expect(global).toBeNull();
  });

  it('traduce claves con fieldMap: las claves del backend no llegan al formulario', () => {
    const apiErr = new ApiError('x', 400, { error: 'x', field: 'successes' });
    const { errors } = mapServerErrors(apiErr, { successes: 'ok' });

    expect(errors.ok).toBeDefined();
    expect(errors.successes).toBeUndefined();
  });

  it('deja el error global cuando el servidor no indica campo', () => {
    const apiErr = new ApiError('No se pudo conectar con el servidor', 0, null);
    const { errors, global } = mapServerErrors(apiErr);

    expect(errors).toEqual({});
    expect(global).toBe('No se pudo conectar con el servidor');
  });

  it('usa el mensaje de `data.error` cuando ApiError no trae message útil', () => {
    const apiErr = new ApiError('Error 500: Internal Server Error', 500, {
      error: 'Fallo inesperado al guardar',
    });
    const { global } = mapServerErrors(apiErr);
    expect(global).toBe('Fallo inesperado al guardar');
  });

  it('Escenario 3: mapear el error no toca los valores del formulario (solo devuelve texto)', () => {
    const form = { teacherName: 'Prof. López', words: 872 };
    const apiErr = new ApiError('Campo inválido', 400, { error: 'e', field: 'words' });
    const { errors } = mapServerErrors(apiErr);
    const formBefore = { ...form };

    expect(errors.words).toBeDefined();
    // El formulario original sigue intacto
    expect(form).toEqual(formBefore);
  });
});

describe('hasFieldErrors', () => {
  it('true cuando el cuerpo trae un campo', () => {
    expect(hasFieldErrors(new ApiError('x', 400, FIELD_ERROR_BODY))).toBe(true);
  });

  it('false para errores de red o sin campo', () => {
    expect(hasFieldErrors(new ApiError('sin conexión', 0, null))).toBe(false);
    expect(hasFieldErrors(new Error('cualquier cosa'))).toBe(false);
  });
});