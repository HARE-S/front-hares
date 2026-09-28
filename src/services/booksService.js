import { request } from './api';

/**
 * Vocabulario cerrado de niveles pedagógicos del centro Peñascal (FE-17 - Escenario 2).
 * La secuencia sigue el orden evolutivo pedagógico: 0 -> 0-I -> I -> I/II -> II
 */
export const BOOK_LEVELS = ['0', '0-I', 'I', 'I/II', 'II'];

/**
 * Devuelve el rango numérico ordinal del nivel para ordenación pedagógica (FE-17 - Escenario 3).
 * @param {string} level 
 * @returns {number}
 */
export function getLevelRank(level) {
  const index = BOOK_LEVELS.indexOf(level);
  return index === -1 ? 999 : index;
}

/**
 * Función de comparación para ordenar dos libros según su nivel pedagógico.
 * @param {string} levelA 
 * @param {string} levelB 
 * @returns {number}
 */
export function compareBookLevels(levelA, levelB) {
  return getLevelRank(levelA) - getLevelRank(levelB);
}

/**
 * Calcula la duración en días naturales entre la fecha de inicio y la fecha de fin (FE-22 - Escenario 1).
 * @param {string} startDate - Fecha YYYY-MM-DD
 * @param {string} endDate - Fecha YYYY-MM-DD
 * @returns {number|null}
 */
export function calculateReadingDuration(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : null;
}

// Datos de semilla iniciales representativos del centro escolar
let inMemoryBooks = [
  {
    id: 1,
    title: 'Aventuras en la granja',
    author: 'Elena García',
    level: '0',
    copies: '15 ejemplares',
    is_active: true
  },
  {
    id: 2,
    title: 'El pequeño conejo blanco',
    author: 'Xosé Ballesteros',
    level: '0-I',
    copies: '11 fotocopias',
    is_active: true
  },
  {
    id: 3,
    title: 'El bosque animado',
    author: 'Wenceslao Fernández',
    level: 'I',
    copies: '18 ejemplares',
    is_active: true
  },
  {
    id: 4,
    title: 'El misterio de la llave oxidada',
    author: 'Carmen Vázquez-Vigo',
    level: 'I/II',
    copies: '12 + 6 fotocopias',
    is_active: true
  },
  {
    id: 5,
    title: 'Aventuras en el mar',
    author: 'Robert L. Stevenson',
    level: 'II',
    copies: 'PDF',
    is_active: true
  },
  {
    id: 6,
    title: 'Cuentos de la selva',
    author: 'Horacio Quiroga',
    level: 'I',
    copies: '8 fotocopias',
    is_active: false // Dado de baja para validar filtro de activos (FE-21 Escenario 4)
  }
];

let inMemoryReadings = [
  {
    id: 101,
    student_id: 1,
    student_name: 'Lucas Méndez Ruiz',
    book_id: 3,
    book_title: 'El bosque animado',
    book_level: 'I',
    start_date: '2025-01-10',
    end_date: '2025-01-22',
    status: 'finalizada'
  },
  {
    id: 102,
    student_id: 2,
    student_name: 'Sofía Navarro Ortiz',
    book_id: 3,
    book_title: 'El bosque animado',
    book_level: 'I',
    start_date: '2025-01-12',
    end_date: null,
    status: 'en_curso'
  },
  {
    id: 103,
    student_id: 3,
    student_name: 'Mateo Barrenechea',
    book_id: 2,
    book_title: 'El pequeño conejo blanco',
    book_level: '0-I',
    start_date: '2025-01-15',
    end_date: null,
    status: 'en_curso'
  },
  {
    id: 104,
    student_id: 1, // Relectura de Lucas de un libro anterior
    student_name: 'Lucas Méndez Ruiz',
    book_id: 4,
    book_title: 'El misterio de la llave oxidada',
    book_level: 'I/II',
    start_date: '2025-01-23',
    end_date: null,
    status: 'en_curso'
  }
];

let nextBookId = 10;
let nextReadingId = 200;

