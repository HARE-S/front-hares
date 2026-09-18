import { http, HttpResponse } from 'msw';

const mockMetrics = {
  speed: {
    current: 115,
    unit: 'PPM',
    delta: '+8% vs. Corte Inicial',
    target: 125,
    percentage: 92
  },
  students: {
    evaluated: 24,
    total: 26,
    percentage: 92,
    pendingCount: 2,
    pendingPeriod: 'Corte A'
  },
  books: {
    count: 68,
    unit: 'títulos',
    delta: '+14 este mes',
    averagePerStudent: 2.6
  },
  alerts: {
    count: 3,
    label: 'Requieren Apoyo',
    criteria: 'PPM < 85 o > 5% errores'
  }
};

const mockFluencyData = {
  trimestral: {
    period: 'trimestral',
    dataPoints: [
      { label: 'Diagnóstica', aula: 85, baremo: 90 },
      { label: 'Corte A', aula: 95, baremo: 100 },
      { label: 'Corte B', aula: 110, baremo: 110 },
      { label: 'Corte C', aula: 125, baremo: 125 }
    ],
    target: 125
  },
  anual: {
    period: 'anual',
    dataPoints: [
      { label: 'Sep 2024', aula: 85, baremo: 90 },
      { label: 'Dic 2024', aula: 100, baremo: 105 },
      { label: 'Mar 2025', aula: 115, baremo: 120 },
      { label: 'Jun 2025', aula: 130, baremo: 130 }
    ],
    target: 130
  }
};

const mockLevelsDistribution = {
  levels: [
    { level: 'Avanzado', count: 8, percentage: 31, color: '#10b981' },
    { level: 'En nivel', count: 14, percentage: 54, color: '#3b82f6' },
    { level: 'Requiere apoyo', count: 4, percentage: 15, color: '#f97316' }
  ],
  total: 26
};

const mockAssessments = [
  {
    id: 1,
    studentName: 'Lucas Méndez Ruiz',
    initials: 'LM',
    testCode: '3AF',
    testTitle: 'El bosque animado',
    testType: 'Texto Continuo',
    date: '24 Ene 2025',
    speed: 128,
    accuracy: 98.5,
    comprehension: '4/4',
    level: 'Avanzado'
  },
  {
    id: 2,
    studentName: 'Sofía Navarro Ortiz',
    initials: 'SN',
    testCode: '3AF',
    testTitle: 'El bosque animado',
    testType: 'Texto Continuo',
    date: '24 Ene 2025',
    speed: 118,
    accuracy: 96.0,
    comprehension: '4/4',
    level: 'En nivel'
  },
  {
    id: 3,
    studentName: 'Mateo Barrenechea',
    initials: 'MB',
    testCode: '3BL',
    testTitle: 'Aventuras en el mar',
    testType: 'Lectura de Palabras',
    date: '23 Ene 2025',
    speed: 82,
    accuracy: 88.0,
    comprehension: '2/4',
    level: 'Requiere apoyo'
  },
  {
    id: 4,
    studentName: 'Aitana Zubizarreta',
    initials: 'AZ',
    testCode: '3AF',
    testTitle: 'El bosque animado',
    testType: 'Texto Continuo',
    date: '23 Ene 2025',
    speed: 115,
    accuracy: 95.0,
    comprehension: '3/4',
    level: 'En nivel'
  },
  {
    id: 5,
    studentName: 'Javi Ruiz Gómez',
    initials: 'JR',
    testCode: '3CF',
    testTitle: 'Historia de un gato',
    testType: 'Texto Continuo',
    date: '22 Ene 2025',
    speed: 138,
    accuracy: 99.0,
    comprehension: '4/4',
    level: 'Avanzado'
  },
  {
    id: 6,
    studentName: 'Paula Rodríguez López',
    initials: 'PR',
    testCode: '3AF',
    testTitle: 'El bosque animado',
    testType: 'Texto Continuo',
    date: '22 Ene 2025',
    speed: 98,
    accuracy: 92.0,
    comprehension: '2/4',
    level: 'Requiere apoyo'
  },
  {
    id: 7,
    studentName: 'Alejandro Fernández',
    initials: 'AF',
    testCode: '3BL',
    testTitle: 'Aventuras en el mar',
    testType: 'Lectura de Palabras',
    date: '21 Ene 2025',
    speed: 125,
    accuracy: 97.5,
    comprehension: '4/4',
    level: 'Avanzado'
  },
  {
    id: 8,
    studentName: 'Marta García Sánchez',
    initials: 'MG',
    testCode: '3DF',
    testTitle: 'Los viajes de Marco',
    testType: 'Texto Continuo',
    date: '21 Ene 2025',
    speed: 105,
    accuracy: 94.0,
    comprehension: '3/4',
    level: 'En nivel'
  }
];

export const dashboardHandlers = [
  http.get('/api/v1/dashboard/metrics', ({ request }) => {
    const url = new URL(request.url);
    const sectionId = url.searchParams.get('section_id');

    return HttpResponse.json({
      data: mockMetrics,
      sectionId: sectionId || 'default'
    });
  }),

  http.get('/api/v1/dashboard/fluency', ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'trimestral';
    const sectionId = url.searchParams.get('section_id');

    const data = mockFluencyData[period] || mockFluencyData.trimestral;

    return HttpResponse.json({
      data,
      sectionId: sectionId || 'default'
    });
  }),

  http.get('/api/v1/dashboard/levels-distribution', ({ request }) => {
    const url = new URL(request.url);
    const sectionId = url.searchParams.get('section_id');

    return HttpResponse.json({
      data: mockLevelsDistribution,
      sectionId: sectionId || 'default'
    });
  }),

  http.get('/api/v1/dashboard/assessments', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const sectionId = url.searchParams.get('section_id');

    const items = mockAssessments.slice(0, limit);

    return HttpResponse.json({
      items,
      total: mockAssessments.length,
      limit,
      sectionId: sectionId || 'default'
    });
  }),

  http.get('/api/v1/dashboard/export', ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';

    if (format === 'csv') {
      const csv = [
        ['Alumno', 'Código', 'Prueba', 'Fecha', 'Velocidad', 'Exactitud', 'Comprensión', 'Nivel'],
        ...mockAssessments.map(a => [
          a.studentName,
          a.testCode,
          a.testTitle,
          a.date,
          `${a.speed} PPM`,
          `${a.accuracy}%`,
          a.comprehension,
          a.level
        ])
      ]
        .map(row => row.join(','))
        .join('\n');

      return new HttpResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="evaluaciones.csv"'
        }
      });
    }

    return HttpResponse.json({
      message: 'Formato no soportado. Use: csv',
      format
    }, { status: 400 });
  })
];
