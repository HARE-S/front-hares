/**
 * Normalización de términos de búsqueda (FE-27, Escenarios 2 y 5).
 * Insensible a mayúsculas y acentos: "Alvarez" == "alvarez", "María" == "maria".
 * Compartido por el componente y por el simulacro MSW de BE-29 para que el
 * comportamiento en desarrollo replique exactamente el backend real.
 */

export function normalizeSearchTerm(term) {
  return String(term ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function matchesQuery(name, query) {
  const normalizedName = normalizeSearchTerm(name);
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) {
    return false;
  }
  return normalizedName.includes(normalizedQuery);
}