/**
 * Obtiene el listado de libros con soporte para filtros y ordenación pedagógica (FE-17).
 */
export async function getBooks(params = {}) {
  const query = new URLSearchParams();
  if (params.filter) query.set('filter', params.filter);
  if (params.level) query.set('level', params.level);
  if (params.include_disabled) query.set('include_disabled', 'true');
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);

  const queryString = query.toString() ? `?${query.toString()}` : '';

  try {
    const res = await request(`/readings/titles${queryString}`, { method: 'GET' });
    if (res && res.items) {
      const titleMap = new Map();
      inMemoryBooks.forEach(b => titleMap.set(b.title.toLowerCase().trim(), { ...b }));
      res.items.forEach((item, idx) => {
        const key = (item.book_title || item.title || '').toLowerCase().trim();
        if (titleMap.has(key)) {
          const existing = titleMap.get(key);
          titleMap.set(key, {
            ...existing,
            test_id: item.test_id || existing.test_id || null,
            test_code: item.test_code || existing.test_code || null,
            level: item.level || existing.level,
            total_readings: item.total_readings !== undefined ? item.total_readings : (existing.total_readings || 0),
            active_readings: item.active_readings !== undefined ? item.active_readings : (existing.active_readings || 0)
          });
        } else {
          titleMap.set(key, {
            id: item.test_id || `read-book-${idx + 1}`,
            test_id: item.test_id || null,
            test_code: item.test_code || null,
            title: item.book_title || item.title,
            author: '',
            level: item.level || '0',
            copies: 'En biblioteca',
            is_active: true,
            total_readings: item.total_readings || 0,
            active_readings: item.active_readings || 0
          });
        }
      });
      let items = Array.from(titleMap.values());
      if (!params.include_disabled) {
        items = items.filter(b => b.is_active);
      }
      if (params.level) {
        items = items.filter(b => b.level === params.level);
      }
      if (params.filter) {
        const term = params.filter.trim().toLowerCase();
        items = items.filter(b => 
          b.title.toLowerCase().includes(term) ||
          (b.author && b.author.toLowerCase().includes(term))
        );
      }
      items.sort((a, b) => compareBookLevels(a.level, b.level));
      return {
        items,
        total: items.length,
        page: 1,
        limit: 50
      };
    }
  } catch (err) {
    // Si falla o no hay conexión, usar datos en memoria
  }

  // Filtrado y ordenación sobre datos de respaldo
  let items = [...inMemoryBooks];

  if (!params.include_disabled) {
    items = items.filter(b => b.is_active);
  }

  if (params.level) {
    items = items.filter(b => b.level === params.level);
  }

  if (params.filter) {
    const term = params.filter.trim().toLowerCase();
    items = items.filter(b => 
      b.title.toLowerCase().includes(term) ||
      (b.author && b.author.toLowerCase().includes(term))
    );
  }

  // Ordenación pedagógica por defecto
  items.sort((a, b) => compareBookLevels(a.level, b.level));

  return {
    items,
    total: items.length,
    page: 1,
    limit: 50
  };
}

/**
 * Da de alta un libro en el catálogo
 */
export async function createBook(bookData) {
  if (!bookData.title || !bookData.title.trim()) {
    const err = new Error('El título del libro es obligatorio.');
    err.status = 400;
    throw err;
  }

  if (!bookData.level || !BOOK_LEVELS.includes(bookData.level)) {
    const err = new Error(`El nivel debe ser uno de los permitidos: ${BOOK_LEVELS.join(', ')}.`);
    err.status = 400;
    throw err;
  }

  const exists = inMemoryBooks.some(b => b.title.trim().toLowerCase() === bookData.title.trim().toLowerCase());
  if (exists) {
    const err = new Error('Ese título de libro ya existe en el catálogo.');
    err.status = 409;
    throw err;
  }

  const newBook = {
    id: nextBookId++,
    title: bookData.title.trim(),
    author: (bookData.author || '').trim(),
    level: bookData.level,
    copies: (bookData.copies || '').trim(),
    is_active: bookData.is_active !== undefined ? bookData.is_active : true,
    total_readings: 0,
    active_readings: 0
  };
  inMemoryBooks.push(newBook);
  return newBook;
}

