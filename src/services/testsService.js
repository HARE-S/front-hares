import { request } from './api';

/**
 * Servicio para el catálogo de pruebas de lectura (BE-11, BE-13, BE-14).
 */

/**
 * Deducción pedagógica a partir del código de la prueba (ej: "1AF" -> curso: 1, letra: "A", tipo: "F").
 * Réplica de la convención de CatalogService.deduce_level_and_type_from_code del backend.
 */
export function deduceLevelAndTypeFromCode(code) {
  let course = null;
  let testLetter = null;
  let testType = null;

  if (code && typeof code === 'string') {
    const trimmed = code.trim();
    if (trimmed.length >= 2) {
      // 1er carácter: Curso escolar (0-9)
      if (/^\d/.test(trimmed[0])) {
        course = parseInt(trimmed[0], 10);
      }
      // 2º carácter: Letra pedagógica (I, A, B, C, D, E)
      const middle = trimmed[1].toUpperCase();
      if (['I', 'A', 'B', 'C', 'D', 'E'].includes(middle)) {
        testLetter = middle;
      }
      // Último carácter: Tipo de texto (F: Funcional, L: Literario)
      const lastChar = trimmed[trimmed.length - 1].toUpperCase();
      if (lastChar === 'F' || lastChar === 'L') {
        testType = lastChar;
      }
    }
  }

  return { course, testLetter, testType };
}

/**
 * Obtiene el listado paginado y filtrado de pruebas (GET /api/v1/tests)
 */
export async function getTests(params = {}) {
  const query = new URLSearchParams();
  if (params.filter) query.set('filter', params.filter);
  if (params.course !== undefined && params.course !== null && params.course !== '') {
    query.set('course', params.course);
  }
  if (params.type) query.set('type', params.type);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  if (params.include_disabled) query.set('include_disabled', 'true');

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/tests${queryString}`, { method: 'GET' });
}

/**
 * Da de alta una nueva prueba en el catálogo (POST /api/v1/tests)
 */
export async function createTest(testData) {
  const payload = {
    code: testData.code?.trim(),
    name: testData.name?.trim(),
    words: parseInt(testData.words, 10),
    course: testData.course !== '' && testData.course !== null && testData.course !== undefined
      ? parseInt(testData.course, 10)
      : null,
    test_letter: testData.test_letter || null,
    type: testData.type || null
  };

  return request('/tests', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Da de baja lógica una prueba (DELETE /api/v1/tests/<id>)
 */
export async function deleteTest(testId) {
  return request(`/tests/${testId}`, {
    method: 'DELETE'
  });
}
