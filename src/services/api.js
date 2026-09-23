/**
 * Cliente HTTP para comunicación con el backend Flask de HARE-S.
 * Conecta automáticamente a través del proxy de Vite (/api) hacia http://localhost:5000/api.
 *
 * Reglas:
 * - credentials: 'include' → mantiene cookies HttpOnly (sesiones OIDC)
 * - 204 No Content devuelve null
 * - 401 redirige a login (sin lanzar error)
 * - 403 lanza ForbiddenError sin redirigir
 */

const BASE_URL = '/api/v1';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ForbiddenError extends ApiError {
  constructor(message, data) {
    super(message, 403, data);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message, data) {
    super(message, 401, data);
    this.name = 'UnauthorizedError';
  }
}

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  let token = null;
  try {
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        const stored = sessionStorage.getItem('__hares_session_dev__');
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed.access_token || parsed.token;
        }
      }
    }
  } catch {
    // ignore
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    credentials: 'include',
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);

    // 204 No Content
    if (res.status === 204) {
      return null;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || `Error ${res.status}: ${res.statusText}`;

      if (res.status === 401) {
        throw new UnauthorizedError(errorMsg, data);
      }

      if (res.status === 403) {
        throw new ForbiddenError(errorMsg, data);
      }

      const err = new ApiError(errorMsg, res.status, data);
      throw err;
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // Error de conexión o red
    const netErr = new ApiError(
      'No se pudo conectar con el servidor backend. Verifica que está activo en el puerto 5000.',
      0,
      null
    );
    throw netErr;
  }
}
