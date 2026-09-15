import { authHandlers } from './handlers/authHandlers';

/**
 * Agregado de manejadores MSW de todo el equipo.
 * Cada persona exporta sus manejadores desde `tests/handlers/` y los
 * añade aquí con spread; ningún fichero único se edita entre todos.
 */
export const handlers = [...authHandlers];