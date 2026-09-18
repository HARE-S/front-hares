import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatPPM,
  formatVef,
  formatDate,
  formatPercent,
  formatSecondsToMMSS,
  formatMMSSToSeconds,
  calculatePPM,
  calculateVef,
  getReadingBand
} from '../utils/format';

describe('Utilidades de formato (Contrato 4)', () => {
  describe('formatPPM', () => {
    it('formatea números correctamente redondeados', () => {
      expect(formatPPM(125.4)).toBe('125');
      expect(formatPPM(125.6)).toBe('126');
      expect(formatPPM(120)).toBe('120');
    });

    it('devuelve "-" ante valores nulos o vacíos', () => {
      expect(formatPPM(null)).toBe('-');
      expect(formatPPM(undefined)).toBe('-');
      expect(formatPPM('')).toBe('-');
    });
  });

  describe('formatVef', () => {
    it('formatea la velocidad eficaz correctamente', () => {
      expect(formatVef(94.2)).toBe('94');
      expect(formatVef(null)).toBe('-');
    });
  });

  describe('formatDate', () => {
    it('convierte formato ISO YYYY-MM-DD a DD/MM/YYYY', () => {
      expect(formatDate('2026-09-18')).toBe('18/09/2026');
      expect(formatDate(null)).toBe('-');
    });
  });

  describe('formatPercent', () => {
    it('añade el símbolo de porcentaje y redondea', () => {
      expect(formatPercent(85.3)).toBe('85%');
      expect(formatPercent(null)).toBe('-');
    });
  });

  describe('formatSecondsToMMSS y formatMMSSToSeconds', () => {
    it('convierte segundos a formato mm:ss', () => {
      expect(formatSecondsToMMSS(65)).toBe('01:05');
      expect(formatSecondsToMMSS(125)).toBe('02:05');
      expect(formatSecondsToMMSS(0)).toBe('00:00');
    });

    it('convierte mm:ss a segundos numéricos', () => {
      expect(formatMMSSToSeconds('01:05')).toBe(65);
      expect(formatMMSSToSeconds('02:05')).toBe(125);
      expect(formatMMSSToSeconds('65')).toBe(65);
      expect(formatMMSSToSeconds('')).toBe(0);
    });
  });

  describe('calculatePPM y calculateVef', () => {
    it('calcula PPM según la fórmula (palabras * 60) / segundos', () => {
      // 100 palabras en 60 segundos = 100 PPM
      expect(calculatePPM(100, 60)).toBe(100);
      // 120 palabras en 60 segundos = 120 PPM
      expect(calculatePPM(120, 60)).toBe(120);
      // 100 palabras en 50 segundos = 120 PPM
      expect(calculatePPM(100, 50)).toBe(120);
      expect(calculatePPM(0, 60)).toBe(0);
      expect(calculatePPM(100, 0)).toBe(0);
    });

    it('calcula Vef según PPM * (aciertos / totalPreguntas)', () => {
      // 100 PPM con 20 aciertos de 20 = 100 Vef
      expect(calculateVef(100, 20, 20)).toBe(100);
      // 100 PPM con 15 aciertos de 20 = 75 Vef
      expect(calculateVef(100, 15, 20)).toBe(75);
      // 100 PPM con 10 aciertos de 20 = 50 Vef
      expect(calculateVef(100, 10, 20)).toBe(50);
      expect(calculateVef(0, 15, 20)).toBe(0);
    });
  });

  describe('getReadingBand', () => {
    it('clasifica según bandas pedagógicas de Peñascal', () => {
      expect(getReadingBand(120)).toBe('Avanzado');
      expect(getReadingBand(110)).toBe('Avanzado');
      expect(getReadingBand(100)).toBe('En nivel');
      expect(getReadingBand(85)).toBe('En nivel');
      expect(getReadingBand(80)).toBe('Requiere apoyo');
      expect(getReadingBand(0)).toBe('Sin datos');
      expect(getReadingBand(null)).toBe('Sin datos');
    });
  });
});
