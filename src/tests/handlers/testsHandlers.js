import { http, HttpResponse } from 'msw';

const mockTests = [
  {
    id: '1',
    code: '1IF',
    name: 'La Vaca',
    words: 299,
    course: 1,
    test_letter: 'I',
    type: 'F',
    created_at: '2024-01-15',
    updated_at: '2024-01-15'
  },
  {
    id: '2',
    code: '1AF',
    name: 'El Patito Feo',
    words: 350,
    course: 1,
    test_letter: 'A',
    type: 'F',
    created_at: '2024-01-20',
    updated_at: '2024-01-20'
  },
  {
    id: '3',
    code: '2BL',
    name: 'El Príncipe Feliz',
    words: 450,
    course: 2,
    test_letter: 'B',
    type: 'L',
    created_at: '2024-02-10',
    updated_at: '2024-02-10'
  }
];

export const testsHandlers = [
  http.get('/api/v1/tests', ({ request }) => {
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter');
    const course = url.searchParams.get('course');
    const type = url.searchParams.get('type');
    const test_letter = url.searchParams.get('test_letter');
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';

    let filtered = [...mockTests];

    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filtered = filtered.filter(
        t => t.code.toLowerCase().includes(lowerFilter) ||
             t.name.toLowerCase().includes(lowerFilter)
      );
    }

    if (course) {
      filtered = filtered.filter(t => t.course === parseInt(course, 10));
    }

    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }

    if (test_letter) {
      filtered = filtered.filter(t => t.test_letter === test_letter);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paged = filtered.slice(start, end);

    return HttpResponse.json({
      items: paged,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(filtered.length / limitNum)
    });
  }),

  http.post('/api/v1/tests', async ({ request }) => {
    const body = await request.json();
    const { code, name, words, course, test_letter, type } = body;

    if (!code || !name) {
      return HttpResponse.json(
        { error: 'Código y nombre son requeridos' },
        { status: 400 }
      );
    }

    const exists = mockTests.find(t => t.code === code);
    if (exists) {
      return HttpResponse.json(
        { error: 'Ese código ya existe en el catálogo.' },
        { status: 409 }
      );
    }

    const newTest = {
      id: String(mockTests.length + 1),
      code,
      name,
      words: parseInt(words, 10),
      course: course ? parseInt(course, 10) : null,
      test_letter: test_letter || null,
      type: type || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockTests.push(newTest);

    return HttpResponse.json(newTest, { status: 201 });
  }),

  http.put('/api/v1/tests/:id', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json();
    const { code, name, words, course, test_letter, type } = body;

    const test = mockTests.find(t => t.id === id);
    if (!test) {
      return HttpResponse.json(
        { error: 'Prueba no encontrada' },
        { status: 404 }
      );
    }

    if (!code || !name) {
      return HttpResponse.json(
        { error: 'Código y nombre son requeridos' },
        { status: 400 }
      );
    }

    const codeExists = mockTests.find(t => t.code === code && t.id !== id);
    if (codeExists) {
      return HttpResponse.json(
        { error: 'Ese código ya existe en el catálogo.' },
        { status: 409 }
      );
    }

    test.code = code;
    test.name = name;
    test.words = parseInt(words, 10);
    test.course = course ? parseInt(course, 10) : null;
    test.test_letter = test_letter || null;
    test.type = type || null;
    test.updated_at = new Date().toISOString();

    return HttpResponse.json(test);
  }),

  http.delete('/api/v1/tests/:id', ({ params }) => {
    const { id } = params;
    const index = mockTests.findIndex(t => t.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Prueba no encontrada' },
        { status: 404 }
      );
    }

    mockTests.splice(index, 1);

    return HttpResponse.json({ message: 'Prueba eliminada' });
  })
];
