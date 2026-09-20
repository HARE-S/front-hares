import { request } from './api';

/**
 * @typedef {Object} StudentSection
 * @property {string} id — ID de la sección
 * @property {string|null} center_id — ID del centro
 * @property {string|null} external_id — ID externo (Alexia)
 * @property {string} name — Nombre de la sección
 * @property {string|null} academic_year — Curso académico
 * @property {string|null} enrollment_date — Fecha de matrícula (ISO)
 *
 * @typedef {Object} StudentResult
 * @property {string} id — ID del resultado
 * @property {string|null} test_date — Fecha de la prueba (ISO)
 * @property {string|null} test_name — Nombre de la prueba
 * @property {number} ppm — Velocidad espontánea (palabras por minuto)
 * @property {number} comprehension — Comprensión lectora (%)
 * @property {number} accuracy — Aciertos (%)
 * @property {number} vef — Velocidad eficaz
 *
 * @typedef {Object} StudentReading
 * @property {string} id — ID de la lectura
 * @property {string|null} book_title — Título del libro
 * @property {string|null} level — Nivel del libro
 * @property {string|null} start_date — Fecha de inicio (ISO)
 * @property {string|null} end_date — Fecha de fin (ISO), null si en curso
 * @property {'finalizada'|'en curso'} status — Estado de la lectura
 *
 * @typedef {Object} StudentRecord
 * @property {string} id — ID del alumno
 * @property {string|null} external_id — ID externo (Alexia)
 * @property {string} name — Nombre completo
 * @property {string|null} birth_date — Fecha de nacimiento (ISO)
 * @property {number|null} age — Edad calculada
 * @property {string|null} gender — Género (no presente en volcado Alexia)
 * @property {string|null} academic_status — Situación académica
 * @property {string|null} sector — Sector
 * @property {StudentSection[]} current_sections — Secciones actuales
 * @property {StudentSection[]} historical_sections — Secciones anteriores
 * @property {Object} sections — { current, historical } (alias)
 * @property {StudentResult[]} results — Histórico de pruebas con métricas
 * @property {StudentReading[]} readings — Lecturas con estado
 * @property {number} total_results — Número de pruebas
 * @property {number} total_readings — Número de lecturas
 */

/**
 * Obtener ficha completa de un alumno.
 * Incluye datos personales, secciones y lecturas en una sola petición (BE-28).
 * @param {string} studentId — UUID del alumno
 * @returns {Promise<StudentRecord>}
 */
export async function getStudentRecord(studentId) {
  const response = await request(`/students/${studentId}`);
  return response;
}

/**
 * Buscar alumnos por fragmento de nombre (BE-29).
 * Búsqueda insensible a mayúsculas y acentos; cada resultado incluye sus
 * secciones activas con centro (para navegar a la ficha, FE-27).
 * @param {Object} options — Parámetros de búsqueda
 * @param {string} options.q — Fragmento de nombre (mínimo 2 caracteres en UI)
 * @param {number} [options.page=1] — Página
 * @param {number} [options.limit=10] — Tamaño de página
 * @returns {Promise<{ items: Object[], total: number, page: number, limit: number, pages: number }>}
 */
export async function searchStudents({ q, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams();
  params.append('q', String(q ?? ''));
  params.append('page', String(page));
  params.append('limit', String(limit));
  return request(`/students/search?${params.toString()}`);
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
