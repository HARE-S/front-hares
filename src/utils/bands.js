/**
 * Clasificación de bandas de la batería de lectura eficaz (HARE-S / FE-02, FE-26).
 * La banda se obtiene de la velocidad eficaz (vef):
 * - 'baja'   -> vef por debajo del umbral bajo.
 * - 'normal' -> vef entre el umbral bajo y el alto, ambos inclusive.
 * - 'alta'   -> vef por encima del umbral alto.
 * - 'nodata' -> sin dato (nunca se clasifica como baja un alumno sin prueba).
 *
 * Los umbrales por defecto (25 / 85) replican FE-34; este módulo es la fuente
 * provisional y FE-34 la sustituye por el LevelBadge configurable.
 */

const DEFAULT_LOW_THRESHOLD = 25;
const DEFAULT_HIGH_THRESHOLD = 85;

export function classifyVefBand(vef, { low = DEFAULT_LOW_THRESHOLD, high = DEFAULT_HIGH_THRESHOLD } = {}) {
  if (vef === null || vef === undefined || vef === '' || Number.isNaN(Number(vef))) {
    return 'nodata';
  }
  const value = Number(vef);
  if (value < low) {
    return 'baja';
  }
  if (value <= high) {
    return 'normal';
  }
  return 'alta';
}

export const VEF_BAND_LABELS = {
  alta: 'Alta',
  normal: 'Normal',
  baja: 'Baja',
  nodata: 'Sin dato',
};

const BAND_CLASSES = {
  alta: 'badge-alta',
  normal: 'badge-normal',
  baja: 'badge-baja',
  nodata: 'badge-nodata',
};

export function vefBandClass(band) {
  return BAND_CLASSES[band] || 'badge-nodata';
}