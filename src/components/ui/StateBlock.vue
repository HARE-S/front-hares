<script setup>
import { computed } from 'vue';
import { AlertCircle, Inbox, RotateCcw, SearchX, ShieldAlert } from 'lucide-vue-next';

/**
 * Estado visual de cualquier pantalla (FE-11 / Contrato 3).
 * La vista madre decide el estado; este componente solo representa:
 *  - loading   -> esqueleto con la forma del contenido esperado
 *  - empty     -> sin datos + qué acción puede tomar el usuario
 *  - error     -> mensaje comprensible + botón "Reintentar" (emite @retry)
 *  - forbidden -> 403: acceso denegado, SIN redirigir al login
 *  - notfound  -> recurso inexistente (distinguible de "sin datos", Escenario 5)
 */

const props = defineProps({
  state: {
    type: String,
    required: true,
    validator: (value) => ['loading', 'empty', 'error', 'forbidden', 'notfound'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  retryable: {
    type: Boolean,
    default: true,
  },
  skeleton: {
    type: String,
    default: 'card',
    validator: (value) => ['card', 'table', 'detail'].includes(value),
  },
});

const emit = defineEmits(['retry']);

const DEFAULT_CONTENT = {
  empty: {
    title: 'No hay datos',
    message: 'Aún no hay contenido que mostrar en esta pantalla.',
  },
  error: {
    title: 'No se pudieron cargar los datos',
    message: 'Algo salió mal. Revisa tu conexión e inténtalo de nuevo.',
  },
  forbidden: {
    title: 'No tienes permiso para acceder',
    message: 'Tu rol no permite ver este contenido. Contacta con tu coordinador si crees que es un error.',
  },
  notfound: {
    title: 'No encontrado',
    message: 'El recurso solicitado no existe o ha sido eliminado.',
  },
};

const ICONS = {
  empty: Inbox,
  error: AlertCircle,
  forbidden: ShieldAlert,
  notfound: SearchX,
};

const StateIcon = computed(() => ICONS[props.state] || null);
const resolvedTitle = computed(() => props.title || DEFAULT_CONTENT[props.state]?.title || '');
const resolvedMessage = computed(() => props.message || DEFAULT_CONTENT[props.state]?.message || '');

function handleRetry() {
  emit('retry');
}
</script>

<template>
  <div
    class="state"
    :class="`state--${state}`"
    role="status"
    :aria-live="state === 'loading' ? 'polite' : 'assertive'"
  >
    <!-- Esqueleto de carga con la forma del contenido esperado (Escenario 1) -->
    <div v-if="state === 'loading'" class="state__skeleton skeleton" :class="`skeleton--${skeleton}`">
      <template v-if="skeleton === 'table'">
        <div class="skeleton-row skeleton-table-header">
          <div class="skeleton-line" style="width: 28%"></div>
          <div class="skeleton-line" style="width: 18%"></div>
          <div class="skeleton-line" style="width: 22%"></div>
        </div>
        <div v-for="n in 4" :key="n" class="skeleton-row">
          <div class="skeleton-line" style="width: 34%"></div>
          <div class="skeleton-line" style="width: 60%"></div>
        </div>
      </template>

      <template v-else-if="skeleton === 'detail'">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-line" style="width: 55%"></div>
        <div class="skeleton-line" style="width: 80%"></div>
        <div class="skeleton-line" style="width: 65%"></div>
      </template>

      <template v-else>
        <div class="skeleton-block" style="width: 30%"></div>
        <div class="skeleton-line" style="width: 90%"></div>
        <div class="skeleton-line" style="width: 70%"></div>
      </template>
    </div>

    <template v-else>
      <div v-if="StateIcon" class="state__icon">
        <component :is="StateIcon" :size="28" aria-hidden="true" />
      </div>

      <h2 v-if="resolvedTitle" class="state__title">{{ resolvedTitle }}</h2>
      <p v-if="resolvedMessage" class="state__text">{{ resolvedMessage }}</p>

      <!-- Acción sugerida según el estado (Escenario 2 y 3) -->
      <button
        v-if="state === 'error' && retryable"
        type="button"
        class="btn btn-primary"
        @click="handleRetry"
      >
        <RotateCcw :size="16" aria-hidden="true" />
        Reintentar
      </button>

      <!-- Acción/reforzado extra desde la vista madre -->
      <div v-else-if="$slots.default" class="state__action">
        <slot />
      </div>
    </template>
  </div>
</template>