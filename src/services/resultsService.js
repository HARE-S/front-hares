import { request } from './api';
import { calculatePPM, calculateVef, getReadingBand } from '../utils/format';

/**
 * @typedef {Object} ResultItem
 * @property {string} id
 * @property {string} studentId
 * @property {string} [studentName]
 * @property {string} testId
 * @property {string} [testName]
 * @property {string} sectionId
 * @property {string} testDate - YYYY-MM-DD
 * @property {number} time - Tiempo en segundos
 * @property {number} successes - Aciertos de comprensión
 * @property {number} mistakes - Errores de lectura
 * @property {number} [ppm] - Palabras por minuto calculadas
 * @property {number} [vef] - Velocidad eficaz calculada
 * @property {string} [band] - Banda pedagógica (Avanzado, En nivel, Requiere apoyo)
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} BatchStudentResult
 * @property {string} studentId
 * @property {number|string} [time] - Tiempo en segundos
 * @property {number|string} [successes] - Aciertos
 * @property {number|string} [mistakes] - Errores
 * @property {boolean} [absent] - True si el alumno no realizó la prueba
 */

// Fallback en memoria para desarrollo y pruebas offline
let inMemoryResults = [
  {
    id: 'res-1',
    studentId: '1',
    studentName: 'Lucas Méndez Ruiz',
    testId: '1IF',
    testName: 'La Vaca (1IF)',
    sectionId: 'sec-1',
    testDate: '2026-09-15',
    time: 52,
    successes: 18,
    mistakes: 1,
    ppm: 125,
    vef: 113,
    band: 'Avanzado',
    createdAt: '2026-09-15T09:30:00Z'
  },
  {
    id: 'res-2',
    studentId: '2',
    studentName: 'Sofía Navarro Ortiz',
    testId: '1IF',
    testName: 'La Vaca (1IF)',
    sectionId: 'sec-1',
    testDate: '2026-09-15',
    time: 68,
    successes: 15,
    mistakes: 3,
    ppm: 95,
    vef: 71,
    band: 'Requiere apoyo',
    createdAt: '2026-09-15T09:32:00Z'
  },
  {
    id: 'res-3',
    studentId: '3',
    studentName: 'Mateo Barrenechea',
    testId: '1IF',
    testName: 'La Vaca (1IF)',
    sectionId: 'sec-1',
    testDate: '2026-09-15',
    time: 60,
    successes: 17,
    mistakes: 2,
    ppm: 108,
    vef: 92,
    band: 'En nivel',
    createdAt: '2026-09-15T09:34:00Z'
  },
  {
    id: 'res-4',
    studentId: '4',
    studentName: 'Aitana Zubizarreta',
    testId: '1IF',
    testName: 'La Vaca (1IF)',
    sectionId: 'sec-1',
    testDate: '2026-09-15',
    time: 55,
    successes: 19,
    mistakes: 0,
    ppm: 118,
    vef: 112,
    band: 'Avanzado',
    createdAt: '2026-09-15T09:36:00Z'
  },
  {
    id: 'res-5',
    studentId: '7',
    studentName: 'Alejandro López',
    testId: '1IF',
    testName: 'La Vaca (1IF)',
    sectionId: 'sec-1',
    testDate: '2026-09-15',
    time: 65,
    successes: 16,
    mistakes: 2,
    ppm: 100,
    vef: 80,
    band: 'Requiere apoyo',
    createdAt: '2026-09-15T09:38:00Z'
  }
];

/**
 * Reinicia la memoria local (útil para tests).
 */
export function _resetInMemoryResults(initialData = null) {
  inMemoryResults = initialData ? [...initialData] : [];
}

/**
 * Obtiene todos los resultados almacenados en memoria.
 */
export function _getInMemoryResults() {
  return [...inMemoryResults];
}

/**
 * Registrar un lote de resultados de una sección (FE-20 / BE-22).
 *
 * @param {Object} params
 * @param {string} params.sectionId - ID de la sección
 * @param {string} params.testId - ID o código de la prueba
 * @param {string} [params.testName] - Nombre o título de la prueba
 * @param {number} [params.testWords] - Total de palabras de la prueba (por defecto 108)
 * @param {string} params.testDate - Fecha en formato YYYY-MM-DD
 * @param {BatchStudentResult[]} params.results - Lista de filas de alumnos
 * @returns {Promise<{ registered: number, absent: number, results: ResultItem[] }>}
 */
