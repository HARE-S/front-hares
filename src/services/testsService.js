import { request } from './api';

/**
 * Servicio para el catálogo de pruebas de lectura (BE-11, BE-13, BE-14).
 */

const defaultMockTests = [
  {
    id: 'test-1',
    code: '1IF',
    name: 'La Vaca',
    words: 299,
    course: 1,
    test_letter: 'I',
    type: 'F',
    disabled_at: null,
    has_results: true
  },
  {
    id: 'test-2',
    code: '1AF',
    name: 'El Patito Feo',
    words: 350,
    course: 1,
    test_letter: 'A',
    type: 'F',
    disabled_at: null,
    has_results: false
  },
  {
    id: 'test-3',
    code: '2BL',
    name: 'El Príncipe Feliz',
    words: 450,
    course: 2,
    test_letter: 'B',
    type: 'L',
    disabled_at: null,
    has_results: true
  },
  {
    id: 'test-4',
    code: '2BF',
    name: 'La Selva Negra',
    words: 380,
    course: 2,
    test_letter: 'B',
    type: 'F',
    disabled_at: null,
    has_results: false
  },
  {
    id: 'test-5',
    code: '3AL',
    name: 'El Flautista de Hamelín',
    words: 420,
    course: 3,
    test_letter: 'A',
    type: 'L',
    disabled_at: null,
    has_results: false
  }
];

let inMemoryTests = JSON.parse(JSON.stringify(defaultMockTests));

export function _resetInMemoryTests(initialData = null) {
  if (initialData) {
    inMemoryTests = JSON.parse(JSON.stringify(initialData));
  } else {
    inMemoryTests = JSON.parse(JSON.stringify(defaultMockTests));
  }
}

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
  if (params.test_letter) query.set('test_letter', params.test_letter);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  if (params.include_disabled) query.set('include_disabled', 'true');

  const queryString = query.toString() ? `?${query.toString()}` : '';
  try {
    return await request(`/tests${queryString}`, { method: 'GET' });
  } catch (err) {
    if (err.status === 0 || err.message?.includes('No se pudo conectar')) {
      let list = inMemoryTests.filter(t => {
        if (!params.include_disabled && t.disabled_at) return false;
        if (params.filter) {
          const f = params.filter.toLowerCase();
          const match = (t.code && t.code.toLowerCase().includes(f)) ||
                        (t.name && t.name.toLowerCase().includes(f));
          if (!match) return false;
        }
        if (params.course !== undefined && params.course !== null && params.course !== '') {
          if (t.course !== parseInt(params.course, 10)) return false;
        }
        if (params.test_letter && t.test_letter !== params.test_letter) return false;
        if (params.type && t.type !== params.type) return false;
        return true;
      });
      const page = parseInt(params.page, 10) || 1;
      const limit = parseInt(params.limit, 10) || 10;
      const total = list.length;
      const pages = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;
      const items = list.slice(start, start + limit);
      return { items, total, page, pages, limit };
    }
    throw err;
  }
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

  try {
    return await request('/tests', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    if (err.status === 409) {
      const conflictErr = new Error('Ese código ya existe en el catálogo.');
      conflictErr.status = 409;
      throw conflictErr;
    }
    if (err.status === 0 || err.message?.includes('No se pudo conectar')) {
      if (inMemoryTests.some(t => t.code.toLowerCase() === payload.code?.toLowerCase())) {
        const conflictErr = new Error('Ese código ya existe en el catálogo.');
        conflictErr.status = 409;
        throw conflictErr;
      }
      const newTest = {
        id: `test-${Date.now()}`,
        ...payload,
        disabled_at: null,
        has_results: false,
        created_at: new Date().toISOString()
      };
      inMemoryTests.unshift(newTest);
      return newTest;
    }
    throw err;
  }
}

/**
 * Actualiza los datos de una prueba existente (PUT /api/v1/tests/<id>)
 */
export async function updateTest(testId, testData) {
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

  try {
    return await request(`/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    if (err.status === 409) {
      const conflictErr = new Error('Ese código ya existe en el catálogo.');
      conflictErr.status = 409;
      throw conflictErr;
    }
    if (err.status === 0 || err.message?.includes('No se pudo conectar')) {
      const idx = inMemoryTests.findIndex(t => t.id === testId);
      if (idx !== -1) {
        const duplicate = inMemoryTests.find(t => t.id !== testId && t.code.toLowerCase() === payload.code?.toLowerCase());
        if (duplicate) {
          const conflictErr = new Error('Ese código ya existe en el catálogo.');
          conflictErr.status = 409;
          throw conflictErr;
        }
        inMemoryTests[idx] = { ...inMemoryTests[idx], ...payload, updated_at: new Date().toISOString() };
        return inMemoryTests[idx];
      }
    }
    throw err;
  }
}

/**
 * Da de baja lógica una prueba (DELETE /api/v1/tests/<id>)
 */
export async function deleteTest(testId) {
  try {
    return await request(`/tests/${testId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    if (err.status === 0 || err.message?.includes('No se pudo conectar')) {
      const idx = inMemoryTests.findIndex(t => t.id === testId);
      if (idx !== -1) {
        inMemoryTests[idx].disabled_at = new Date().toISOString();
        return { message: 'Prueba dada de baja lógicamente' };
      }
    }
    throw err;
  }
}
