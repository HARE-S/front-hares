import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Servidor MSW global: simula la API a nivel de red.
 * Las pruebas usan `server.use(...)` para sobrescribir respuestas
 * concretas y `server.resetHandlers()` (en afterEach) las restaura.
 */
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());