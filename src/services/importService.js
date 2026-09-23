import { request, ApiError, ForbiddenError, UnauthorizedError } from './api';

/** @typedef {Object} ImportPreviewRow — Fila interpretada del CSV (BE-09)
 * @property {string} student_id — Identificador del alumno en Alexia
 * @property {string} student_name — Nombre completo tal como viene en el fichero
 * @property {string[]|null} sections — Secciones asignadas
 * @property {string|null} center — Centro asignado
 */

/** @typedef {Object} UploadPreviewResponse — Respuesta de previsualización (BE-09)
 * @property {string} token — Token de la subida (necesario para confirmar)
 * @property {string} filename — Nombre del fichero subido
 * @property {ImportPreviewRow[]} preview — Primeras filas interpretadas (máx. 5)
 * @property {number} total_rows — Total de filas del fichero
 * @property {number} errors — Número de filas con error
 * @property {Object[]} error_details — Primeros errores { line, column, reason }
 * @property {string[]} allowed_extensions — Extensiones admitidas
 * @property {number} max_bytes — Tamaño máximo permitido
 */

/** @typedef {Object} ImportSummary — Resumen de la importación (BE-09 Escenario 2)
 * @property {number} total — Total de filas procesadas
 * @property {number} processed — Filas válidas procesadas
 * @property {number} errors — Filas rechazadas
 * @property {number} students_created — Alumnos creados
 * @property {number} students_updated — Alumnos actualizados
 */

/** @typedef {Object} ConfirmImportResponse — Confirmación de importación (BE-09)
 * @property {string} message — Mensaje de éxito
 * @property {string|null} report_id — ID del informe de errores generado
 * @property {ImportSummary} summary — Resumen de ejecución
 */

/**
 * Sube el CSV de Alexia y devuelve su previsualización (BE-09, Escenario 1).
 * NO escribe en la base de datos; solo interpreta el fichero.
 *
 * Nota: este endpoint va en `multipart/form-data`, así que NO puede pasar por
 * `request()` (que fuerza `Content-Type: application/json`). El `fetch` queda
 * dentro de `services/` según la regla del reparto; `api.js` no se toca.
 * @param {File} file — Fichero CSV seleccionado por el administrador
 * @returns {Promise<UploadPreviewResponse>}
 */
export async function uploadImport(file) {
  const body = new FormData();
  body.append('file', file);

  const headers = {};
  try {
    const token = typeof localStorage !== 'undefined' ? (sessionStorage.getItem('access_token') || localStorage.getItem('access_token')) : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {}

  const res = await fetch('/api/v1/import/upload', {
    method: 'POST',
    body,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw payloadError(data, res.status);
  }

  return data;
}

/**
 * Confirma la importación del fichero previamente subido (BE-09, Escenario 2).
 * Ejecuta el mismo importador que el CLI y devuelve el resumen.
 * @param {string} token — Token devuelto por uploadImport
 * @returns {Promise<ConfirmImportResponse>}
 */
export async function confirmImport(token) {
  return request('/import/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

/**
 * Descarga el informe de errores CSV de la última importación (BE-08).
 * Devuelve el texto del CSV y el nombre sugerido del fichero.
 *
 * Nota: el endpoint responde `text/csv`, no JSON, por eso no pasa por
 * `request()` (que llama a `res.json()`). El `fetch` queda dentro de
 * `services/`; `api.js` no se toca.
 * @returns {Promise<{ text: string, filename: string }>}
 */
export async function downloadImportReport() {
  const headers = {};
  try {
    const token = typeof localStorage !== 'undefined' ? (sessionStorage.getItem('access_token') || localStorage.getItem('access_token')) : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {}

  const res = await fetch('/api/v1/import/report', {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw payloadError(data, res.status);
  }

  const text = await res.text();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match ? match[1] : 'informe_errores_importacion.csv';

  return { text, filename };
}

/**
 * Convierte la respuesta de error del backend en la excepción adecuada:
 * 401 -> UnauthorizedError, 403 -> ForbiddenError, el resto -> ApiError.
 * @param {Object|null} data — Cuerpo de la respuesta
 * @param {number} status — Código HTTP
 */
function payloadError(data, status) {
  const message =
    data?.error || data?.message || `Error ${status}: ${statusTextFor(status)}`;

  if (status === 401) {
    return new UnauthorizedError(message, data);
  }
  if (status === 403) {
    return new ForbiddenError(message, data);
  }
  return new ApiError(message, status, data);
}

function statusTextFor(status) {
  return {
    400: 'Solicitud inválida',
    401: 'No autenticado',
    403: 'No autorizado',
    404: 'No encontrado',
    500: 'Error del servidor',
  }[status] || 'Error del servidor';
}