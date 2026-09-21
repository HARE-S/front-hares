import { request } from './api';

/**
 * @typedef {Object} ComparisonGroup — Grupo de la comparativa (BE-32)
 * @property {string} id — Identificador del grupo (sección, centro o perfil)
 * @property {string} name — Nombre del grupo
 * @property {'section'|'center'|'profile'} group_by — Agrupación usada
 * @property {string|null} center_id — Centro del grupo (solo modo sección)
 * @property {string|null} center_name — Nombre del centro del grupo
 * @property {boolean} has_data — false si no hay resultados registrados
 * @property {number} students_count — Alumnos con datos que componen la media
 * @property {number} results_count — Pruebas consideradas
 * @property {number|null} mean_ppm — Media de PPM (null sin datos)
 * @property {number|null} mean_accuracy — Media de comprensión (%)
 * @property {number|null} mean_vef — Media de VEF (null sin datos)
 * @property {boolean} is_representative — Alcanza el mínimo configurado
 * @property {string|null} warning — Advertencia de un representatividad/sin datos
 */

/**
 * @typedef {Object} ComparisonResponse — Respuesta de la comparativa (BE-32)
 * @property {'section'|'center'|'profile'} group_by — Agrupación aplicada
 * @property {number} min_sample — Mínimo de alumnos para representatividad
 * @property {ComparisonGroup[]} groups — Grupos ordenados por nombre
 */

/**
 * @typedef {Object} ComparisonFilters — Parámetros de la comparativa (BE-32)
 * @property {'section'|'center'|'profile'} groupBy — Cómo agrupar
 * @property {string[]} [sectionIds] — Secciones a comparar (repetible)
 * @property {string|null} [centerId] — Centro para acotar en modos sección/perfil
 * @property {number|null} [minSample] — Mínimo de alumnos (configurable)
 * @property {string|null} [startDate] — Inicio del rango (YYYY-MM-DD)
 * @property {string|null} [endDate] — Fin del rango (YYYY-MM-DD)
 */

/**
 * Comparativa de evolución media entre grupos (FE-32 / BE-32).
 *
 * Replicar el contrato de back-hares/app/api/v1/comparison.py:
 * `GET /comparison/groups` (request() añade el prefijo /api/v1).
 *
 * @param {ComparisonFilters} [filters]
 * @returns {Promise<ComparisonResponse>}
 */
export async function getGroupComparison({
  groupBy,
  sectionIds = [],
  centerId = null,
  minSample = null,
  startDate = null,
  endDate = null
} = {}) {
  const params = new URLSearchParams();
  params.append('group_by', groupBy);
  sectionIds.forEach((id) => params.append('section_ids', id));
  if (centerId) params.append('center_id', centerId);
  if (minSample !== null && minSample !== '') params.append('min_sample', String(minSample));
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/comparison/groups${query}`);
}