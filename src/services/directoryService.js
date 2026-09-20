import { request } from './api';

/**
 * @typedef {Object} Center
 * @property {string} id — UUID del centro
 * @property {string|null} external_id — Identificador externo (Alexia)
 * @property {string} name — Nombre del centro
 * @property {number} sections_count — Secciones activas del centro
 */

/**
 * @typedef {Object} Section
 * @property {string} id — UUID de la sección
 * @property {string|null} external_id — Identificador externo (Alexia)
 * @property {string} name — Nombre de la sección
 * @property {string|null} academic_year — Curso académico
 * @property {string} center_id — UUID del centro al que pertenece
 * @property {number} students_count — Alumnos activos matriculados
 */

/**
 * @typedef {Object} StudentSummary
 * @property {string} id — UUID del alumno
 * @property {string|null} external_id — Identificador externo (Alexia)
 * @property {string} name — Nombre completo
 */

/**
 * Listado de centros activos (BE-10, Escenario 1).
 * @returns {Promise<Center[]>}
 */
export async function getCenters() {
  return request('/centers');
}

/**
 * Listado de secciones activas de un centro (BE-10, Escenario 2).
 * @param {string} centerId — UUID del centro
 * @returns {Promise<Section[]>}
 */
export async function getCenterSections(centerId) {
  return request(`/centers/${centerId}/sections`);
}

/**
 * Listado del alumnado activo matriculado en una sección (BE-10, Escenario 3).
 * @param {string} sectionId — UUID de la sección
 * @returns {Promise<StudentSummary[]>}
 */
export async function getSectionStudents(sectionId) {
  return request(`/sections/${sectionId}/students`);
}