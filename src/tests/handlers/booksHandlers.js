import { http, HttpResponse } from 'msw';

let mockBooks = [
  { id: 1, title: 'El Quijote', author: 'Cervantes', isbn: '978-0-123456-78-9', level: 'Avanzado', category: 'Clásica' },
  { id: 2, title: 'La Casa de Bernarda Alba', author: 'García Lorca', isbn: '978-0-123456-79-6', level: 'En nivel', category: 'Drama' },
  { id: 3, title: 'El Principito', author: 'Saint-Exupéry', isbn: '978-0-123456-80-2', level: 'Inicial', category: 'Infantil' },
  { id: 4, title: 'Cien años de soledad', author: 'García Márquez', isbn: '978-0-123456-81-9', level: 'Avanzado', category: 'Realismo mágico' },
  { id: 5, title: 'La sombra del viento', author: 'Carlos Ruiz Zafón', isbn: '978-0-123456-82-6', level: 'En nivel', category: 'Misterio' }
];

export const booksHandlers = [
  http.get('/api/v1/books', ({ request }) => {
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    let filtered = [...mockBooks];

    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(lowerFilter) ||
        b.author.toLowerCase().includes(lowerFilter)
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paged = filtered.slice(start, end);

    return HttpResponse.json({
      items: paged,
      total: filtered.length,
      page,
      limit,
      pages: Math.ceil(filtered.length / limit)
    });
  }),

  http.post('/api/v1/books', async ({ request }) => {
    const body = await request.json();
    const { title, author, isbn, level, category } = body;

    if (!title || !author) {
      return HttpResponse.json(
        { error: 'Título y autor son requeridos' },
        { status: 400 }
      );
    }

    const newBook = {
      id: Math.max(...mockBooks.map(b => b.id), 0) + 1,
      title,
      author,
      isbn: isbn || null,
      level: level || null,
      category: category || null
    };

    mockBooks.push(newBook);
    console.log('[MSW] Libro creado:', newBook);

    return HttpResponse.json(newBook, { status: 201 });
  }),

  http.put('/api/v1/books/:id', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json();
    const book = mockBooks.find(b => b.id === parseInt(id, 10));

    if (!book) {
      return HttpResponse.json(
        { error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    book.title = body.title || book.title;
    book.author = body.author || book.author;
    book.isbn = body.isbn || book.isbn;
    book.level = body.level || book.level;
    book.category = body.category || book.category;

    return HttpResponse.json(book);
  }),

  http.delete('/api/v1/books/:id', ({ params }) => {
    const { id } = params;
    const index = mockBooks.findIndex(b => b.id === parseInt(id, 10));

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    mockBooks.splice(index, 1);

    return HttpResponse.json({ message: 'Libro eliminado' });
  })
];
