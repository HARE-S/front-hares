import { describe, it, expect } from 'vitest';
import { classifyVefBand, VEF_BAND_LABELS, vefBandClass } from '@/utils/bands';

describe('classifyVefBand', () => {
  it('alta cuando vef supera el umbral alto (90 -> alta)', () => {
    expect(classifyVefBand(90)).toBe('alta');
    expect(classifyVefBand(140)).toBe('alta');
  });

  it('normal dentro del rango (50 -> normal)', () => {
    expect(classifyVefBand(50)).toBe('normal');
  });

  it('baja por debajo del umbral bajo (20 -> baja)', () => {
    expect(classifyVefBand(20)).toBe('baja');
  });

  it('frontera exacta: 25 y 85 corresponden a normal', () => {
    expect(classifyVefBand(25)).toBe('normal');
    expect(classifyVefBand(85)).toBe('normal');
  });

  it('nodata cuando no hay dato, no baja', () => {
    expect(classifyVefBand(null)).toBe('nodata');
    expect(classifyVefBand(undefined)).toBe('nodata');
    expect(classifyVefBand('')).toBe('nodata');
    expect(classifyVefBand('abc')).toBe('nodata');
  });

  it('respeta umbrales configurables (para FE-34)', () => {
    const config = { low: 30, high: 80 };
    expect(classifyVefBand(29, config)).toBe('baja');
    expect(classifyVefBand(30, config)).toBe('normal');
    expect(classifyVefBand(80, config)).toBe('normal');
    expect(classifyVefBand(81, config)).toBe('alta');
  });
});

describe('VEF_BAND_LABELS / vefBandClass', () => {
  it('exporta etiquetas y clases por banda', () => {
    expect(VEF_BAND_LABELS.alta).toBe('Alta');
    expect(VEF_BAND_LABELS.normal).toBe('Normal');
    expect(VEF_BAND_LABELS.baja).toBe('Baja');
    expect(VEF_BAND_LABELS.nodata).toBe('Sin dato');
    expect(vefBandClass('alta')).toBe('badge-alta');
    expect(vefBandClass('nodata')).toBe('badge-nodata');
    expect(vefBandClass('desconocida')).toBe('badge-nodata');
  });
});