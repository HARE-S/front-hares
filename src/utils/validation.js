/**
 * Utilidades de validación en cliente (FE-12 / Contrato 4).
 *
 * Funciones puras, sin estado y reutilizables por cualquier formulario.
 * Convención: devuelven `null` cuando el valor es válido y un mensaje
 * de error cuando no lo es; así el componente solo pinta `error` cuando
 * existe.
 */

/**
 * Valida que un valor obligatorio no esté vacío.
 * @param {*} val — Valor a comprobar (string, number, array, objeto…)
 * @returns {string|null} — Mensaje de error o null si es válido.
 */
export function validateRequired(val) {
  if (val === null || val === undefined) {
    return 'Este campo es obligatorio.';
  }
  if (typeof val === 'string' && val.trim() === '') {
    return 'Este campo es obligatorio.';
  }
  if (Array.isArray(val) && val.length === 0) {
    return 'Este campo es obligatorio.';
  }
  return null;
}

/**
 * Valida que un número esté dentro de un rango [min, max] inclusivo.
 * @param {number|string} val — Valor a comprobar
 * @param {number} min — Límite inferior inclusivo
 * @param {number} max — Límite superior inclusivo
 * @param {string} [label='Valor'] — Nombre del campo para el mensaje
 * @returns {string|null} — Mensaje de error o null si es válido.
 */
export function validateRange(val, min, max, label = 'Valor') {
  if (typeof val === 'string' && val.trim() === '') {
    return `${label} debe ser un número.`;
  }
  const numeric = typeof val === 'string' ? Number(val) : val;
  if (numeric === null || numeric === undefined || Number.isNaN(numeric)) {
    return `${label} debe ser un número.`;
  }
  if (numeric < min || numeric > max) {
    return `${label} debe estar entre ${min} y ${max}.`;
  }
  return null;
}

/**
 * Valida un resultado de prueba de lectura (FE-12, Escenario 4).
 *
 * Reglas:
 *  - `time`, `successes` y `mistakes` no pueden ser negativos.
 *  - `successes + mistakes` no puede superar 20 (batería de principios).
 *
 * @param {Object} result — { time, successes, mistakes }
 * @returns {Object<string,string>} — Mapa campo → mensaje (solo los que fallan)
 */
export function validateReadingResult({ time, successes, mistakes } = {}) {
  const errors = {};

  const timeError = validateRange(time, 0, Number.MAX_SAFE_INTEGER, 'Tiempo');
  if (timeError) errors.time = timeError;

  const okErr = validateRange(successes, 0, Number.MAX_SAFE_INTEGER, 'Aciertos');
  if (okErr) errors.successes = okErr;

  const mistakesErr = validateRange(mistakes, 0, Number.MAX_SAFE_INTEGER, 'Errores');
  if (mistakesErr) errors.mistakes = mistakesErr;

  const successesNum = Number(successes);
  const mistakesNum = Number(mistakes);
  if (
    !Number.isNaN(successesNum) &&
    !Number.isNaN(mistakesNum) &&
    successesNum + mistakesNum > 20
  ) {
    errors.sum = 'La suma de aciertos y errores no puede superar 20.';
  }

  return errors;
}

/**
 * Detectar un tiempo de lectura "sospechoso" (FE-12, Escenario 5).
 *
 * Es un AVISO, no un bloqueo: una velocidad extremadamente alta casi
 * siempre indica que se introdujo el tiempo en minutos en lugar de
 * segundos (caso real: 5 s para 872 palabras → ~174 palabras/s).
 *
 * @param {number|string} seconds — Tiempo de lectura en segundos
 * @param {number|string} [words] — Número de palabras del texto (opcional)
 * @param {Object} [opts] — Umbral configurable
 * @param {number} [opts.maxWordsPerSecond=120] — Velocidad límite (p/s)
 * @returns {boolean} — true si el valor parece fuera de rango
 */
export function isPlausibleReadingTime(seconds, words, opts = {}) {
  const maxWordsPerSecond = opts.maxWordsPerSecond ?? 120;
  const sec = Number(seconds);
  const pal = Number(words);

  if (Number.isNaN(sec)) return false;
  if (sec <= 0) return false;

  // Sin palabras no hay forma de juzgar la velocidad: no se marca aviso.
  if (Number.isNaN(pal) || pal <= 0) return false;

  return pal / sec > maxWordsPerSecond;
}