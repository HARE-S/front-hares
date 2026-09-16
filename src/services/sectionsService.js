import { request } from './api';

/**
 * @typedef {Object} SectionMetrics
 * @property {number} id — ID de la sección
 * @property {string} name — Nombre de la sección
 * @property {number} averagePPM — Velocidad media (PPM)
 * @property {number} targetPPM — Objetivo de PPM
 * @property {number} progressPercent — % hacia objetivo
 * @property {number} evaluatedStudents — Alumnos con resultados
 * @property {number} totalStudents — Total de alumnos
 * @property {number} booksReadThisTerm — Libros leídos en trimestre
 * @property {number} studentsNeedingSupport — Alumnos que requieren apoyo
 * @property {Object} levelDistribution — Distribución por bandas {high, normal, low, nodata}
 */

/**
 * Obtener métricas agregadas de una sección.
 * @param {string} sectionId — UUID de la sección
 * @returns {Promise<SectionMetrics>}
 */
export async function getSectionMetrics(sectionId) {
  const response = await request(`/sections/${sectionId}/metrics`);
  return response;
}

/**
 * Obtener histórico de resultados de una sección.
 * @param {string} sectionId — UUID de la sección
 * @param {Object} options — Opciones de filtrado
 * @param {string} options.startDate — ISO 8601 date
 * @param {string} options.endDate — ISO 8601 date
 * @param {string} options.groupBy — 'date' | 'test' | 'student'
 * @returns {Promise<Object>}
 */
export async function getSectionHistory(sectionId, options = {}) {
  const params = new URLSearchParams();
  if (options.startDate) params.append('start_date', options.startDate);
  if (options.endDate) params.append('end_date', options.endDate);
  if (options.groupBy) params.append('group_by', options.groupBy);

  const queryStr = params.toString();
  const endpoint = queryStr ? `/sections/${sectionId}/results?${queryStr}` : `/sections/${sectionId}/results`;

  return request(endpoint);
}

/**
 * Obtener progreso del grupo (% alumnos que mejoran por transición).
 * @param {string} sectionId — UUID de la sección
 * @returns {Promise<Object>}
 */
export async function getGroupProgress(sectionId) {
  return request(`/pair-metrics/sections/${sectionId}/group-progress`);
}

/**
 * Obtener clasificación por niveles de una sección.
 * @param {string} sectionId — UUID de la sección
 * @returns {Promise<Object>}
 */
export async function getLevelDistribution(sectionId) {
  return request(`/sections/${sectionId}/level-distribution`);
}

/**
 * Obtener acción pedagógica sugerida para una sección.
 * @param {string} sectionId — UUID de la sección
 * @returns {Promise<Object>} { alert: string, recommendation: string, studentCount: number }
 */
export async function getPedagogicalAction(sectionId) {
  return request(`/sections/${sectionId}/pedagogical-action`);
}
