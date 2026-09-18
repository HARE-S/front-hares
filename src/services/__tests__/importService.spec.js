import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadImport, confirmImport, downloadImportReport } from '../importService';
import * as api from '../api';

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    request: vi.fn(),
    ApiError: actual.ApiError,
    ForbiddenError: actual.ForbiddenError,
    UnauthorizedError: actual.UnauthorizedError,
  };
});

describe('importService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadImport', () => {
    it('envía un POST multipart con el fichero', async () => {
      const file = new File(['id,name\nA-001,Maria'], 'alumnado.csv', { type: 'text/csv' });
      const mockResponse = {
        token: 'tk-1',
        filename: 'alumnado.csv',
        preview: [{ student_id: 'A-001', student_name: 'Maria', sections: null, center: null }],
        total_rows: 1,
        errors: 0,
        error_details: [],
        allowed_extensions: ['.csv'],
        max_bytes: 10485760,
      };

      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await uploadImport(file);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/import/upload',
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      );

      const sentBody = fetchMock.mock.calls[0][1].body;
      expect(sentBody).toBeInstanceOf(FormData);
      expect(sentBody.get('file')).toBe(file);

      expect(result).toEqual(mockResponse);
    });

    it('lanza ApiError con status 400 si la extensión no es válida', async () => {
      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: 'Extensión no permitida. Extensiones válidas: .csv',
          }),
      });

      await expect(uploadImport(new File([''], 'data.txt'))).rejects.toThrow(
        'Extensión no permitida'
      );
      expect(fetchMock).toHaveBeenCalled();
    });

    it('lanza ForbiddenError si el usuario no es admin (403)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'ForbiddenError', message: 'Acceso denegado' }),
      });

      await expect(
        uploadImport(new File([''], 'al.csv'))
      ).rejects.toThrow();
    });
  });

  describe('confirmImport', () => {
    it('llama a request con POST /import/confirm y el token', async () => {
      const mockResult = {
        message: 'Importación completada',
        report_id: 'r-1',
        summary: { total: 5, processed: 5, errors: 0, students_created: 2, students_updated: 3 },
      };

      api.request.mockResolvedValue(mockResult);

      const result = await confirmImport('tk-1');

      expect(api.request).toHaveBeenCalledWith('/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'tk-1' }),
      });
      expect(result).toEqual(mockResult);
    });

    it('propaga errores del servidor (404 token caducado)', async () => {
      const error = new Error('El fichero subido no existe o ha caducado');
      api.request.mockRejectedValue(error);

      await expect(confirmImport('tk-unknown')).rejects.toThrow('El fichero subido no existe o ha caducado');
    });
  });

  describe('downloadImportReport', () => {
    it('devuelve el texto del CSV y el nombre del fichero', async () => {
      const csv = 'linea;columna;motivo\n4;seccion;La sección no existe';
      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(csv),
        headers: new Map([['Content-Disposition', 'attachment; filename="informe.csv"']]),
      });

      const result = await downloadImportReport();

      expect(fetchMock).toHaveBeenCalledWith('/api/v1/import/report', expect.objectContaining({ method: 'GET' }));
      expect(result.text).toBe(csv);
      expect(result.filename).toBe('informe.csv');
    });

    it('lanza error si no hay informe (404)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'No existe ningún informe de importación todavía' }),
      });

      await expect(downloadImportReport()).rejects.toThrow('No existe ningún informe');
    });

    it('usa nombre por defecto si no hay Content-Disposition', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('linea;col;motivo'),
        headers: new Map(),
      });

      const result = await downloadImportReport();
      expect(result.filename).toBe('informe_errores_importacion.csv');
    });
  });
});