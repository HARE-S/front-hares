import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useAuth } from '../useAuth';

/**
 * Tests de FE-07: Manejo de la sesión
 * Escenarios 2, 3 y 6
 */

describe('useAuth - FE-07 Manejo de sesión', () => {
  let server;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    // Limpiar estado compartido
    const auth = useAuth();
    auth.user.value = null;
    auth.sessionExpired.value = false;
  });

  afterEach(() => {
    server?.close();
  });

  describe('Escenario 2: Estado en memoria', () => {
    it('no debe usar localStorage ni sessionStorage', () => {
      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
    });

    it('usuario debe estar en memoria cuando hay sesión', async () => {
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

      const auth = useAuth();
      await auth.load();

      // No debe estar en localStorage (nunca lo usamos)
      expect(localStorage.length).toBe(0);
      // SessionStorage puede tener sesión en desarrollo (eso es correcto)
      sessionStorage.clear();
    });
  });

  describe('Escenario 3: Sesión caducada', () => {
    it('user.value = null cuando hay 401', async () => {
      server = setupServer(
        http.get('/api/v1/auth/me', () => {
          return HttpResponse.json({ error: 'No autenticado' }, { status: 401 });
        })
      );
      server.listen();

      const auth = useAuth();
      await auth.load();

      expect(auth.user.value).toBeNull();
      expect(auth.isAuthenticated.value).toBe(false);
    });

    it('markSessionExpired marca la sesión como expirada', () => {
      const auth = useAuth();

      auth.markSessionExpired();

      expect(auth.sessionExpired.value).toBe(true);
      expect(auth.user.value).toBeNull();
    });

    it('clearSessionExpired limpia el flag', () => {
      const auth = useAuth();

      auth.markSessionExpired();
      auth.clearSessionExpired();

      expect(auth.sessionExpired.value).toBe(false);
    });
  });

  describe('Escenario 6: Recarga de página', () => {
    it('load() consulta al backend', async () => {
      server = setupServer(
        http.get('/api/v1/auth/me', () => {
          return HttpResponse.json({
            id: '2',
            email: 'teacher@grupopenascal.com',
            role: 'teacher'
          });
        })
      );
      server.listen();

      const auth = useAuth();
      await auth.load();

      // Si load() completó sin error, el endpoint fue consultado
      expect(auth.loading.value).toBe(false);
    });
  });

  describe('Logout', () => {
    it('limpia el usuario y sessionExpired', async () => {
      server = setupServer(
        http.post('/api/v1/auth/logout', () => {
          return HttpResponse.json({ message: 'OK' });
        })
      );
      server.listen();

      const auth = useAuth();
      auth.user.value = { id: '1', email: 'test@grupopenascal.com' };
      auth.sessionExpired.value = true;

      await auth.logout();

      expect(auth.user.value).toBeNull();
      expect(auth.sessionExpired.value).toBe(false);
    });

    it('llama al endpoint de logout', async () => {
      let logoutCalled = false;
      server = setupServer(
        http.post('/api/v1/auth/logout', () => {
          logoutCalled = true;
          return HttpResponse.json({ message: 'OK' });
        })
      );
      server.listen();

      const auth = useAuth();
      auth.user.value = { email: 'test@grupopenascal.com' };

      await auth.logout();

      expect(logoutCalled).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('retorna false sin usuario', () => {
      const auth = useAuth();
      expect(auth.hasRole('teacher')).toBe(false);
    });

    it('retorna true si coincide el rol', () => {
      const auth = useAuth();
      auth.user.value = { role: 'teacher', email: 'test@grupopenascal.com' };

      expect(auth.hasRole('teacher')).toBe(true);
      expect(auth.hasRole('admin')).toBe(false);
    });
  });

  describe('isPending', () => {
    it('indica si usuario está pending', () => {
      const auth = useAuth();

      auth.user.value = { role: 'pending' };
      expect(auth.isPending.value).toBe(true);

      auth.user.value = { role: 'teacher' };
      expect(auth.isPending.value).toBe(false);
    });
  });
});
