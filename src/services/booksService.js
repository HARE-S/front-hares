import { request } from './api';

/**
 * Servicio para gestión de libros (biblioteca de lectura).
 */

export async function getBooks(params = {}) {
  const query = new URLSearchParams();
  if (params.filter) query.set('filter', params.filter);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/books${queryString}`, { method: 'GET' });
}

export async function createBook(bookData) {
  const payload = {
    title: bookData.title?.trim(),
    author: bookData.author?.trim(),
    isbn: bookData.isbn?.trim() || null,
    level: bookData.level || null,
    category: bookData.category || null
  };

  return request('/books', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateBook(bookId, bookData) {
  const payload = {
    title: bookData.title?.trim(),
    author: bookData.author?.trim(),
    isbn: bookData.isbn?.trim() || null,
    level: bookData.level || null,
    category: bookData.category || null
  };

  return request(`/books/${bookId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteBook(bookId) {
  return request(`/books/${bookId}`, {
    method: 'DELETE'
  });
}