/**
 * Actualiza un libro existente
 */
export async function updateBook(id, bookData) {
  if (!bookData.title || !bookData.title.trim()) {
    const err = new Error('El título del libro es obligatorio.');
    err.status = 400;
    throw err;
  }

  if (bookData.level && !BOOK_LEVELS.includes(bookData.level)) {
    const err = new Error(`El nivel debe ser uno de los permitidos: ${BOOK_LEVELS.join(', ')}.`);
    err.status = 400;
    throw err;
  }

  const index = inMemoryBooks.findIndex(b => String(b.id) === String(id));
  if (index === -1) {
    const notFound = new Error('Libro no encontrado.');
    notFound.status = 404;
    throw notFound;
  }

  const duplicate = inMemoryBooks.some(b => 
    String(b.id) !== String(id) && 
    b.title.trim().toLowerCase() === bookData.title.trim().toLowerCase()
  );
  if (duplicate) {
    const err = new Error('Ese título de libro ya existe en el catálogo.');
    err.status = 409;
    throw err;
  }

  inMemoryBooks[index] = {
    ...inMemoryBooks[index],
    ...bookData,
    id: inMemoryBooks[index].id
  };
  return inMemoryBooks[index];
}

/**
 * Da de baja lógica un libro del catálogo
 */
export async function deleteBook(id) {
  const index = inMemoryBooks.findIndex(b => String(b.id) === String(id));
  if (index !== -1) {
    inMemoryBooks[index].is_active = false;
  }
  return { success: true };
}

/**
 * Obtiene el listado de lecturas asignadas (FE-21, FE-22).
 */
export async function getReadings(params = {}) {
  const query = new URLSearchParams();
  if (params.student_id) query.set('student_id', params.student_id);
  if (params.status) query.set('status', params.status);

  const queryString = query.toString() ? `?${query.toString()}` : '';

  try {
    const res = await request(`/readings${queryString}`, { method: 'GET' });
    let rawList = null;
    if (res && Array.isArray(res.items)) rawList = res.items;
    else if (Array.isArray(res)) rawList = res;

    if (rawList !== null) {
      const items = rawList.map(item => ({
        ...item,
        status: (item.status === 'en curso' || item.status === 'en_curso' || !item.end_date) ? 'en_curso' : 'finalizada',
        book_title: item.book_title || item.title || item.book || '',
        title: item.book_title || item.title || item.book || '',
        book_level: item.book_level || item.level || '0',
        level: item.level || item.book_level || '0'
      }));
      return {
        items,
        total: res.total !== undefined ? res.total : items.length
      };
    }
  } catch (err) {
    if (err.status !== 0) {
      console.warn('Error al consultar lecturas del backend:', err);
    }
  }

  let items = [...inMemoryReadings];

  if (params.student_id) {
    items = items.filter(r => String(r.student_id) === String(params.student_id));
  }

  if (params.status) {
    items = items.filter(r => r.status === params.status);
  }

  return {
    items,
    total: items.length
  };
}

/**
 * Asigna un libro a un alumno (FE-21 / BE-23).
 */
