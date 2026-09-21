import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/authHandlers';
import { testsHandlers } from './handlers/testsHandlers';
import { dashboardHandlers } from './handlers/dashboardHandlers';
import { booksHandlers } from './handlers/booksHandlers';
import { sectionsHandlers } from './handlers/sectionsHandlers';
import { comparisonHandlers } from './handlers/comparisonHandlers';

export const worker = setupWorker(
  ...authHandlers,
  ...testsHandlers,
  ...dashboardHandlers,
  ...booksHandlers,
  ...sectionsHandlers,
  ...comparisonHandlers
);

// En desarrollo, MSW debe estar listo antes de cualquier petición
export const mswReady = import.meta.env.DEV
  ? worker.start({ onUnhandledRequest: 'bypass' })
  : Promise.resolve();
