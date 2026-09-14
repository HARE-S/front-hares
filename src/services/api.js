/**
 * Cliente HTTP para comunicación con el backend Flask de HARE-S.
 * Conecta automáticamente a través del proxy de Vite (/api) hacia http://localhost:5000/api.
 */

const BASE_URL = '/api/v1';

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'X-User-Role': 'coordinator', // Requerido por el decorador de roles de desarrollo
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);

    // 204 No Content (por ejemplo, tras DELETE)
    if (res.status === 204) {
      return null;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || `Error ${res.status}: ${res.statusText}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    // Error de conexión o red
    const netErr = new Error('No se pudo conectar con el servidor backend (asegúrate de que está activo en el puerto 5000).');
    netErr.status = 0;
    throw netErr;
  }
}
