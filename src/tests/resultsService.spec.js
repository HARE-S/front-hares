import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerSingleResult,
  registerBatchResults,
  updateResult,
  deleteResult,
  getSectionResults,
  _resetInMemoryResults,
  _getInMemoryResults
} from '../services/resultsService';

describe('Servicio de Resultados (FE-20, FE-19, FE-29)', () => {
  beforeEach(() => {
    _resetInMemoryResults([
      {
        id: 'res-test-1',
        studentId: '1',
        studentName: 'Alumno 1',
        testId: '1IF',
        testName: 'La Vaca',
        sectionId: 'sec-1',
        testDate: '2026-09-15',
        time: 60,
        successes: 20,
        mistakes: 0,
        ppm: 108,
        vef: 108,
        band: 'En nivel'
      }
    ]);
  });

  describe('registerBatchResults (FE-20)', () => {
    it('registra alumnos presentes y contabiliza los ausentes sin guardar ceros', async () => {
      const batchData = {
        sectionId: 'sec-1',
        testId: '1IF',
        testName: 'La Vaca',
        testWords: 100,
        testDate: '2026-09-18',
        results: [
          { studentId: 'stu-1', time: 60, successes: 18, mistakes: 1, absent: false },
          { studentId: 'stu-2', time: '', successes: '', mistakes: '', absent: true }, // ausente
          { studentId: 'stu-3', time: 50, successes: 20, mistakes: 0, absent: false },
          { studentId: 'stu-4', time: null, successes: null, mistakes: null } // ausente
        ]
      };

      const res = await registerBatchResults(batchData);
      expect(res.registered).toBe(2);
      expect(res.absent).toBe(2);
      expect(res.results).toHaveLength(2);

      // Comprobar cálculo de PPM y Vef para stu-1: 100 palabras en 60s = 100 PPM, 18/20 = 90 Vef
      const stu1 = res.results.find(r => r.studentId === 'stu-1');
      expect(stu1).toBeDefined();
      expect(stu1.ppm).toBe(100);
      expect(stu1.vef).toBe(90);
      expect(stu1.band).toBe('En nivel');
    });

    it('lanza error si falta sectionId, testId o testDate', async () => {
      await expect(registerBatchResults({ testId: '1IF', testDate: '2026-09-18' }))
        .rejects.toThrow('sectionId es obligatorio');
      await expect(registerBatchResults({ sectionId: 'sec-1', testDate: '2026-09-18' }))
        .rejects.toThrow('testId es obligatorio');
      await expect(registerBatchResults({ sectionId: 'sec-1', testId: '1IF' }))
        .rejects.toThrow('testDate es obligatorio');
    });
  });

  describe('updateResult (FE-19)', () => {
    it('rectifica valores y recalcula PPM, Vef y banda', async () => {
      const updated = await updateResult('res-test-1', {
        time: 50,
        successes: 20,
        mistakes: 0,
        testWords: 100
      });

      expect(updated.time).toBe(50);
      expect(updated.ppm).toBe(120); // (100 * 60) / 50 = 120
      expect(updated.vef).toBe(120);
      expect(updated.band).toBe('Avanzado');
    });

    it('valida que el tiempo no sea negativo ni 0', async () => {
      await expect(updateResult('res-test-1', { time: 0 }))
        .rejects.toThrow('El tiempo debe ser mayor a 0');
      await expect(updateResult('res-test-1', { time: -10 }))
        .rejects.toThrow('El tiempo debe ser mayor a 0');
    });
  });

  describe('deleteResult (FE-19)', () => {
    it('elimina el resultado del histórico', async () => {
      const deleted = await deleteResult('res-test-1');
      expect(deleted).toBe(true);

      const all = _getInMemoryResults();
      expect(all.find(r => r.id === 'res-test-1')).toBeUndefined();
    });
  });

  describe('getSectionResults (FE-29)', () => {
    it('obtiene los resultados de la sección', async () => {
      const list = await getSectionResults('sec-1');
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('res-test-1');
    });
  });

  describe('registerSingleResult (FE-18)', () => {
    it('FE-18 Escenario 1 y 2: registra un resultado individual calculando PPM, Comprensión %, Vef y banda', async () => {
      const resultData = {
        studentId: 'stu-99',
        studentName: 'Miren Arana',
        testId: '1AF',
        testName: 'El Patito Feo',
        testWords: 120,
        sectionId: 'sec-1',
        testDate: '2026-09-18',
        time: 60,
        successes: 18,
        mistakes: 1
      };

      const res = await registerSingleResult(resultData);
      expect(res).toBeDefined();
      expect(res.studentId).toBe('stu-99');
      // 120 palabras en 60s = 120 PPM
      expect(res.ppm).toBe(120);
      // Comprensión 18/20 = 90%
      expect(res.comprehension).toBe(90);
      // Vef = 120 * (18 / 20) = 108
      expect(res.vef).toBe(108);
      expect(res.band).toBe('En nivel');
    });

    it('FE-18 Escenario 3: rechaza valores inválidos de tiempo, aciertos y errores', async () => {
      const base = {
        studentId: 'stu-1',
        testId: '1IF',
        testDate: '2026-09-19',
        time: 50,
        successes: 10,
        mistakes: 2
      };

      // Tiempo cero o negativo
      await expect(registerSingleResult({ ...base, time: 0 }))
        .rejects.toThrow('El tiempo debe ser un número mayor a cero segundos.');
      await expect(registerSingleResult({ ...base, time: -5 }))
        .rejects.toThrow('El tiempo debe ser un número mayor a cero segundos.');

      // Aciertos negativos
      await expect(registerSingleResult({ ...base, successes: -1 }))
        .rejects.toThrow('Los aciertos no pueden ser negativos.');

      // Errores negativos
      await expect(registerSingleResult({ ...base, mistakes: -1 }))
        .rejects.toThrow('Los errores no pueden ser negativos.');

      // Suma de aciertos y errores superior a 20
      await expect(registerSingleResult({ ...base, successes: 15, mistakes: 10 }))
        .rejects.toThrow('La suma de aciertos y errores no puede superar 20.');
    });

    it('FE-18 Escenario 4: detecta duplicados cuando el alumno ya tiene esa prueba en esa fecha', async () => {
      // 'res-test-1' en beforeEach tiene studentId '1', testId '1IF', testDate '2026-09-15'
      const duplicateData = {
        studentId: '1',
        testId: '1IF',
        testDate: '2026-09-15',
        time: 55,
        successes: 19,
        mistakes: 0
      };

      await expect(registerSingleResult(duplicateData))
        .rejects.toThrow('Ya existe un registro para este alumno con la misma prueba y fecha.');
    });
  });
});
