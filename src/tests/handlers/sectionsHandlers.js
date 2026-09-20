import { http, HttpResponse } from 'msw';
import { matchesQuery } from '@/utils/search';

/**
 * Simulacros MSW del Bloque A (Marlen) — centros, secciones y alumnado (REPARTO §2).
 * Replican EXACTAMENTE el contrato de back-hares/app/api/v1/directory.py (BE-10),
 * de app/api/v1/students.py (BE-28) y del endpoint de búsqueda (BE-29).
 *
 * Regla: al desplegar el backend real, quitar estos handlers debe bastar.
 * La búsqueda usa las mismas utilidades de normalización que FE-27 para que
 * el comportamiento en dev sea idéntico al backend (acentos/mayúsculas).
 */

const centers = [
  { id: 'c-1', external_id: null, name: 'Centro Peñascal Norte', sections_count: 3 },
  { id: 'c-2', external_id: null, name: 'Centro Peñascal Sur', sections_count: 2 }
];

const sectionsByCenter = {
  'c-1': [
    { id: 's-1', external_id: null, name: '1º ESO A', academic_year: '2025-2026', center_id: 'c-1', students_count: 2 },
    { id: 's-2', external_id: null, name: '1º ESO B', academic_year: '2025-2026', center_id: 'c-1', students_count: 4 },
    { id: 's-3', external_id: null, name: '1º ESO C', academic_year: '2025-2026', center_id: 'c-1', students_count: 0 }
  ],
  'c-2': [
    { id: 's-4', external_id: null, name: '3º ESO A', academic_year: '2025-2026', center_id: 'c-2', students_count: 4 },
    { id: 's-5', external_id: null, name: '3º ESO B', academic_year: '2025-2026', center_id: 'c-2', students_count: 1 }
  ]
};

const studentsBySection = {
  's-1': [
    { id: 'stu-1', external_id: 'A-001', name: 'María García López' },
    { id: 'stu-2', external_id: 'A-002', name: 'Lucía Fernández Ortiz' }
  ],
  's-2': [
    { id: 'stu-3', external_id: 'A-003', name: 'Daniel Martínez Ruiz' },
    { id: 'stu-4', external_id: 'A-004', name: 'Carmen Sánchez Vega' },
    { id: 'stu-5', external_id: 'A-005', name: 'Álvaro Pérez Gil' },
    { id: 'stu-11', external_id: 'A-011', name: 'Iker Gómez Ruiz' }
  ],
  's-3': [],
  's-4': [
    { id: 'stu-6', external_id: 'A-006', name: 'Elena Torres Díaz' },
    { id: 'stu-7', external_id: 'A-007', name: 'Iker Gómez Ruiz' },
    { id: 'stu-8', external_id: 'A-008', name: 'Nora Alvarez Soto' },
    { id: 'stu-9', external_id: 'A-009', name: 'Pablo Vega Mena' }
  ],
  's-5': [
    { id: 'stu-10', external_id: 'A-010', name: 'Sara Domínguez Ibarra' }
  ]
};

const HISTORICAL_SECTION_2024 = {
  id: 's-6-2024',
  center_id: 'c-1',
  external_id: null,
  name: '6º Primaria',
  academic_year: '2024-2025',
  disabled_at: '2025-06-20',
  origin: 'alexia'
};

const sectionLookup = Object.values(sectionsByCenter).flat().reduce((acc, section) => {
  acc[section.id] = section;
  return acc;
}, {});
sectionLookup[HISTORICAL_SECTION_2024.id] = HISTORICAL_SECTION_2024;

const studentById = Object.values(studentsBySection).flat().reduce((acc, student) => {
  acc[student.id] = student;
  return acc;
}, {});

const studentSectionId = Object.entries(studentsBySection).reduce((acc, [sectionId, students]) => {
  for (const student of students) {
    acc[student.id] = sectionId;
  }
  return acc;
}, {});

function sectionDict(section) {
  return {
    id: section.id,
    center_id: section.center_id,
    external_id: section.external_id,
    name: section.name,
    academic_year: section.academic_year,
    disabled_at: null,
    origin: 'alexia'
  };
}

