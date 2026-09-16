import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/authHandlers';

export const worker = setupWorker(...authHandlers);

// En desarrollo, MSW debe estar listo antes de cualquier petición
export const mswReady = import.meta.env.DEV
  ? worker.start({ onUnhandledRequest: 'bypass' })
  : Promise.resolve();
