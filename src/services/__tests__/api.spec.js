import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { request, UnauthorizedError, ForbiddenError, ApiError } from '../api';

/**
 * Tests de FE-07: Manejo de errores 401 y 403
 * Verifica que el cliente HTTP lance las excepciones correctas
 */

describe('api.js - Manejo de respuestas', () => {
  let server;

  afterEach(() => {
    server?.close();
  });

  describe('401 Unauthorized', () => {
    it('debe lanzar UnauthorizedError en 401', async () => {
      server = setupServer(
        http.get('/api/v1/protected', () => {
          return HttpResponse.json(
            { error: 'No autenticado' },
            { status: 401 }
          );
        })
      );
      server.listen();

      try {
        await request('/protected');
        expect.fail('Debería lanzar UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.status).toBe(401);
      }
    });

    it('debe incluir datos de error en UnauthorizedError', async () => {
      server = setupServer(
        http.get('/api/v1/auth/me', () => {
          return HttpResponse.json(
            { error: 'Sesión expirada', code: 'SESSION_EXPIRED' },
            { status: 401 }
          );
        })
      );
      server.listen();

      try {
        await request('/auth/me');
        expect.fail('Debería lanzar UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.data.code).toBe('SESSION_EXPIRED');
      }
    });
  });

  describe('403 Forbidden', () => {
    it('debe lanzar ForbiddenError en 403', async () => {
      server = setupServer(
        http.get('/api/v1/admin', () => {
          return HttpResponse.json(
            { error: 'Permiso insuficiente' },
            { status: 403 }
          );
        })
      );
      server.listen();

      try {
        await request('/admin');
        expect.fail('Debería lanzar ForbiddenError');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenError);
        expect(err.status).toBe(403);
      }
    });
  });

  describe('Respuestas exitosas', () => {
    it('debe retornar datos en 200 OK', async () => {
      server = setupServer(
        http.get('/api/v1/auth/me', () => {
          return HttpResponse.json({
            id: '1',
            email: 'test@grupopenascal.com',
            role: 'teacher'
          });
        })
      );
      server.listen();

      const result = await request('/auth/me');
      expect(result).toEqual({
        id: '1',
        email: 'test@grupopenascal.com',
        role: 'teacher'
      });
    });

    it('debe retornar null en 204 No Content', async () => {
      server = setupServer(
        http.post('/api/v1/logout', () => {
          return new HttpResponse(null, { status: 204 });
        })
      );
      server.listen();

      const result = await request('/logout', { method: 'POST' });
      expect(result).toBeNull();
    });
  });

  describe('Content-Type header', () => {
    it('debe incluir Content-Type: application/json por defecto', async () => {
      let capturedHeaders;
      server = setupServer(
        http.post('/api/v1/auth/login', ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({ success: true });
        })
      );
      server.listen();

      await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@grupopenascal.com' })
      });

      expect(capturedHeaders.get('Content-Type')).toBe('application/json');
    });
  });
});
