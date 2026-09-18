/**
 * Mapeo de errores del servidor a errores de formulario (FE-12 / T-FE12-03).
 *
 * El backend Flask devuelve errores de campo en el cuerpo con la forma:
 *   { "error": "El alumno especificado no existe", "field": "student_id" }
 *   { "error": "NOT_FOUND", "message": "...", "field": "section_id" }
 *
 * El cliente `src/services/api.js` envuelve la respuesta HTTP en `ApiError`
 * ({ message, status, data }). Este módulo extrae el mensaje de cada campo y
 * lo traduce a las claves del formulario usando `fieldMap`.
 *
 * Convención de salida:
 *   { errors: { campoForm: "mensaje", ... }, global: "mensaje" | null }
 * - `errors` se posiciona junto a cada campo (Escenario 2).
 * - `global` es un mensaje general cuando no hay campo asociado.
 */

/**
 * Extrae pares `field -> mensaje` del cuerpo de la respuesta de error.
 * @param {Object|null} data — Cuerpo de la respuesta (ApiError.data)
 * @returns {Object<string,string>}
 */
export function extractFieldErrors(data) {
  if (!data || typeof data !== 'object') return {};

  const errors = {};

  if (data.field) {
    const msg = data.message || data.detail || data.error || 'Solicitud inválida.';
    errors[data.field] = msg;
  }

  // Lote con errores por fila (BE-22) / detalle estructurado
  if (Array.isArray(data.errors)) {
    for (const row of data.errors) {
      if (row && typeof row === 'object' && row.field) {
        const msg = row.message || row.error || 'Valor inválido.';
        errors[row.field] = msg;
      }
    }
  }

  return errors;
}

/**
 * Traduce los errores de campo del servidor a las claves del formulario
 * y separa los globales (mensajes sin campo).
 *
 * @param {Error} err — Error capturado (suele ser ApiError)
 * @param {Object<string,string>} [fieldMap] — backendField -> formField
 * @returns {{ errors: Object<string,string>, global: string|null }}
 */
export function mapServerErrors(err, fieldMap = {}) {
  const data = (err && typeof err === 'object' && err.data) || null;
  const serverErrors = extractFieldErrors(data);
  const errors = {};
  let global = null;

  for (const [backendField, message] of Object.entries(serverErrors)) {
    const formField = fieldMap[backendField] || backendField;
    errors[formField] = message;
  }

  // Cualquier otro mensaje razonable se convierte en error global si no
  // había un campo concreto (p. ej. error de red o de autorización).
  // Preferimos el cuerpo de la respuesta; err.message ya pudo derivarse
  // de él en api.js.
  const fallbackMessage =
    (data && (data.error || data.message)) ||
    (err && err.message) ||
    null;

  if (fallbackMessage && Object.keys(errors).length === 0) {
    global = fallbackMessage;
  }

  return { errors, global };
}

/**
 * ¿El error trae información de campo del formulario?
 * Útil para que la vista decida si mostrar el bloque global también.
 * @param {Error} err
 * @returns {boolean}
 */
export function hasFieldErrors(err) {
  return Object.keys(extractFieldErrors(err && err.data)).length > 0;
}