export async function assignBook(readingData) {
  if (!readingData.student_id) {
    const err = new Error('Debes seleccionar un alumno.');
    err.status = 400;
    throw err;
  }

  const book = inMemoryBooks.find(b => String(b.id) === String(readingData.book_id));
  const bookTitle = (readingData.book_title || readingData.title || (book ? book.title : '')).trim();

  if (!readingData.book_id && !bookTitle) {
    const err = new Error('Debes seleccionar un libro del catálogo.');
    err.status = 400;
    throw err;
  }

  if (!readingData.start_date) {
    const err = new Error('La fecha de inicio de lectura es obligatoria.');
    err.status = 400;
    throw err;
  }

  // Si se proporciona fecha de fin, validar coherencia
  if (readingData.end_date && readingData.end_date < readingData.start_date) {
    const err = new Error('La fecha de fin no puede ser anterior a la de inicio.');
    err.status = 422;
    throw err;
  }

  const payload = {
    book_title: bookTitle,
    title: bookTitle,
    book: bookTitle,
    level: readingData.level || readingData.book_level || (book ? book.level : '0'),
    start_date: readingData.start_date,
    end_date: readingData.end_date || null,
    copies_note: readingData.copies_note || (book ? book.copies : null),
    sessions_note: readingData.sessions_note || null
  };
  if (readingData.test_id || (book && book.test_id)) {
    payload.test_id = readingData.test_id || (book && book.test_id);
  }
  if (readingData.test_code || (book && book.test_code)) {
    payload.test_code = readingData.test_code || (book && book.test_code);
  }

  try {
    const res = await request(`/students/${readingData.student_id}/books`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res) {
      return {
        ...res,
        status: (res.status === 'en curso' || res.status === 'en_curso' || !res.end_date) ? 'en_curso' : 'finalizada',
        book_title: res.book_title || res.title || res.book || payload.book_title,
        book_level: res.book_level || res.level || payload.level,
        level: res.level || res.book_level || payload.level
      };
    }
  } catch (error) {
    if (error.status === 422 || error.status === 409 || error.status === 400 || error.status === 403 || error.status === 404) {
      throw error;
    }
    // Fallback local solo en modo offline / pruebas unitarias sin backend (status 0)
    if (error.status === 0) {
      const newReading = {
        id: nextReadingId++,
        student_id: readingData.student_id,
        student_name: readingData.student_name || 'Alumno',
        book_id: readingData.book_id || nextReadingId,
        book_title: bookTitle || 'Libro',
        book_level: payload.level,
        start_date: readingData.start_date,
        end_date: readingData.end_date || null,
        status: readingData.end_date ? 'finalizada' : 'en_curso'
      };
      inMemoryReadings.unshift(newReading);
      return newReading;
    }
    throw error;
  }
}

/**
 * Cierra una lectura asignando la fecha de fin (FE-22 / BE-24).
 */
export async function closeReading(readingId, { end_date }) {
  if (!end_date) {
    const err = new Error('Debes especificar la fecha de fin de la lectura.');
    err.status = 400;
    throw err;
  }

  try {
    const res = await request(`/readings/${readingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ end_date })
    });
    return {
      ...res,
      status: (res.status === 'en curso' || res.status === 'en_curso' || !res.end_date) ? 'en_curso' : 'finalizada'
    };
  } catch (error) {
    if (error.status === 422 || error.status === 404 || error.status === 403) {
      throw error;
    }

    if (error.status === 0) {
      const index = inMemoryReadings.findIndex(r => String(r.id) === String(readingId));
      if (index === -1) {
        const notFound = new Error('Lectura no encontrada.');
        notFound.status = 404;
        throw notFound;
      }

      const reading = inMemoryReadings[index];
      if (end_date < reading.start_date) {
        const err = new Error('La fecha de fin no puede ser anterior a la de inicio.');
        err.status = 422;
        throw err;
      }

      inMemoryReadings[index] = {
        ...reading,
        end_date,
        status: 'finalizada'
      };
      return inMemoryReadings[index];
    }
    throw error;
  }
}

/**
 * Reabre una lectura finalizada retirando la fecha de fin (FE-22 / BE-24).
 */
export async function reopenReading(readingId) {
  try {
    const res = await request(`/readings/${readingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ end_date: null })
    });
    return {
      ...res,
      status: 'en_curso'
    };
  } catch (error) {
    if (error.status === 404 || error.status === 403) {
      throw error;
    }
    if (error.status === 0) {
      const index = inMemoryReadings.findIndex(r => String(r.id) === String(readingId));
      if (index !== -1) {
        inMemoryReadings[index] = {
          ...inMemoryReadings[index],
          end_date: null,
          status: 'en_curso'
        };
        return inMemoryReadings[index];
      }
    }
    throw error;
  }
}