export async function registerBatchResults({
  sectionId,
  testId,
  testName = 'Prueba',
  testWords = 108,
  testDate,
  results = []
}) {
  if (!sectionId) throw new Error('sectionId es obligatorio');
  if (!testId) throw new Error('testId es obligatorio');
  if (!testDate) throw new Error('testDate es obligatorio');

  // Filtrar ausentes: filas marcadas como absent o donde no se introdujo tiempo
  const presentRows = [];
  let absentCount = 0;

  for (const item of results) {
    const hasTime = item.time !== undefined && item.time !== null && String(item.time).trim() !== '' && Number(item.time) > 0;
    if (item.absent || !hasTime) {
      absentCount++;
    } else {
      presentRows.push({
        student_id: item.studentId,
        time: Number(item.time),
        successes: Number(item.successes ?? 0),
        mistakes: Number(item.mistakes ?? 0),
        absent: false
      });
    }
  }

  // Intentar envío real al backend si está disponible
  try {
    const payload = {
      section_id: sectionId,
      test_id: testId,
      test_date: testDate,
      results: results.map(r => {
        const isPresent = r.time && Number(r.time) > 0 && !r.absent;
        return {
          student_id: r.studentId,
          time: isPresent ? Number(r.time) : 0,
          successes: isPresent ? Number(r.successes || 0) : 0,
          mistakes: isPresent ? Number(r.mistakes || 0) : 0,
          absent: !isPresent
        };
      })
    };

    const res = await request('/results/batch', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res && (res.registered !== undefined || res.results)) {
      return res;
    }
  } catch (err) {
    // Si falla la red o el backend devuelve error de conexión, usamos fallback local pedagógico
    console.warn('Backend /results/batch no disponible o error, usando fallback local pedagógico:', err);
  }

  // Fallback pedagógico local
  const savedResults = [];
  for (const row of presentRows) {
    const ppm = calculatePPM(testWords, row.time);
    const vef = calculateVef(ppm, row.successes, 20);
    const band = getReadingBand(vef);

    const newResult = {
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      studentId: row.student_id,
      studentName: row.student_name || `Alumno #${row.student_id}`,
      testId,
      testName,
      sectionId,
      testDate,
      time: row.time,
      successes: row.successes,
      mistakes: row.mistakes,
      ppm,
      vef,
      band,
      createdAt: new Date().toISOString()
    };

    inMemoryResults.unshift(newResult);
    savedResults.push(newResult);
  }

  return {
    registered: savedResults.length,
    absent: absentCount,
    results: savedResults
  };
}

/**
 * Consultar histórico de resultados de un alumno (BE-20).
 * @param {string} studentId
 * @returns {Promise<ResultItem[]>}
 */
export async function getStudentResults(studentId) {
  try {
    const res = await request(`/students/${studentId}/results`);
    if (Array.isArray(res)) return res;
  } catch (err) {
    console.warn('Fallback a memoria para resultados de alumno:', err);
  }

  return inMemoryResults.filter(r => String(r.studentId) === String(studentId));
}

/**
 * Modificar un resultado existente (FE-19 / BE-21).
 *
 * @param {string} resultId
 * @param {Object} updates - { time, successes, mistakes, testWords }
 * @returns {Promise<ResultItem>}
 */
export async function updateResult(resultId, updates = {}) {
  if (!resultId) throw new Error('resultId es obligatorio');

  // Validaciones
  if (updates.time !== undefined && Number(updates.time) <= 0) {
    throw new Error('El tiempo debe ser mayor a 0 segundos');
  }
  if (updates.successes !== undefined && Number(updates.successes) < 0) {
    throw new Error('Los aciertos no pueden ser negativos');
  }
  if (updates.mistakes !== undefined && Number(updates.mistakes) < 0) {
    throw new Error('Los errores no pueden ser negativos');
  }

  try {
    const payload = {};
    if (updates.time !== undefined) payload.time = Number(updates.time);
    if (updates.successes !== undefined) payload.successes = Number(updates.successes);
    if (updates.mistakes !== undefined) payload.mistakes = Number(updates.mistakes);

    const res = await request(`/results/${resultId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res && res.id) return res;
  } catch (err) {
    console.warn('Fallback local para updateResult:', err);
  }

  const idx = inMemoryResults.findIndex(r => String(r.id) === String(resultId));
  if (idx === -1) {
    throw new Error(`Resultado con ID ${resultId} no encontrado`);
  }

  const existing = inMemoryResults[idx];
  const time = updates.time !== undefined ? Number(updates.time) : existing.time;
  const successes = updates.successes !== undefined ? Number(updates.successes) : existing.successes;
  const mistakes = updates.mistakes !== undefined ? Number(updates.mistakes) : existing.mistakes;
  const words = updates.testWords || 108;

  const ppm = calculatePPM(words, time);
  const vef = calculateVef(ppm, successes, 20);
  const band = getReadingBand(vef);

  const updated = {
    ...existing,
    time,
    successes,
    mistakes,
    ppm,
    vef,
    band,
    updatedAt: new Date().toISOString()
  };

  inMemoryResults[idx] = updated;
  return updated;
}

/**
 * Eliminar / Anular un resultado de forma definitiva (FE-19 / BE-21).
 *
 * @param {string} resultId
 * @returns {Promise<boolean>}
 */
export async function deleteResult(resultId) {
  if (!resultId) throw new Error('resultId es obligatorio');

  try {
    await request(`/results/${resultId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Fallback local para deleteResult:', err);
  }

  const prevLen = inMemoryResults.length;
  inMemoryResults = inMemoryResults.filter(r => String(r.id) !== String(resultId));
  return inMemoryResults.length < prevLen;
}

/**
 * Obtener histórico de resultados de una sección (FE-29 / BE-51).
 *
 * @param {string} sectionId
 * @param {Object} [options] - { startDate, endDate, groupBy, testId }
 * @returns {Promise<ResultItem[]>}
 */
export async function getSectionResults(sectionId, options = {}) {
  if (!sectionId) return [];

  try {
    const params = new URLSearchParams();
    if (options.startDate) params.append('start_date', options.startDate);
    if (options.endDate) params.append('end_date', options.endDate);
    if (options.groupBy) params.append('group_by', options.groupBy);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/sections/${sectionId}/results${query}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
  } catch (err) {
    console.warn('Fallback local para getSectionResults:', err);
  }

  // Filtrado local
  let list = inMemoryResults.filter(r => !sectionId || String(r.sectionId) === String(sectionId));
  if (options.testId) {
    list = list.filter(r => String(r.testId) === String(options.testId));
  }
  if (options.startDate) {
    list = list.filter(r => r.testDate >= options.startDate);
  }
  if (options.endDate) {
    list = list.filter(r => r.testDate <= options.endDate);
  }

  return list;
}
