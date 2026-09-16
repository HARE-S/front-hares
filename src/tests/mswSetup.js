import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/authHandlers';

export const server = setupServer(...authHandlers);

if (import.meta.env.DEV) {
  server.listen({ onUnhandledRequest: 'bypass' });
}
