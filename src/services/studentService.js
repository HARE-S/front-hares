import { request } from './api';
import { _getInMemoryResults } from './resultsService';

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
 * Datos mock de pruebas por estudiante para desarrollo
 */
const mockResultsByStudent = {
  'stu-1': [
    { id: 'res-stu1-1', test_date: '2026-09-10', test_name: 'La Vaca (1IF)', ppm: 125, comprehension: 90, accuracy: 95, vef: 113 },
    { id: 'res-stu1-2', test_date: '2026-09-15', test_name: 'El Patito Feo (1AF)', ppm: 130, comprehension: 95, accuracy: 100, vef: 123 },
    { id: 'res-stu1-3', test_date: '2026-09-20', test_name: 'La Vaca (1IF)', ppm: 128, comprehension: 92, accuracy: 98, vef: 118 }
  ],
  'stu-2': [
    { id: 'res-stu2-1', test_date: '2026-09-12', test_name: 'La Vaca (1IF)', ppm: 95, comprehension: 75, accuracy: 85, vef: 71 }
  ],
  'stu-3': [
    { id: 'res-stu3-1', test_date: '2026-09-11', test_name: 'La Vaca (1IF)', ppm: 108, comprehension: 85, accuracy: 90, vef: 92 },
    { id: 'res-stu3-2', test_date: '2026-09-18', test_name: 'El Patito Feo (1AF)', ppm: 112, comprehension: 88, accuracy: 93, vef: 98 }
  ],
  'stu-4': [
    { id: 'res-stu4-1', test_date: '2026-09-14', test_name: 'La Vaca (1IF)', ppm: 102, comprehension: 80, accuracy: 88, vef: 82 },
    { id: 'res-stu4-2', test_date: '2026-09-21', test_name: 'El Patito Feo (1AF)', ppm: 115, comprehension: 90, accuracy: 95, vef: 105 }
  ],
  'stu-5': [
    { id: 'res-stu5-1', test_date: '2026-09-13', test_name: 'La Vaca (1IF)', ppm: 120, comprehension: 85, accuracy: 92, vef: 108 }
  ],
  'stu-6': [
    { id: 'res-stu6-1', test_date: '2026-09-16', test_name: 'La Vaca (1IF)', ppm: 98, comprehension: 70, accuracy: 80, vef: 68 },
    { id: 'res-stu6-2', test_date: '2026-09-23', test_name: 'El Patito Feo (1AF)', ppm: 105, comprehension: 75, accuracy: 85, vef: 80 }
  ],
  'stu-7': [
    { id: 'res-stu7-1', test_date: '2026-09-17', test_name: 'La Vaca (1IF)', ppm: 135, comprehension: 95, accuracy: 98, vef: 128 }
  ],
  'stu-8': [
    { id: 'res-stu8-1', test_date: '2026-09-11', test_name: 'La Vaca (1IF)', ppm: 88, comprehension: 65, accuracy: 75, vef: 55 }
  ],
  'stu-9': [
    { id: 'res-stu9-1', test_date: '2026-09-19', test_name: 'La Vaca (1IF)', ppm: 118, comprehension: 88, accuracy: 93, vef: 105 },
    { id: 'res-stu9-2', test_date: '2026-09-22', test_name: 'El Patito Feo (1AF)', ppm: 122, comprehension: 92, accuracy: 97, vef: 112 }
  ],
  'stu-10': [
    { id: 'res-stu10-1', test_date: '2026-09-12', test_name: 'La Vaca (1IF)', ppm: 110, comprehension: 82, accuracy: 90, vef: 98 }
  ],
  'stu-11': [
    { id: 'res-stu11-1', test_date: '2026-09-18', test_name: 'La Vaca (1IF)', ppm: 92, comprehension: 72, accuracy: 82, vef: 65 },
    { id: 'res-stu11-2', test_date: '2026-09-24', test_name: 'El Patito Feo (1AF)', ppm: 100, comprehension: 78, accuracy: 88, vef: 78 }
  ]
};

/**
 * Datos mock de lecturas por estudiante
 */
