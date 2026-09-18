import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportResultsToExcel,
  getStudentReport,
  getSectionGroupReport
} from '../services/reportsService';
import { _resetInMemoryResults } from '../services/resultsService';

describe('Servicio de Informes y Exportación (FE-36, FE-37, FE-38)', () => {
  beforeEach(() => {
    _resetInMemoryResults([
      {
        id: 'res-1',
        studentId: '1',
        studentName: 'Lucas Méndez Ruiz',
        testId: '1IF',
        testName: 'La Vaca',
        sectionId: 'sec-1',
        testDate: '2026-09-10',
        time: 55,
        successes: 18,
        mistakes: 1,
        ppm: 118,
        vef: 106,
        band: 'En nivel'
      },
      {
        id: 'res-2',
        studentId: '1',
        studentName: 'Lucas Méndez Ruiz',
        testId: '1LF',
        testName: 'El Perro Cantor',
        sectionId: 'sec-1',
        testDate: '2026-09-15',
        time: 50,
        successes: 20,
        mistakes: 0,
        ppm: 130,
        vef: 130,
        band: 'Avanzado'
      },
      {
        id: 'res-3',
        studentId: '2',
        studentName: 'Sofía Navarro Ortiz',
        testId: '1IF',
        testName: 'La Vaca',
        sectionId: 'sec-1',
        testDate: '2026-09-10',
        time: 75,
        successes: 14,
        mistakes: 3,
        ppm: 86,
        vef: 60,
        band: 'Requiere apoyo'
      }
    ]);
  });

  describe('FE-36: exportResultsToExcel', () => {
    it('exporta el conjunto filtrado con recuento de registros', async () => {
      const res = await exportResultsToExcel({ section_id: 'sec-1' });
      expect(res.success).toBe(true);
      expect(res.count).toBe(3);
      expect(res.filename).toContain('resultados_lectura');
    });

    it('lanza error cuando el conjunto filtrado está vacío (Escenario 4)', async () => {
      await expect(exportResultsToExcel({ section_id: 'sec-inexistente' }))
        .rejects.toThrow('No hay datos disponibles para los filtros seleccionados.');
    });
  });

  describe('FE-37: getStudentReport (Informe Individual)', () => {
    it('devuelve el informe con datos identificativos, centro y fecha de generación (Escenarios 1 y 3)', async () => {
      const report = await getStudentReport('1');

      expect(report.studentId).toBe('1');
      expect(report.studentName).toContain('Lucas');
      expect(report.centerName).toContain('Peñascal');
      expect(report.generationDate).toBeDefined();
      expect(report.tests).toHaveLength(2);
      expect(report.hasSufficientData).toBe(true); // Tiene 2 pruebas -> evolución suficiente
      expect(report.evolution).toHaveLength(2);
    });

    it('indica evolución insuficiente si el alumno tiene menos de 2 pruebas (Escenario 4)', async () => {
      const report = await getStudentReport('2');

      expect(report.studentId).toBe('2');
      expect(report.tests).toHaveLength(1);
      expect(report.hasSufficientData).toBe(false); // Solo 1 prueba
    });
  });

  describe('FE-38: getSectionGroupReport (Informe de Grupo)', () => {
    it('calcula medias, participantes y distribución por banda (Escenarios 1 y 2)', async () => {
      const report = await getSectionGroupReport('sec-1', '2024-2025');

      expect(report.hasData).toBe(true);
      expect(report.sectionId).toBe('sec-1');
      expect(report.participantsCount).toBe(2); // Alumnos 1 y 2
      expect(report.resultsCount).toBe(3); // 3 pruebas en total
      expect(report.meanPpm).toBeGreaterThan(0);
      expect(report.meanVef).toBeGreaterThan(0);

      // Distribución por banda con porcentajes
      expect(report.distribution).toBeDefined();
      expect(report.distribution.advanced.count).toBe(1);
      expect(report.distribution.normal.count).toBe(1);
      expect(report.distribution.support.count).toBe(1);
      expect(report.distribution.advanced.percent).toBe(33);

      // Progreso por recuento (Escenario 3)
      expect(report.progress.improvingCount).toBeDefined();
      expect(report.progress.improvingPercent).toBeDefined();
    });

    it('grupo sin datos indica ausencia y no calcula medias sobre cero (Escenario 4)', async () => {
      const report = await getSectionGroupReport('sec-vacia', '2024-2025');

      expect(report.hasData).toBe(false);
      expect(report.participantsCount).toBe(0);
      expect(report.resultsCount).toBe(0);
      expect(report.meanPpm).toBeNull();
      expect(report.meanVef).toBeNull();
      expect(report.distribution).toBeNull();
    });
  });
});
