import { http, HttpResponse } from 'msw';

/**
 * Simulacros MSW del Bloque A (Marlen) — centros, secciones y alumnado (REPARTO §2).
 * Replican EXACTAMENTE el contrato de back-hares/app/api/v1/directory.py (BE-10)
 * y de app/api/v1/students.py (BE-28): navegación FE-25, Ficha FE-26.
 *
 * Regla: al desplegar el backend real, quitar estos handlers debe bastar.
 */

const centers = [
  { id: 'c-1', external_id: null, name: 'Centro Peñascal Norte', sections_count: 3 },
  { id: 'c-2', external_id: null, name: 'Centro Peñascal Sur', sections_count: 2 }
];

const sectionsByCenter = {
  'c-1': [
    { id: 's-1', external_id: null, name: '1º ESO A', academic_year: '2025-2026', center_id: 'c-1', students_count: 2 },
    { id: 's-2', external_id: null, name: '1º ESO B', academic_year: '2025-2026', center_id: 'c-1', students_count: 3 },
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
    { id: 'stu-5', external_id: 'A-005', name: 'Álvaro Pérez Gil' }
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

function makeRecord(student) {
  return {
    id: student.id,
    name: student.name,
    grade: '3º ESO',
    section: '1º ESO A',
    currentSections: [
      { id: 's-1', name: '1º ESO A', teacher: 'Prof. López' }
    ],
    historicSections: [],
    tests: [],
    books: [],
    differences: { functional: [], literary: [] },
    stats: { averagePPM: 145, completedTests: 0, totalBooks: 0 }
  };
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

  http.get('/api/v1/students/:studentId', ({ params }) => {
    const allStudents = Object.values(studentsBySection).flat();
    const student = allStudents.find(s => s.id === params.studentId);
    if (!student) {
      return HttpResponse.json({ error: 'NOT_FOUND', message: 'El alumno no existe' }, { status: 404 });
    }
    return HttpResponse.json(makeRecord(student));
  })
];