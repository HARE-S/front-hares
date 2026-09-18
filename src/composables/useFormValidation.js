import { reactive, ref } from 'vue';
import { mapServerErrors } from '../utils/errors';

/**
 * Gestiona el estado + validación de un formulario (FE-12 / T-FE12-04).
 *
 * Patrón por campo:
 *  - `value`            — el valor tecleado (jamás se toca con los errores)
 *  - `touched`          — true cuando el usuario salió del campo (blur)
 *  - `error`            — primer mensaje (validación cliente o servidor)
 *  - `suspiciousText`   — aviso NO bloqueante (Escenario 5)
 *  - `isSubmitting`     — flag global para deshabilitar el botón
 *
 * Escenarios cubiertos:
 *  1. Validación ANTES de enviar (`validate()`): si hay errores, no se llama
 *     al handler (no se dispara la petición).
 *  2. Error del servidor junto al campo: `submit` atrapa el ApiError y
 *     reparte los mensajes por campo (`mapServerErrors` + fieldMap).
 *  3. No se pierde lo tecleado: los valores viven independientes de errores.
 *  4. Rangos numéricos: validadores en cliente (validation.js).
 *  5. Aviso sospechoso con blur: se marca, pero NO impide el envío.
 */

export function useFormValidation() {
  const fields = reactive({});
  const initialValues = {};
  const isSubmitting = ref(false);
  const globalError = ref(null);

  /**
   * Declara un campo del formulario.
   * @param {string} name
   * @param {Object} [opts]
   * @param {*} [opts.value] — valor inicial
   * @param {Function[]} [opts.validators] — (value) => mensaje | null
   * @param {Function|null} [opts.suspicious] — (value) => texto aviso | null
   */
  function defineField(name, { value = '', validators = [], suspicious = null } = {}) {
    initialValues[name] = value;
    fields[name] = reactive({
      value,
      validators: [...validators],
      suspiciousValidator: suspicious,
      touched: false,
      error: null,
      suspiciousText: null,
    });
    return fields[name];
  }

  function setValue(name, value) {
    if (!fields[name]) return;
    fields[name].value = value;
    // Al teclear se limpia el error (cliente o servidor) y el aviso antiguo;
    // la validación se re-evalúa al salir del campo (blur).
    fields[name].error = null;
    fields[name].suspiciousText = null;
  }

  function validateField(field) {
    for (const validator of field.validators) {
      const message = validator(field.value);
      if (message) {
        field.error = message;
        return field.error;
      }
    }
    field.error = null;
    return null;
  }

  function updateSuspicious(field) {
    if (!field.suspiciousValidator) {
      field.suspiciousText = null;
      return null;
    }
    field.suspiciousText = field.suspiciousValidator(field.value) || null;
    return field.suspiciousText;
  }

  function blurField(name) {
    const field = fields[name];
    if (!field) return null;
    field.touched = true;
    updateSuspicious(field);
    return validateField(field);
  }

  /** Escenario 1: valida todo; si hay error no se debería llamar al handler. */
  function validate() {
    const errors = {};
    let valid = true;
    for (const [name, field] of Object.entries(fields)) {
      errors[name] = validateField(field);
      if (errors[name]) valid = false;
    }
    return { valid, errors };
  }

  /** Escenario 2: reparte los errores del servidor por campo + global. */
  function applyServerErrors(err, fieldMap = {}) {
    const { errors: fieldErrors, global } = mapServerErrors(err, fieldMap);
    for (const [name, message] of Object.entries(fieldErrors)) {
      if (fields[name]) fields[name].error = message;
    }
    globalError.value = global;
    return { fieldErrors, global };
  }

  function clearErrors() {
    for (const field of Object.values(fields)) {
      field.error = null;
      field.suspiciousText = null;
    }
    globalError.value = null;
  }

  /**
   * Envía el formulario protegido por la validación.
   * @param {Function} handler — async (values) => respuesta
   * @param {Object} fieldMap — traducción clave backend -> campo form
   * @returns {Promise<{ok:boolean, validation?:boolean, error?:Error, result?:*}>}
   */
  async function submit(handler, fieldMap = {}) {
    isSubmitting.value = true;
    globalError.value = null;
    try {
      const { valid } = validate();
      if (!valid) {
        return { ok: false, validation: true };
      }

      const values = {};
      for (const [name, field] of Object.entries(fields)) {
        values[name] = field.value;
      }

      const result = await handler(values);
      return { ok: true, result };
    } catch (err) {
      applyServerErrors(err, fieldMap);
      // Escenario 3: los valores tecleados siguen en `fields` intactos.
      return { ok: false, validation: false, error: err };
    } finally {
      isSubmitting.value = false;
    }
  }

  function reset() {
    for (const [name, value] of Object.entries(initialValues)) {
      fields[name].value = value;
      fields[name].touched = false;
      fields[name].error = null;
      fields[name].suspiciousText = null;
    }
    globalError.value = null;
  }

  return {
    fields,
    isSubmitting,
    globalError,
    defineField,
    setValue,
    validateField,
    updateSuspicious,
    blurField,
    validate,
    applyServerErrors,
    clearErrors,
    submit,
    reset,
  };
}