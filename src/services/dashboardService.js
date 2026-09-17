import { request } from './api';

/**
 * Servicio para obtener datos del dashboard de rendimiento (FE-31).
 */

export async function getMetrics(sectionId = null) {
  const query = sectionId ? `?section_id=${sectionId}` : '';
  return request(`/dashboard/metrics${query}`, { method: 'GET' });
}

export async function getFluencyChart(sectionId = null, period = 'trimestral') {
  const query = new URLSearchParams();
  if (sectionId) query.set('section_id', sectionId);
  if (period) query.set('period', period);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/dashboard/fluency${queryString}`, { method: 'GET' });
}

export async function getLevelsDistribution(sectionId = null) {
  const query = sectionId ? `?section_id=${sectionId}` : '';
  return request(`/dashboard/levels-distribution${query}`, { method: 'GET' });
}

export async function getRecentAssessments(sectionId = null, limit = 10) {
  const query = new URLSearchParams();
  if (sectionId) query.set('section_id', sectionId);
  if (limit) query.set('limit', String(limit));
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/dashboard/assessments${queryString}`, { method: 'GET' });
}

export async function exportAssessments(format = 'csv', sectionId = null) {
  const query = new URLSearchParams();
  if (format) query.set('format', format);
  if (sectionId) query.set('section_id', sectionId);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/dashboard/export${queryString}`, { method: 'GET' });
}
