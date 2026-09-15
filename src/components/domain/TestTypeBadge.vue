<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: ''
  }
});

const normalizedType = computed(() => {
  if (!props.type) return null;
  const upper = props.type.toUpperCase().trim();
  if (upper === 'F' || upper === 'FUNCIONAL') {
    return {
      code: 'F',
      label: 'Funcional',
      className: 'badge badge--functional badge-green',
      title: 'Texto de control funcional'
    };
  }
  if (upper === 'L' || upper === 'LITERARIO') {
    return {
      code: 'L',
      label: 'Literario',
      className: 'badge badge--literary badge-emerald',
      title: 'Texto de control literario'
    };
  }
  return {
    code: upper,
    label: props.type,
    className: 'badge badge-gray',
    title: props.type
  };
});
</script>

<template>
  <span
    v-if="normalizedType"
    :class="normalizedType.className"
    :title="normalizedType.title"
  >
    {{ normalizedType.label }}
  </span>
  <span v-else class="text-muted">—</span>
</template>

<style scoped>
.badge--functional {
  background-color: var(--green-100, #d1fae5);
  color: var(--green-900, #064e3b);
  border: 1px solid var(--green-300, #6ee7b7);
}

.badge--literary {
  background-color: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}
</style>
