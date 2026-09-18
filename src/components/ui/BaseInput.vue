<script setup>
import { computed } from 'vue';
import { AlertCircle, Info, TriangleAlert } from 'lucide-vue-next';

/**
 * Campo de formulario con validación en cliente (FE-12 / T-FE12-02).
 *
 * Patrón de la historia:
 *  - `error`     -> mensaje junto al campo (clase .input--error + .field__error)
 *  - `hint`      -> ayuda no bloqueante (.field__hint)
 *  - `suspicious`-> aviso de valor sospechoso, NO bloquea el envío (.notice--warn)
 *
 * El componente NO decide validar: la vista madre le pasa `error` ya calculado
 * (desde src/utils/validation.js) y el campo solo lo representa.
 *
 * Emite:
 *  - `update:modelValue` — al teclear
 *  - `blur`              — al salir del campo (para avisos tipo Escenario 5)
 */

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'number', 'email', 'password', 'date'].includes(v),
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  suspicious: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'blur']);

const inputId = computed(() =>
  props.label ? `field-${props.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined
);

function onInput(event) {
  let value = event.target.value;
  if (props.type === 'number') {
    value = value === '' ? '' : Number(value);
  }
  emit('update:modelValue', value);
}
</script>

<template>
  <div
    class="field"
    :class="{ 'field--error': error, 'field--required': required }"
  >
    <label v-if="label" :for="inputId" class="field__label">
      {{ label }}
      <span v-if="required" class="field__asterisk" aria-hidden="true">*</span>
    </label>

    <input
      :id="inputId"
      class="input"
      :class="{ 'input--error': error }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      @input="onInput"
      @blur="$emit('blur', $event)"
    />

    <p v-if="error" :id="`${inputId}-error`" class="field__error" role="alert">
      <AlertCircle :size="14" aria-hidden="true" />
      {{ error }}
    </p>

    <p v-else-if="hint" class="field__hint">
      <Info :size="14" aria-hidden="true" />
      {{ hint }}
    </p>

    <p
      v-if="suspicious"
      class="notice notice--warn"
      role="status"
    >
      <TriangleAlert :size="14" aria-hidden="true" />
      {{ suspicious }}
    </p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.field__asterisk {
  color: var(--red-600, #dc2626);
  margin-left: 0.15rem;
}

.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  color: var(--gray-800, #1e293b);
  background: var(--gray-50, #f7f9fb);
  border: 1px solid var(--gray-300, #cbd5e1);
  border-radius: var(--radius-md, 0.5rem);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: var(--green-600, #059669);
  box-shadow: 0 0 0 3px var(--green-100, #d1fae5);
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input--error {
  border-color: var(--red-600, #dc2626);
  background: var(--red-50, #fef2f2);
}

.input--error:focus {
  border-color: var(--red-600, #dc2626);
  box-shadow: 0 0 0 3px var(--red-100, #fee2e2);
}

.field__error {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--red-600, #dc2626);
}

.field__hint {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0;
  font-size: 0.8rem;
  color: var(--gray-500, #64748b);
}

.notice {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0;
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: var(--radius-sm, 0.375rem);
}

/* Avísos: el valor no se bloquea, solo se marca (Escenario 5). */
.notice--warn {
  color: var(--amber-700, #b45309);
  background: var(--amber-50, #fffbeb);
  border: 1px solid var(--amber-200, #fde68a);
}
</style>