const mockReadingsByStudent = {
  'stu-4': [
    { id: 'read-stu4-1', book_title: 'La Casa de los Espíritus', level: 'Intermedio', start_date: '2026-08-15', end_date: '2026-09-10', status: 'finalizada' },
    { id: 'read-stu4-2', book_title: 'El Quijote', level: 'Avanzado', start_date: '2026-09-12', end_date: null, status: 'en curso' }
  ],
  'stu-1': [
    { id: 'read-stu1-1', book_title: 'Cien Años de Soledad', level: 'Avanzado', start_date: '2026-07-20', end_date: '2026-09-05', status: 'finalizada' }
  ],
  'stu-3': [
    { id: 'read-stu3-1', book_title: 'El Príncipe de la Niebla', level: 'Intermedio', start_date: '2026-08-01', end_date: null, status: 'en curso' }
  ],
  'stu-5': [
    { id: 'read-stu5-1', book_title: 'La Sombra del Viento', level: 'Intermedio', start_date: '2026-08-20', end_date: '2026-09-15', status: 'finalizada' }
  ],
  'stu-7': [
    { id: 'read-stu7-1', book_title: 'Don Quijote', level: 'Avanzado', start_date: '2026-07-10', end_date: '2026-09-18', status: 'finalizada' },
    { id: 'read-stu7-2', book_title: 'La Metamorfosis', level: 'Intermedio', start_date: '2026-09-20', end_date: null, status: 'en curso' }
  ],
  'stu-9': [
    { id: 'read-stu9-1', book_title: 'Orgullo y Prejuicio', level: 'Intermedio', start_date: '2026-08-10', end_date: '2026-09-12', status: 'finalizada' }
  ]
};

/**
 * Datos mock de secciones actuales por estudiante
 */
const mockCurrentSectionsByStudent = {
  'stu-1': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-2': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-3': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-4': [
    { id: 's-2', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-5': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-6': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-7': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-8': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-9': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-10': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ],
  'stu-11': [
    { id: 's-1', name: '1º ESO B', academic_year: '2025-26', center_id: 'c-1', enrollment_date: '2025-09-05' }
  ]
};

/**
 * Datos mock de secciones históricas por estudiante
 */
const mockHistoricalSectionsByStudent = {
  'stu-4': [
    { id: 'sec-hist-1', name: '6º Primaria C', academic_year: '2024-25' },
    { id: 'sec-hist-2', name: '5º Primaria B', academic_year: '2023-24' }
  ],
  'stu-1': [
    { id: 'sec-hist-3', name: '1º ESO A', academic_year: '2024-25' }
  ],
  'stu-3': [
    { id: 'sec-hist-4', name: '2º ESO C', academic_year: '2024-25' },
    { id: 'sec-hist-5', name: '1º ESO B', academic_year: '2023-24' }
  ],
  'stu-7': [
    { id: 'sec-hist-6', name: '3º ESO A', academic_year: '2024-25' }
  ]
};

/**
 * Obtener ficha completa de un alumno.
 * Incluye datos personales, secciones y lecturas en una sola petición (BE-28).
 * @param {string} studentId — UUID del alumno
 * @returns {Promise<StudentRecord>}
 */
/**
 * Listado de alumnos con paginación y búsqueda opcional (BE-30).
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=50]
 * @param {string} [params.q]
 * @returns {Promise<{ items: Object[], total: number, page: number, pages: number, limit: number }>}
 */
export async function getStudents({ page = 1, limit = 50, q } = {}) {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  if (q) params.append('q', String(q));
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return request(`/students${queryStr}`);
}

/**
 * Obtener ficha completa de un alumno.
 * Incluye datos personales, secciones y lecturas en una sola petición (BE-28).
 * @param {string} studentId — UUID del alumno
 * @returns {Promise<StudentRecord>}
 */
export async function getStudentRecord(studentId) {
  try {
    const response = await request(`/students/${studentId}`);

    if (!response || typeof response !== 'object') {
      return createStudentRecordWithMocks(studentId);
    }

    // Asegurar que siempre hay arrays
    if (!response.results) response.results = [];
    if (!response.readings) response.readings = [];
    if (!response.historical_sections) response.historical_sections = [];
    if (!response.current_sections) response.current_sections = [];

    // Si no tiene secciones actuales pero tiene sections.current
    if (response.current_sections.length === 0 && response.sections?.current) {
      response.current_sections = response.sections.current;
    }

    return response;
  } catch (err) {
    if (err.status === 403 || err.status === 404) {
      throw err;
    }
    // Solo fallback a mock en entorno offline / pruebas unitarias sin backend (status 0)
    if (err.status === 0) {
      console.warn('Backend desconectado, usando datos mock para estudiante:', studentId);
      return createStudentRecordWithMocks(studentId);
    }
    throw err;
  }
}

function createStudentRecordWithMocks(studentId) {
  return {
    id: studentId,
    name: 'Estudiante',
    results: mockResultsByStudent[studentId] || [],
    readings: mockReadingsByStudent[studentId] || [],
    historical_sections: mockHistoricalSectionsByStudent[studentId] || [],
    current_sections: mockCurrentSectionsByStudent[studentId] || [],
    sections: {
      current: mockCurrentSectionsByStudent[studentId] || [],
      historical: mockHistoricalSectionsByStudent[studentId] || []
    }
  };
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
