import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/authHandlers';

export const worker = setupWorker(...authHandlers);

if (import.meta.env.DEV) {
  worker.start({ onUnhandledRequest: 'bypass' });
}
