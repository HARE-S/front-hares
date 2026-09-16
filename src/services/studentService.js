import { request } from './api';

/**
 * @typedef {Object} StudentRecord
 * @property {string} id — ID del alumno
 * @property {string} name — Nombre completo
 * @property {string} grade — Grado actual
 * @property {string} section — Sección actual
 * @property {Object[]} currentSections — Secciones actuales { id, name, teacher }
 * @property {Object[]} historicSections — Secciones anteriores { id, name, teacher, year }
 * @property {Object[]} tests — Histórico de pruebas con { id, date, name, speedSpontaneous, comprehension, effectiveSpeed, band, variance }
 * @property {Object[]} books — Libros leídos { id, title, author, readDate, status }
 * @property {Object} stats — Estadísticas { averagePPM, maxPPM, minPPM, completedTests, totalBooks }
 */

/**
 * Obtener ficha completa de un alumno.
 * Incluye datos personales, histórico de pruebas y lecturas en una sola petición.
 * @param {string} studentId — UUID del alumno
 * @returns {Promise<StudentRecord>}
 */
export async function getStudentRecord(studentId) {
  const response = await request(`/students/${studentId}/record`);
  return response;
}

/**
 * Obtener evolución de un alumno con variaciones.
 * @param {string} studentId — UUID del alumno
 * @param {Object} options — Opciones de filtrado
 * @param {string} options.startDate — ISO 8601 date
 * @param {string} options.endDate — ISO 8601 date
 * @returns {Promise<Object>}
 */
export async function getStudentEvolution(studentId, options = {}) {
  const params = new URLSearchParams();
  if (options.startDate) params.append('start_date', options.startDate);
  if (options.endDate) params.append('end_date', options.endDate);

  const queryStr = params.toString();
  const endpoint = queryStr ? `/students/${studentId}/evolution?${queryStr}` : `/students/${studentId}/evolution`;

  return request(endpoint);
}

/**
 * Obtener diferencias funcional/literario de un alumno.
 * @param {string} studentId — UUID del alumno
 * @returns {Promise<Object>} { functional: [], literary: [] }
 */
export async function getStudentDifferences(studentId) {
  return request(`/students/${studentId}/differences`);
}
