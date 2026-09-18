import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validateRange,
  validateReadingResult,
  isPlausibleReadingTime,
} from '../validation';

/**
 * Tests de T-FE12-01: Utilidades de validación (FE-12).
 * Cubre obligatoriamente los Escenarios 4 y 5 de la historia.
 */

describe('validateRequired (Escenario 1 de FE-12)', () => {
  it('devuelve error para null, undefined y string vacío', () => {
    expect(validateRequired(null)).not.toBeNull();
    expect(validateRequired(undefined)).not.toBeNull();
    expect(validateRequired('')).not.toBeNull();
  });

  it('devuelve error para string de solo espacios', () => {
    expect(validateRequired('   ')).not.toBeNull();
  });

  it('devuelve error para arrays vacíos', () => {
    expect(validateRequired([])).not.toBeNull();
  });

  it('devuelve null (válido) para valores rellenos', () => {
    expect(validateRequired('HARE-S')).toBeNull();
    expect(validateRequired(0)).toBeNull();
    expect(validateRequired(42)).toBeNull();
    expect(validateRequired(['a'])).toBeNull();
    expect(validateRequired({})).toBeNull();
  });
});

describe('validateRange (bases para Escenario 4)', () => {
  it('devuelve null para un valor dentro del rango', () => {
    expect(validateRange(10, 0, 20)).toBeNull();
    expect(validateRange('5', 0, 20)).toBeNull();
  });

  it('acepta los límites exactos (inclusivo)', () => {
    expect(validateRange(0, 0, 20)).toBeNull();
    expect(validateRange(20, 0, 20)).toBeNull();
  });

  it('rechaza valores fuera del rango', () => {
    expect(validateRange(-1, 0, 20)).not.toBeNull();
    expect(validateRange(21, 0, 20)).not.toBeNull();
  });

  it('rechaza valores no numéricos', () => {
    expect(validateRange('abc', 0, 20)).not.toBeNull();
    expect(validateRange('', 0, 20)).not.toBeNull();
  });

  it('incluye la etiqueta del campo en el mensaje', () => {
    expect(validateRange(-5, 0, 20, 'Tiempo')).toContain('Tiempo');
  });
});

describe('validateReadingResult — Escenario 4 (rangos numéricos)', () => {
  it('rechaza un tiempo negativo antes de enviar', () => {
    const errors = validateReadingResult({ time: -5, successes: 10, mistakes: 2 });
    expect(errors.time).not.toBeNull();
  });

  it('rechaza aciertos negativos', () => {
    const errors = validateReadingResult({ time: 30, successes: -1, mistakes: 2 });
    expect(errors.successes).not.toBeNull();
  });

  it('rechaza errores negativos', () => {
    const errors = validateReadingResult({ time: 30, successes: 10, mistakes: -1 });
    expect(errors.mistakes).not.toBeNull();
  });

  it('rechaza cuando aciertos + errores superan 20', () => {
    const errors = validateReadingResult({ time: 30, successes: 15, mistakes: 6 });
    expect(errors.sum).not.toBeNull();
  });

  it('acepta aciertos + errores exactamente en 20', () => {
    const errors = validateReadingResult({ time: 30, successes: 12, mistakes: 8 });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('devuelve objeto vacío para valores válidos', () => {
    const errors = validateReadingResult({ time: 45, successes: 10, mistakes: 3 });
    expect(errors).toEqual({});
  });

  it('marca varios errores a la vez sin detenerse en el primero', () => {
    const errors = validateReadingResult({ time: -5, successes: -2, mistakes: -1 });
    expect(errors.time).not.toBeNull();
    expect(errors.successes).not.toBeNull();
    expect(errors.mistakes).not.toBeNull();
  });
});

describe('isPlausibleReadingTime — Escenario 5 (aviso sospechoso)', () => {
  const WORDS_872 = 872;

  it('marca como sospechoso 5 segundos para 872 palabras (minutos en vez de segundos)', () => {
    expect(isPlausibleReadingTime(5, WORDS_872)).toBe(true);
  });

  it('no marca un tiempo razonable', () => {
    expect(isPlausibleReadingTime(120, WORDS_872)).toBe(false);
  });

  it('respeta el umbral configurable por defecto (120 palabras/s)', () => {
    // 872 / 7 = ~124.6 p/s → sobre el umbral
    expect(isPlausibleReadingTime(7, WORDS_872)).toBe(true);
    // 872 / 8 = 109 p/s → dentro del umbral
    expect(isPlausibleReadingTime(8, WORDS_872)).toBe(false);
  });

  it('permite cambiar el umbral', () => {
    expect(isPlausibleReadingTime(60, WORDS_872, { maxWordsPerSecond: 10 })).toBe(true);
    expect(isPlausibleReadingTime(60, WORDS_872, { maxWordsPerSecond: 20 })).toBe(false);
  });

  it('no marca aviso sin número de palabras (no hay con qué juzgar)', () => {
    expect(isPlausibleReadingTime(5, undefined)).toBe(false);
  });

  it('no marca aviso para tiempos no numéricos o ≤ 0', () => {
    expect(isPlausibleReadingTime('abc', WORDS_872)).toBe(false);
    expect(isPlausibleReadingTime(0, WORDS_872)).toBe(false);
    expect(isPlausibleReadingTime(-3, WORDS_872)).toBe(false);
  });
});