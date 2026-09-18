/**
 * Utilidades de formato para HARE-S (Contrato 4 - Yeremi).
 * Funciones puras de JavaScript para formateo y cálculo de métricas pedagógicas.
 */

/**
 * Formatea un valor de Palabras Por Minuto (PPM).
 * @param {number|null|undefined} val
 * @returns {string}
 */
export function formatPPM(val) {
  if (val === null || val === undefined || isNaN(val) || val === '') return '-';
  const num = Number(val);
  return Math.round(num).toString();
}

/**
 * Formatea la Velocidad Eficaz (Vef).
 * @param {number|null|undefined} val
 * @returns {string}
 */
export function formatVef(val) {
  if (val === null || val === undefined || isNaN(val) || val === '') return '-';
  const num = Number(val);
  return Math.round(num).toString();
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD o ISO string) a formato visible (DD/MM/YYYY).
 * @param {string|Date|null|undefined} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(isoString);
  }
}

/**
 * Formatea un porcentaje numérico.
 * @param {number|null|undefined} val
 * @returns {string}
 */
export function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val) || val === '') return '-';
  const num = Number(val);
  return `${Math.round(num)}%`;
}

/**
 * Convierte segundos a formato de visualización mm:ss.
 * @param {number|string} totalSeconds
 * @returns {string}
 */
export function formatSecondsToMMSS(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) return '00:00';
  const sec = Math.max(0, Math.round(Number(totalSeconds)));
  const mins = Math.floor(sec / 60);
  const remSecs = sec % 60;
  return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
}

/**
 * Convierte una cadena de tiempo (mm:ss o segundos directos) a segundos enteros.
 * @param {string|number} strOrNum
 * @returns {number}
 */
export function formatMMSSToSeconds(strOrNum) {
  if (strOrNum === null || strOrNum === undefined) return 0;
  if (typeof strOrNum === 'number') return Math.max(0, Math.round(strOrNum));
  const s = String(strOrNum).trim();
  if (!s) return 0;

  if (s.includes(':')) {
    const parts = s.split(':');
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return Math.max(0, mins * 60 + secs);
  }

  const parsed = parseInt(s, 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Calcula Palabras Por Minuto (PPM) a partir del total de palabras y tiempo en segundos.
 * Regla: (palabras * 60) / segundos
 * @param {number} totalWords
 * @param {number} seconds
 * @returns {number}
 */
export function calculatePPM(totalWords, seconds) {
  if (!totalWords || !seconds || seconds <= 0) return 0;
  return Math.round((Number(totalWords) * 60) / Number(seconds));
}

/**
 * Calcula la Velocidad Eficaz (Vef) a partir de PPM y aciertos de comprensión.
 * Regla de Peñascal: PPM * (aciertos / preguntasTotales)
 * Si preguntasTotales no se especifica, se asume 20 o número de preguntas de la prueba.
 * @param {number} ppm
 * @param {number} hits
 * @param {number} totalQuestions
 * @returns {number}
 */
export function calculateVef(ppm, hits, totalQuestions = 20) {
  if (!ppm || ppm <= 0 || hits === null || hits === undefined || hits < 0) return 0;
  const questions = totalQuestions > 0 ? totalQuestions : 20;
  const ratio = Math.min(1, Math.max(0, Number(hits) / questions));
  return Math.round(Number(ppm) * ratio);
}

/**
 * Determina la banda de nivel lector Peñascal según la velocidad eficaz y el curso.
 * Criterio pedagógico Peñascal:
 * - Alto / Avanzado: Vef >= 110 (según ciclo)
 * - En nivel: 85 <= Vef < 110
 * - Requiere apoyo / Bajo: Vef < 85
 * @param {number} vef
 * @returns {'Avanzado'|'En nivel'|'Requiere apoyo'|'Sin datos'}
 */
export function getReadingBand(vef) {
  if (vef === null || vef === undefined || isNaN(vef) || vef <= 0) return 'Sin datos';
  if (vef >= 110) return 'Avanzado';
  if (vef >= 85) return 'En nivel';
  return 'Requiere apoyo';
}