function makeRecord(student) {
  const section = sectionLookup[studentSectionId[student.id]] ?? null;

  const base = {
    id: student.id,
    external_id: student.external_id,
    name: student.name,
    birth_date: null,
    age: null,
    gender: null,
    academic_status: null,
    sector: null,
    disabled_at: null,
    sections: {
      current: [],
      historical: []
    },
    current_sections: [],
    historical_sections: [],
    results: [],
    readings: [],
    total_results: 0,
    total_readings: 0
  };

  if (student.id === 'stu-1') {
    const current = {
      ...sectionDict(section),
      enrollment_date: '2025-09-05'
    };
    const historical = {
      ...sectionDict(sectionLookup['s-6-2024']),
      enrollment_date: '2024-09-03'
    };
    base.birth_date = '2013-04-12';
    base.age = 13;
    base.sections = { current: [current], historical: [historical] };
    base.current_sections = [current];
    base.historical_sections = [historical];
    base.results = [
      {
        id: 'r-1',
        student_id: student.id,
        section_id: 's-1',
        test_id: 't-1',
        test_date: '2025-09-10',
        time: 40,
        successes: 85,
        mistakes: 15,
        test_code: 'RFB-1',
        test_name: 'Batería RFB-1',
        test_words: 100,
        words: 100,
        ppm: 150,
        comprehension: 85,
        accuracy: 85,
        vef: 127.5
      },
      {
        id: 'r-2',
        student_id: student.id,
        section_id: 's-1',
        test_id: 't-1',
        test_date: '2025-09-17',
        time: 43,
        successes: 92,
        mistakes: 8,
        test_code: 'RFB-1',
        test_name: 'Batería RFB-1',
        test_words: 100,
        words: 100,
        ppm: 139.5,
        comprehension: 92,
        accuracy: 92,
        vef: 128.3
      },
      {
        id: 'r-3',
        student_id: student.id,
        section_id: 's-1',
        test_id: 't-2',
        test_date: '2025-09-24',
        time: 55,
        successes: 58,
        mistakes: 42,
        test_code: 'RFB-2',
        test_name: 'Batería RFB-2',
        test_words: 110,
        words: 110,
        ppm: 120,
        comprehension: 58,
        accuracy: 58,
        vef: 69.6
      },
      {
        id: 'r-4',
        student_id: student.id,
        section_id: 's-1',
        test_id: 't-2',
        test_date: '2025-10-02',
        time: 45,
        successes: 70,
        mistakes: 30,
        test_code: 'RFB-2',
        test_name: 'Batería RFB-2',
        test_words: 120,
        words: 120,
        ppm: 160,
        comprehension: 70,
        accuracy: 70,
        vef: 112
      }
    ];
    base.readings = [
      {
        id: 'rd-1',
        student_id: student.id,
        book_id: 'b-1',
        book_title: 'El Principito',
        title: 'El Principito',
        book_level: 'B1',
        level: 'B1',
        start_date: '2025-09-08',
        end_date: '2025-09-22',
        status: 'finalizada'
      },
      {
        id: 'rd-2',
        student_id: student.id,
        book_id: 'b-2',
        book_title: 'La vuelta al mundo en 80 días',
        title: 'La vuelta al mundo en 80 días',
        book_level: 'B1',
        level: 'B1',
        start_date: '2025-10-01',
        end_date: null,
        status: 'en curso'
      }
    ];
    base.total_results = base.results.length;
    base.total_readings = base.readings.length;
  } else if (section) {
    const current = {
      ...sectionDict(section),
      enrollment_date: '2025-09-05'
    };
    base.sections = { current: [current], historical: [] };
    base.current_sections = [current];
  } else {
    base.sections = { current: [], historical: [] };
  }

  return base;
}

function itemSections(student) {
  const sections = [];
  for (const [sectionId, students] of Object.entries(studentsBySection)) {
    if (students.some(s => s.id === student.id)) {
      const section = sectionLookup[sectionId];
      if (!section || !section.center_id) continue;
      const centerName = centers.find(c => c.id === section.center_id)?.name || null;
      sections.push({
        id: section.id,
        name: section.name,
        center: centerName,
        center_id: section.center_id
      });
    }
  }
  return sections;
}

export const sectionsHandlers = [
  http.get('/api/v1/centers', () => {
    return HttpResponse.json(centers);
  }),

  http.get('/api/v1/centers/:centerId/sections', ({ params }) => {
    const sections = sectionsByCenter[params.centerId];
    if (!sections) {
      return HttpResponse.json({ error: 'NOT_FOUND', message: 'El centro especificado no existe' }, { status: 404 });
    }
    return HttpResponse.json(sections);
  }),

  http.get('/api/v1/sections/:sectionId/students', ({ params }) => {
    const students = studentsBySection[params.sectionId];
    if (students === undefined) {
      return HttpResponse.json(
        { error: 'NOT_FOUND', message: 'La sección especificada no existe' },
        { status: 404 }
      );
    }
    return HttpResponse.json(students);
  }),

  http.get('/api/v1/students/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '10', 10) || 10);

    const matched = [];
    for (const student of Object.values(studentById)) {
      if (matchesQuery(student.name, q)) {
        matched.push({
          id: student.id,
          name: student.name,
          external_id: student.external_id,
          sections: itemSections(student)
        });
      }
    }

    const start = (page - 1) * limit;
    const items = matched.slice(start, start + limit);

    return HttpResponse.json({
      items,
      total: matched.length,
      page,
      limit,
      pages: matched.length > 0 ? Math.ceil(matched.length / limit) : 1
    });
  }),

  http.get('/api/v1/students/:studentId', ({ params }) => {
    const student = studentById[params.studentId];
    if (!student) {
      return HttpResponse.json({ error: 'NOT_FOUND', message: 'El alumno no existe' }, { status: 404 });
    }
    return HttpResponse.json(makeRecord(student));
  })
];