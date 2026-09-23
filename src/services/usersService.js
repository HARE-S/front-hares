import { request } from './api';

/**
 * Servicio de gestión de usuarios (FE-10 / BE-43).
 */

/**
 * Obtener listado de usuarios con paginación.
 * @param {Object} [params] - { page, limit }
 * @returns {Promise<Array>}
 */
export async function getUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  const queryStr = query.toString() ? `?${query.toString()}` : '';

  try {
    return await request(`/users${queryStr}`, { method: 'GET' });
  } catch (err) {
    console.warn('Error al obtener listado de usuarios:', err);
    throw err;
  }
}

/**
 * Obtener detalles de un usuario.
 * @param {string} userId - UUID del usuario
 * @returns {Promise<Object>}
 */
export async function getUser(userId) {
  return request(`/users/${userId}`, { method: 'GET' });
}

/**
 * Modificar rol de un usuario.
 * @param {string} userId - UUID del usuario
 * @param {string} role - 'pendiente' | 'tutor' | 'coordinador' | 'admin' | 'director'
 * @returns {Promise<Object>}
 */
export async function updateUserRole(userId, role) {
  return request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
}

/**
 * Asignar sección a un usuario.
 * @param {string} userId - UUID del usuario
 * @param {string} sectionId - UUID de la sección
 * @returns {Promise<Object>}
 */
export async function assignUserSection(userId, sectionId) {
  return request(`/users/${userId}/sections`, {
    method: 'POST',
    body: JSON.stringify({ section_id: sectionId })
  });
}

/**
 * Desasignar sección a un usuario.
 * @param {string} userId - UUID del usuario
 * @param {string} sectionId - UUID de la sección
 * @returns {Promise<void>}
 */
export async function removeUserSection(userId, sectionId) {
  return request(`/users/${userId}/sections`, {
    method: 'DELETE',
    body: JSON.stringify({ section_id: sectionId })
  });
}

/**
 * Obtener listado de usuarios pendientes de aprobación.
 * @returns {Promise<Array>}
 */
export async function getPendingUsers() {
  return request('/users/pending', { method: 'GET' });
}

/**
 * Aprobar usuario pendiente.
 * @param {string} userId - UUID del usuario
 * @param {string} [role='tutor'] - Rol asignado
 * @returns {Promise<Object>}
 */
export async function approveUser(userId, role = 'tutor') {
  return request(`/users/pending/${userId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ role })
  });
}

/**
 * Rechazar usuario pendiente.
 * @param {string} userId - UUID del usuario
 * @returns {Promise<void>}
 */
export async function rejectUser(userId) {
  return request(`/users/pending/${userId}/reject`, {
    method: 'POST'
  });
}
