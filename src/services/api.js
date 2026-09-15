/**
 * Cliente HTTP centralizado de HARE-S (FE-03).
 *
 * Único punto de contacto con la API. Todo acceso a datos pasa por
 * `services/*` a través de esta función; nunca hay un `fetch` suelto
 * en un componente.
 *
 * Contrato:
 *  - Base relativa `/api/v1` (mismo origen tras el proxy, sin CORS).
 *  - La sesión viaja en una cookie HttpOnly, por eso toda petición
 *    usa `credentials: 'include'`.
 *  - `401` (no sé quién eres) redirige al login conservando la ruta.
 *  - `403` (sé quién eres y no puedes) lanza `ForbiddenError` y NO
 *    redirige: evita el bucle de login.
 *  - `204` devuelve `null` sin intentar parsear un cuerpo vacío.
 *  - Errores con forma estable `ApiError { status, message, field, data }`.
 */

const BASE_URL = '/api/v1';

/**
 * Cabecera temporal mientras no exista la sesión de servidor (BE-40).
 * La exige el bypass de roles de desarrollo del backend. Debe eliminarse
 * en cuanto la cookie de sesión llegue a producción (tarea T-FE03-05,
 * Bloqueado). NO añadir más cabeceras controladas por el cliente aquí.
 */
const DEV_ROLE_HEADER = { 'X-User-Role': 'coordinator' };

/**
 * Error de API con forma estable para que la interfaz pueda mostrarlo
 * sin adivinar: código HTTP, mensaje legible y campo afectado.
 */
export class ApiError extends Error {
  /**
   * @param {number} status  Código HTTP de la respuesta.
   * @param {string} message Mensaje legible para la interfaz.
   * @param {*} data         Cuerpo completo de la respuesta, si lo hubo.
   * @param {string|null} field Campo afectado en errores 400/422.
   */
  constructor(status, message, data = null, field = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.field = field;
  }
}

/**
 * 401: no hay sesión o ha caducado. La interfaz debe llevar al login.
 */
export class UnauthorizedError extends ApiError {
  constructor(data = null) {
    super(401, 'Tu sesión no es válida o ha caducado.', data);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403: hay sesión pero faltan permisos. NO debe redirigir al login.
 */
export class ForbiddenError extends ApiError {
  constructor(data = null) {
    super(403, 'No tienes permiso para realizar esta acción.', data);
    this.name = 'ForbiddenError';
  }
}

/**
 * Redirige al login indicando el motivo y la ruta que se pedía, para que
 * tras entrar se pueda recuperar (FE-05, escenario 4).
 *
 * Se usa `window.location` (recarga completa) y no el router de Vue para
 * evitar un import circular `api.js <-> router/index.js`.
 */
export function redirectToLogin() {
  const next = encodeURIComponent(window.location.href);
  window.location.assign(`/login?reason=expired&next=${next}`);
}

/**
 * Extrae `message` y `field` de un cuerpo de error del backend.
 *
 * Formas aceptadas (contrato FE-03):
 *  - `{ message: string, field?: string }`
 *  - `{ error: { message: string, field?: string } }`
 *  - `{ errors: { "<campo>": "<motivo>" } }` (estilo Flask)
 */
export function parseApiError(response, data) {
  const raw = data?.error && typeof data.error === 'object' ? data.error : data;

  let message = raw?.message ?? raw?.error ?? data?.message ?? `Error ${response.status}`;
  if (typeof message !== 'string') message = 'Error inesperado del servidor.';

  let field = raw?.field ?? null;

  if (field === null && data?.errors && typeof data.errors === 'object') {
    const fields = Object.keys(data.errors);
    if (fields.length === 1) {
      field = fields[0];
      const detail = data.errors[fields[0]];
      if (typeof detail === 'string' || typeof detail === 'number') {
        message = String(detail);
      }
    }
  }

  return { status: response.status, message, field, data };
}

/**
 * Petición a la API. Todas las llamadas de la aplicación pasan por aquí.
 *
 * @param {string} endpoint Ruta relativa a `/api/v1`, p.ej. `/students/1`.
 * @param {RequestInit} [options] Opciones de fetch; las cabeceras aquí
 *   definidas son las que importan y se preservan.
 * @returns {Promise<*>} Cuerpo parseado, o `null` si es un `204`.
 * @throws {UnauthorizedError} Cuando el backend responde `401`.
 * @throws {ForbiddenError} Cuando el backend responde `403`.
 * @throws {ApiError} Para el resto de respuestas con error.
 */
export async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...DEV_ROLE_HEADER,
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    });
  } catch (cause) {
    const netError = new ApiError(
      0,
      'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
      null,
      null
    );
    throw Object.assign(netError, { cause });
  }

  if (response.status === 401) {
    redirectToLogin();
    throw new UnauthorizedError();
  }

  if (response.status === 403) {
    throw new ForbiddenError();
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const { status, message, field } = parseApiError(response, data);
    throw new ApiError(status, message, data, field);
  }

  return data;
}