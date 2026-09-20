import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/services/api';
import {
  getStudentRecord,
  getStudentEvolution,
  getStudentDifferences,
  searchStudents
} from '@/services/studentService';

vi.mock('@/services/api', () => ({
  request: vi.fn()
}));

describe('studentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudentRecord', () => {
    it('debe hacer una petición GET a /students/{studentId}', async () => {
      const studentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockData = {
        id: studentId,
        name: 'Juan Pérez',
        grade: '3º Primaria',
        section: 'Aula 3A',
        stats: { averagePPM: 180 }
      };

      api.request.mockResolvedValue(mockData);

      const result = await getStudentRecord(studentId);

      expect(api.request).toHaveBeenCalledWith(`/students/${studentId}`);
      expect(result).toEqual(mockData);
    });

    it('debe propagar errores del servidor', async () => {
      const studentId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new Error('Not found');

      api.request.mockRejectedValue(error);

      await expect(getStudentRecord(studentId)).rejects.toThrow('Not found');
    });
  });

  describe('getStudentEvolution', () => {
    it('debe hacer una petición sin parámetros si no hay opciones', async () => {
      const studentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockData = { evolution: [] };

      api.request.mockResolvedValue(mockData);

      await getStudentEvolution(studentId);

      expect(api.request).toHaveBeenCalledWith(`/students/${studentId}/evolution`);
    });

    it('debe agregar start_date al query string si se proporciona', async () => {
      const studentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockData = { evolution: [] };

      api.request.mockResolvedValue(mockData);

      await getStudentEvolution(studentId, { startDate: '2025-01-01' });

      expect(api.request).toHaveBeenCalledWith(
        `/students/${studentId}/evolution?start_date=2025-01-01`
      );
    });

    it('debe agregar end_date al query string si se proporciona', async () => {
      const studentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockData = { evolution: [] };

      api.request.mockResolvedValue(mockData);

      await getStudentEvolution(studentId, { endDate: '2025-12-31' });

      expect(api.request).toHaveBeenCalledWith(
        `/students/${studentId}/evolution?end_date=2025-12-31`
      );
    });

    it('debe agregar ambas fechas al query string', async () => {
      const studentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockData = { evolution: [] };

      api.request.mockResolvedValue(mockData);

      await getStudentEvolution(studentId, { startDate: '2025-01-01', endDate: '2025-12-31' });

      expect(api.request).toHaveBeenCalledWith(
        `/students/${studentId}/evolution?start_date=2025-01-01&end_date=2025-12-31`
      );
    });
  });

  describe('getStudentDifferences', () => {
    it('debe hacer una petición GET a /students/{studentId}/differences', async () => {
      const studentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockData = {
        functional: ['Decodificación fonética lenta'],
        literary: ['Comprensión inferencial débil']
      };

      api.request.mockResolvedValue(mockData);

      const result = await getStudentDifferences(studentId);

      expect(api.request).toHaveBeenCalledWith(`/students/${studentId}/differences`);
      expect(result).toEqual(mockData);
    });

    it('debe retornar arrays vacíos si no hay diferencias', async () => {
      const studentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockData = { functional: [], literary: [] };

      api.request.mockResolvedValue(mockData);

      const result = await getStudentDifferences(studentId);

      expect(result.functional).toEqual([]);
      expect(result.literary).toEqual([]);
    });
  });

  describe('searchStudents', () => {
    it('debe llamar a /students/search con q, page y limit', async () => {
      const mockData = { items: [], total: 0, page: 1, limit: 10, pages: 1 };
      api.request.mockResolvedValue(mockData);

      const result = await searchStudents({ q: 'maria', page: 2, limit: 5 });

      expect(api.request).toHaveBeenCalledWith(
        '/students/search?q=maria&page=2&limit=5'
      );
      expect(result).toEqual(mockData);
    });

    it('debe aplicar valores por defecto si no se pasan opciones', async () => {
      api.request.mockResolvedValue({ items: [] });

      await searchStudents({ q: 'iker' });

      expect(api.request).toHaveBeenCalledWith(
        '/students/search?q=iker&page=1&limit=10'
      );
    });

    it('debe propagar errores del servidor', async () => {
      const error = new Error('Forbidden');
      error.status = 403;
      api.request.mockRejectedValue(error);

      await expect(searchStudents({ q: 'maria' })).rejects.toThrow('Forbidden');
    });
  });
});
